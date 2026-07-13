import { requireUser } from "@/lib/session";
import { getUnreadCount } from "@/features/notifications/actions";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { SidebarLink } from "@/components/layout/sidebar";

const links: SidebarLink[] = [
  { title: "Dashboard", href: "/coordinator", icon: "LayoutDashboard" },
  { title: "Users", href: "/coordinator/users", icon: "Users" },
  { title: "Assignments", href: "/coordinator/assignments", icon: "UserCheck" },
  { title: "Projects", href: "/coordinator/projects", icon: "FolderKanban" },
  { title: "Milestones", href: "/coordinator/milestones", icon: "ClipboardList" },
  { title: "Announcements", href: "/coordinator/announcements", icon: "Megaphone" },
  { title: "Analytics", href: "/coordinator/analytics", icon: "BarChart3" },
  { title: "Search", href: "/coordinator/search", icon: "Search" },
  { title: "Audit log", href: "/coordinator/audit", icon: "Shield" },
  { title: "Notifications", href: "/coordinator/notifications", icon: "Bell" },
  { title: "Profile", href: "/coordinator/profile", icon: "Settings" },
];

export default async function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["COORDINATOR"]);
  const unread = await getUnreadCount();
  return (
    <DashboardShell user={user} links={links} unread={unread}>
      {children}
    </DashboardShell>
  );
}
