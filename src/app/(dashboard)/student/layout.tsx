import { requireUser } from "@/lib/session";
import { getUnreadCount } from "@/features/notifications/actions";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { SidebarLink } from "@/components/layout/sidebar";

const links: SidebarLink[] = [
  { title: "Dashboard", href: "/student", icon: "LayoutDashboard" },
  { title: "My project", href: "/student/project", icon: "FolderKanban" },
  { title: "Submissions", href: "/student/submissions", icon: "FileText" },
  { title: "Messages", href: "/student/chat", icon: "MessageSquare" },
  { title: "Notifications", href: "/student/notifications", icon: "Bell" },
  { title: "Profile", href: "/student/profile", icon: "Settings" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["STUDENT"]);
  const unread = await getUnreadCount();
  return (
    <DashboardShell user={user} links={links} unread={unread}>
      {children}
    </DashboardShell>
  );
}
