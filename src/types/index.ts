import type { Role } from "@prisma/client";

export type SessionUser = {
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

export type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type NavItem = {
  title: string;
  href: string;
  icon: string;
  roles?: Role[];
};
