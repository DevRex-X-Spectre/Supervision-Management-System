import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import type { SessionUser } from "@/types";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.status !== "ACTIVE") return null;
  return session.user as SessionUser;
}

export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) {
    redirect(roleHome(user.role));
  }
  return user;
}

export function roleHome(role: Role) {
  switch (role) {
    case "STUDENT":
      return "/student";
    case "SUPERVISOR":
      return "/supervisor";
    case "COORDINATOR":
      return "/coordinator";
    default:
      return "/login";
  }
}

export function assertRole(user: SessionUser, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new Error("You do not have permission to perform this action.");
  }
}
