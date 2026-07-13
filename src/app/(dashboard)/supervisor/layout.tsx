import { requireUser } from "@/lib/session";
import { getUnreadCount } from "@/features/notifications/actions";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { SidebarLink } from "@/components/layout/sidebar";

const links: SidebarLink[] = [
  { title: "Dashboard", href: "/supervisor", icon: "LayoutDashboard" },
  { title: "My students", href: "/supervisor/students", icon: "Users" },
  { title: "Reviews", href: "/supervisor/reviews", icon: "ClipboardList" },
  { title: "Deadlines", href: "/supervisor/deadlines", icon: "CalendarClock" },
  { title: "Messages", href: "/supervisor/chat", icon: "MessageSquare" },
  { title: "Notifications", href: "/supervisor/notifications", icon: "Bell" },
  { title: "Profile", href: "/supervisor/profile", icon: "Settings" },
];

export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["SUPERVISOR"]);
  const unread = await getUnreadCount();
  return (
    <DashboardShell user={user} links={links} unread={unread}>
      {children}
    </DashboardShell>
  );
}
