"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  assignSupervisorSchema,
  createUserByCoordinatorSchema,
  updateProfileSchema,
  updateUserStatusSchema,
} from "@/lib/validations/users";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import type { ActionResult } from "@/types";

export async function updateProfileAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = updateProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || null,
    department: formData.get("department") || null,
    title: formData.get("title") || null,
    specialization: formData.get("specialization") || null,
  });

  if (!parsed.success) {
    return { success: false, error: "Please check your profile details." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  revalidatePath(`/${user.role.toLowerCase()}/profile`);
  return { success: true, message: "Profile updated successfully." };
}

export async function assignSupervisorAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireUser(["COORDINATOR"]);
  const parsed = assignSupervisorSchema.safeParse({
    studentId: formData.get("studentId"),
    supervisorId: formData.get("supervisorId") || null,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid assignment data." };
  }

  const student = await prisma.user.findFirst({
    where: { id: parsed.data.studentId, role: "STUDENT" },
  });
  if (!student) return { success: false, error: "Student not found." };

  if (parsed.data.supervisorId) {
    const supervisor = await prisma.user.findFirst({
      where: { id: parsed.data.supervisorId, role: "SUPERVISOR", status: "ACTIVE" },
    });
    if (!supervisor) return { success: false, error: "Supervisor not found or inactive." };
  }

  await prisma.user.update({
    where: { id: student.id },
    data: { assignedSupervisorId: parsed.data.supervisorId },
  });

  await prisma.researchProject.updateMany({
    where: { studentId: student.id },
    data: { supervisorId: parsed.data.supervisorId },
  });

  if (parsed.data.supervisorId) {
    await createNotification({
      userId: student.id,
      type: "ASSIGNMENT",
      title: "Supervisor assigned",
      body: "A research supervisor has been assigned to you. You can now submit progress and chat.",
      link: "/student/project",
    });
    await createNotification({
      userId: parsed.data.supervisorId,
      type: "ASSIGNMENT",
      title: "New student assigned",
      body: `${student.firstName} ${student.lastName} has been assigned to your supervision.`,
      link: "/supervisor/students",
    });
  }

  await writeAuditLog({
    actorId: actor.id,
    action: "SUPERVISOR_ASSIGNED",
    entityType: "User",
    entityId: student.id,
    metadata: {
      studentId: student.id,
      supervisorId: parsed.data.supervisorId,
    },
  });

  revalidatePath("/coordinator/assignments");
  revalidatePath("/coordinator/users");
  revalidatePath("/coordinator");
  return { success: true, message: "Assignment updated." };
}

export async function updateUserStatusAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireUser(["COORDINATOR"]);
  const parsed = updateUserStatusSchema.safeParse({
    userId: formData.get("userId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { success: false, error: "Invalid status update." };

  if (parsed.data.userId === actor.id) {
    return { success: false, error: "You cannot change your own account status." };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { status: parsed.data.status },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "USER_STATUS_UPDATED",
    entityType: "User",
    entityId: parsed.data.userId,
    metadata: { status: parsed.data.status },
  });

  revalidatePath("/coordinator/users");
  return { success: true, message: "User status updated." };
}

export async function createUserAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireUser(["COORDINATOR"]);
  const parsed = createUserByCoordinatorSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    role: formData.get("role"),
    department: formData.get("department"),
    matricNumber: formData.get("matricNumber") || undefined,
    staffId: formData.get("staffId") || undefined,
    title: formData.get("title") || undefined,
    temporaryPassword: formData.get("temporaryPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Please complete all required account fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { success: false, error: "Email is already in use." };

  const passwordHash = await bcrypt.hash(parsed.data.temporaryPassword, 12);

  const user = await prisma.user.create({
    data: {
      email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      role: parsed.data.role,
      department: parsed.data.department,
      matricNumber: parsed.data.matricNumber,
      staffId: parsed.data.staffId,
      title: parsed.data.title,
      passwordHash,
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "USER_CREATED_BY_COORDINATOR",
    entityType: "User",
    entityId: user.id,
    metadata: { role: user.role, email: user.email },
  });

  revalidatePath("/coordinator/users");
  return { success: true, message: "Account created successfully." };
}
