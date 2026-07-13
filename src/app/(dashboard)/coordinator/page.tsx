import Link from "next/link";
import { Users, UserCheck, FolderKanban, ClipboardList, Clock3 } from "lucide-react";
import { getCoordinatorAnalytics } from "@/features/analytics/queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime, fullName, statusLabel } from "@/lib/utils";
import { SubmissionsChart } from "@/components/shared/analytics-charts";
export const metadata = { title: "Coordinator dashboard" };

export default async function CoordinatorDashboardPage() {
  const analytics = await getCoordinatorAnalytics();

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Coordinator console"
        description="Oversee research supervision across Nigerian Army University Biu. Manage people, assignments, and system health."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/coordinator/assignments">Assignments</Link>
            </Button>
            <Button asChild>
              <Link href="/coordinator/users">Manage users</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Students" value={analytics.students} icon={Users} />
        <StatCard label="Supervisors" value={analytics.supervisors} icon={UserCheck} tone="sky" />
        <StatCard label="Active projects" value={analytics.activeProjects} icon={FolderKanban} tone="gold" />
        <StatCard label="Pending reviews" value={analytics.pending} icon={ClipboardList} tone="amber" />
        <StatCard
          label="Avg. turnaround"
          value={`${analytics.avgTurnaroundHours}h`}
          hint="Submission to feedback"
          icon={Clock3}
          tone="green"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Submission outcomes</CardTitle>
            <CardDescription>System-wide review status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <SubmissionsChart data={analytics.submissionsByStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attention needed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="font-medium text-amber-900">Unassigned students</p>
              <p className="text-2xl font-bold text-amber-950">{analytics.unassignedStudents}</p>
              <Link href="/coordinator/assignments" className="text-xs font-medium text-amber-800 underline">
                Assign supervisors
              </Link>
            </div>
            <div className="rounded-xl border border-slate-100 px-4 py-3">
              <p className="text-slate-500">Total submissions</p>
              <p className="text-2xl font-bold text-slate-900">{analytics.submissions}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>High-level audit trail (no private chat or document content)</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/coordinator/audit">Full audit log</Link>
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 font-medium">When</th>
                <th className="pb-3 font-medium">Actor</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Entity</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentAudit.map((log) => (
                <tr key={log.id} className="border-b border-slate-50">
                  <td className="py-3 text-slate-500">{formatDateTime(log.createdAt)}</td>
                  <td className="py-3">
                    {log.actor
                      ? fullName(log.actor.firstName, log.actor.lastName)
                      : "System"}
                  </td>
                  <td className="py-3 font-medium text-slate-800">{statusLabel(log.action)}</td>
                  <td className="py-3 text-slate-500">{log.entityType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
