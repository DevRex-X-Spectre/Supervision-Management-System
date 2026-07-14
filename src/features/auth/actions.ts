"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { verifyCredentials } from "@/lib/auth-credentials";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { writeAuditLog } from "@/lib/audit";
import { sendPasswordResetEmail } from "@/lib/email";
import { roleHome } from "@/lib/session";
import { isDatabaseUnavailableError } from "@/lib/db-error";
import type { ActionResult } from "@/types";
import type { Role } from "@prisma/client";

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Please check your email and password.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const verified = await verifyCredentials(parsed.data.email, parsed.data.password);
    if (!verified.ok) {
      if (verified.reason === "unavailable") {
        return {
          success: false,
          error: "The database is not responding right now. Please try again shortly.",
        };
      }
      return { success: false, error: "Invalid email or password." };
    }

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    await writeAuditLog({
      actorId: verified.user.id,
      action: "USER_LOGIN",
      entityType: "User",
      entityId: verified.user.id,
    });

    return {
      success: true,
      data: { redirectTo: roleHome(verified.user.role) } as unknown as undefined,
      message: roleHome(verified.user.role),
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        success: false,
        error: "The database is not responding right now. Please try again shortly.",
      };
    }
    if (error instanceof AuthError) {
      if ("code" in error && error.code === "service_unavailable") {
        return {
          success: false,
          error: "The database is not responding right now. Please try again shortly.",
        };
      }
      return { success: false, error: "Invalid email or password." };
    }
    // NextAuth may throw NEXT_REDIRECT; rethrow those
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    return { success: false, error: "Unable to sign in right now. Please try again." };
  }
}

export async function registerAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    department: formData.get("department"),
    matricNumber: formData.get("matricNumber") || undefined,
    staffId: formData.get("staffId") || undefined,
    phone: formData.get("phone") || undefined,
    title: formData.get("title") || undefined,
    specialization: formData.get("specialization") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    const firstMessage =
      parsed.error.issues[0]?.message ?? "Please check the form and try again.";
    return {
      success: false,
      error: firstMessage,
      fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  if (parsed.data.role === "STUDENT" && parsed.data.matricNumber) {
    const matric = await prisma.user.findUnique({
      where: { matricNumber: parsed.data.matricNumber },
    });
    if (matric) {
      return { success: false, error: "This matriculation number is already registered." };
    }
  }

  if (parsed.data.role === "SUPERVISOR" && parsed.data.staffId) {
    const staff = await prisma.user.findUnique({
      where: { staffId: parsed.data.staffId },
    });
    if (staff) {
      return { success: false, error: "This staff ID is already registered." };
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim(),
      role: parsed.data.role as Role,
      department: parsed.data.department,
      matricNumber: parsed.data.role === "STUDENT" ? parsed.data.matricNumber : null,
      staffId: parsed.data.role === "SUPERVISOR" ? parsed.data.staffId : null,
      phone: parsed.data.phone,
      title: parsed.data.title,
      specialization: parsed.data.specialization,
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "USER_REGISTERED",
    entityType: "User",
    entityId: user.id,
    metadata: { role: user.role, email: user.email },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  });

  return {
    success: true,
    message: roleHome(user.role),
  };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function forgotPasswordAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, error: "Enter a valid email address." };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid account enumeration
  if (!user) {
    return {
      success: true,
      message: "If an account exists for that email, a reset link has been sent.",
    };
  }

  const token = randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry },
  });

  await sendPasswordResetEmail({
    to: user.email,
    firstName: user.firstName,
    token,
  });

  await writeAuditLog({
    actorId: user.id,
    action: "PASSWORD_RESET_REQUESTED",
    entityType: "User",
    entityId: user.id,
  });

  return {
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  };
}

export async function resetPasswordAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: parsed.data.token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return { success: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "PASSWORD_RESET_COMPLETED",
    entityType: "User",
    entityId: user.id,
  });

  return { success: true, message: "Password updated. You can now sign in." };
}
