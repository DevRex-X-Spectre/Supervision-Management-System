"use client";

import { useState } from "react";
import { Sidebar, type SidebarLink } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { SessionUser } from "@/types";
import type { Role } from "@prisma/client";

export function DashboardShell({
  user,
  links,
  unread,
  children,
}: {
  user: SessionUser;
  links: SidebarLink[];
  unread: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const role = user.role as Role;
  const notificationsHref = `/${role.toLowerCase()}/notifications`;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar role={role} links={links} open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          unread={unread}
          onMenu={() => setOpen(true)}
          notificationsHref={notificationsHref}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
