import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationsList } from "@/components/shared/notifications-list";

export const metadata = { title: "Notifications" };

export default async function SupervisorNotificationsPage() {
  const user = await requireUser(["SUPERVISOR"]);
  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <div className="animate-fade-up">
      <PageHeader title="Notifications" description="Submission alerts, messages, and system updates." />
      <NotificationsList items={items} />
    </div>
  );
}
