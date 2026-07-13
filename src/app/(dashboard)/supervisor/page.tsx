import Link from "next/link";
import { Users, ClipboardList, CheckCircle2, MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getSupervisorDashboardStats } from "@/features/analytics/queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, fullName } from "@/lib/utils";

export const metadata = { title: "Supervisor dashboard" };

export default async function SupervisorDashboardPage() {
  const user = await requireUser(["SUPERVISOR"]);
  const stats = await getSupervisorDashboardStats(user.id);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={`Welcome, ${user.title ? user.title + " " : ""}${user.lastName}`}
        description="Review student progress, manage deadlines, and keep feedback timely."
        actions={
          <Button asChild>
            <Link href="/supervisor/reviews">Open review queue</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Assigned students" value={stats.studentCount} icon={Users} />
        <StatCard label="Pending reviews" value={stats.pendingCount} icon={ClipboardList} tone="amber" />
        <StatCard label="Feedback given" value={stats.reviewed} icon={CheckCircle2} tone="sky" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending reviews</CardTitle>
              <CardDescription>Submissions waiting for your decision</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/supervisor/reviews">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.pendingReviews.length === 0 ? (
              <p className="text-sm text-slate-500">No pending submissions. Great work staying current.</p>
            ) : (
              stats.pendingReviews.map((s) => (
                <Link
                  key={s.id}
                  href={`/supervisor/reviews/${s.id}`}
                  className="block rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{s.title}</p>
                      <p className="text-xs text-slate-500">
                        {fullName(s.student.firstName, s.student.lastName)}
                        {s.student.matricNumber ? ` · ${s.student.matricNumber}` : ""}
                        {" · "}
                        {formatDate(s.submittedAt)}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My students</CardTitle>
              <CardDescription>Assigned supervisees and project status</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/supervisor/students">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.students.length === 0 ? (
              <p className="text-sm text-slate-500">No students assigned yet.</p>
            ) : (
              stats.students.slice(0, 6).map((s) => {
                const total = s.studentProject?.milestones.length ?? 0;
                const done = s.studentProject?.milestones.filter((m) => m.status === "APPROVED").length ?? 0;
                return (
                  <div key={s.id} className="rounded-xl border border-slate-100 px-4 py-3">
                    <p className="font-medium text-slate-900">{fullName(s.firstName, s.lastName)}</p>
                    <p className="text-xs text-slate-500">
                      {s.matricNumber ?? "No matric"} · {s.studentProject?.title ?? "No project yet"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Milestones: {done}/{total}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
