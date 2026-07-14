import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isDatabaseUnavailableError } from "@/lib/db-error";

export class AuthDatabaseUnavailableError extends CredentialsSignin {
  code = "service_unavailable";
}

type LoginUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: string;
  department?: string | null;
  title?: string | null;
  avatarUrl?: string | null;
  assignedSupervisorId?: string | null;
};

type VerifyCredentialsResult =
  | { ok: true; user: LoginUser }
  | { ok: false; reason: "invalid" | "inactive" | "unavailable" };

async function withAuthTimeout<T>(promise: Promise<T>, timeoutMs = 5_000) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error(`Authentication database read timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function verifyCredentials(
  emailInput: string,
  password: string
): Promise<VerifyCredentialsResult> {
  const email = emailInput.toLowerCase().trim();

  try {
    const user = await withAuthTimeout(
      prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          department: true,
          title: true,
          avatarUrl: true,
          assignedSupervisorId: true,
          passwordHash: true,
        },
      })
    );

    if (!user) return { ok: false, reason: "invalid" };
    if (user.status !== "ACTIVE") return { ok: false, reason: "inactive" };

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return { ok: false, reason: "invalid" };

    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      department: user.department,
      title: user.title,
      avatarUrl: user.avatarUrl,
      assignedSupervisorId: user.assignedSupervisorId,
    };

    return { ok: true, user: safeUser };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }
}
