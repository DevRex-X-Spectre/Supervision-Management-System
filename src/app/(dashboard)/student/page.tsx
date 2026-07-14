import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock3,
  Bell,
  FolderKanban,
  MessageSquare,
} from "lucide-react";
import { requireUser } from "@/lib/session";
import { getStudentDashboardData } from "@/features/analytics/queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, fullName, deadlineLabel } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Student dashboard" };

export default async function StudentDashboardPage() {
  const user = await requireUser(["STUDENT"]);
  const stats = await getStudentDashboardData(user.id);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={`Good day, ${user.firstName}`}
        description="Track your research progress, upcoming deadlines, and supervisor feedback in one place."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/student/chat">
                <MessageSquare className="h-4 w-4" />
                Message supervisor
              </Link>
            </Button>
            <Button asChild>
              <Link href="/student/submissions/new">
                <FileText className="h-4 w-4" />
                New submission
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total submissions" value={stats.submissions} icon={FileText} tone="green" />
        <StatCard label="Pending review" value={stats.pending} icon={Clock3} tone="amber" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} tone="sky" />
        <StatCard
          label="Milestone completion"
          value={`${stats.completionRate}%`}
          hint={`${stats.milestoneDone} of ${stats.milestoneTotal} milestones`}
          icon={FolderKanban}
          tone="gold"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Research project</CardTitle>
              <CardDescription>Your current supervision assignment and plan</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/student/project">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.project ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{stats.project.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {stats.project.topic ? `${stats.project.topic} · ` : ""}
                    {stats.project.sessionYear ?? "Session not set"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={stats.project.status} />
                  {stats.project.supervisor ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-xs text-slate-600">
                      Supervisor:{" "}
                      {fullName(
                        stats.project.supervisor.firstName,
                        stats.project.supervisor.lastName,
                        stats.project.supervisor.title
                      )}
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs text-amber-800">
                      Awaiting supervisor assignment
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Milestone progress
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-naub-green transition-all"
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {stats.project.milestones.slice(0, 4).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm"
                      >
                        <span className="truncate pr-2 font-medium text-slate-700">{m.title}</span>
                        <StatusBadge status={m.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={FolderKanban}
                title="No research project yet"
                description="Create your project profile to unlock submissions, milestones, and supervisor tracking."
                action={
                  <Button asChild>
                    <Link href="/student/project">Set up project</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.deadlines.length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming deadlines on record.</p>
              ) : (
                stats.deadlines.map((d) => (
                  <div key={d.id} className="rounded-xl border border-slate-100 px-3 py-2.5">
                    <p className="text-sm font-medium text-slate-800">{d.title}</p>
                    <p className="text-xs text-slate-500">{deadlineLabel(d.dueAt)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-naub-green" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.announcements.length === 0 ? (
                <p className="text-sm text-slate-500">No announcements at this time.</p>
              ) : (
                stats.announcements.map((a) => (
                  <div key={a.id} className="rounded-xl border border-slate-100 px-3 py-2.5">
                    <p className="text-sm font-medium text-slate-800">{a.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{a.body}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent submissions</CardTitle>
            <CardDescription>Your latest progress entries and review outcomes</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/student/submissions">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recent.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No submissions yet"
              description="Submit your first progress update when you are ready for supervisor review."
              action={
                <Button asChild>
                  <Link href="/student/submissions/new">Create submission</Link>
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Submitted</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50">
                      <td className="py-3 font-medium text-slate-800">{s.title}</td>
                      <td className="py-3 text-slate-500">{formatDate(s.submittedAt)}</td>
                      <td className="py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/student/submissions/${s.id}`}
                          className="text-sm font-medium text-naub-green hover:underline"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
