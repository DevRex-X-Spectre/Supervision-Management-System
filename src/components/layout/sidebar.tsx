"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  FolderKanban,
  Bell,
  Users,
  UserCheck,
  BarChart3,
  ClipboardList,
  Megaphone,
  Search,
  CalendarClock,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { INSTITUTION } from "@/lib/constants";
import { Logo } from "@/components/shared/logo";
import type { Role } from "@prisma/client";

const icons = {
  LayoutDashboard,
  FileText,
  MessageSquare,
  FolderKanban,
  Bell,
  Users,
  UserCheck,
  BarChart3,
  ClipboardList,
  Megaphone,
  Search,
  CalendarClock,
  Settings,
  Shield,
} as const;

export type SidebarLink = {
  title: string;
  href: string;
  icon: keyof typeof icons;
};

export function Sidebar({
  role,
  links,
  open,
  onClose,
}: {
  role: Role;
  links: SidebarLink[];
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-naub-ink text-white transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Logo size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-wide">{INSTITUTION.systemName}</p>
                <p className="truncate text-[11px] text-white/60">{INSTITUTION.shortName} Research</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-3">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            {role === "STUDENT"
              ? "Student workspace"
              : role === "SUPERVISOR"
                ? "Supervisor workspace"
                : "Coordinator console"}
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {links.map((link) => {
            const Icon = icons[link.icon];
            const active =
              pathname === link.href ||
              (link.href !== `/${role.toLowerCase()}` && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white text-naub-ink shadow-sm"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-naub-green" : "")} />
                <span>{link.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-[11px] leading-relaxed text-white/45">
            {INSTITUTION.name}
            <br />
            Secure academic research supervision
          </p>
        </div>
      </aside>
    </>
  );
}
