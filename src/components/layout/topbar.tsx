"use client";

import { Menu, Bell, LogOut } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { fullName } from "@/lib/utils";
import { logoutAction } from "@/features/auth/actions";
import type { SessionUser } from "@/types";

export function Topbar({
  user,
  unread = 0,
  onMenu,
  notificationsHref,
}: {
  user: SessionUser;
  unread?: number;
  onMenu?: () => void;
  notificationsHref: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">
              Welcome, {user.firstName}
            </p>
            <p className="text-xs text-slate-500">Stay current with your research activities</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={notificationsHref}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3">
            <Avatar firstName={user.firstName} lastName={user.lastName} src={user.avatarUrl} />
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-xs font-semibold text-slate-900">
                {fullName(user.firstName, user.lastName, user.title)}
              </p>
              <p className="truncate text-[11px] text-slate-500">{user.email}</p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg p-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
