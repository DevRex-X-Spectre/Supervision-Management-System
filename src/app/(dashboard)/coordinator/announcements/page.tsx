import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementForm } from "@/components/shared/coordinator-forms";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  await requireUser(["COORDINATOR"]);
  const items = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 20 });

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Announcements"
        description="Publish system-wide notices to students and supervisors."
      />
      <Card>
        <CardHeader>
          <CardTitle>New announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Published</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-100 px-4 py-3">
              <p className="font-medium text-slate-900">{a.title}</p>
              <p className="mt-1 text-sm text-slate-600">{a.body}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDateTime(a.createdAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
