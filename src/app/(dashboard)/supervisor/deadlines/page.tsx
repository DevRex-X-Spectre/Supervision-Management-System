import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeadlineForm } from "@/components/shared/deadline-forms";
import { formatDateTime, fullName } from "@/lib/utils";

export const metadata = { title: "Deadlines" };

export default async function SupervisorDeadlinesPage() {
  const user = await requireUser(["SUPERVISOR"]);
  const projects = await prisma.researchProject.findMany({
    where: { supervisorId: user.id },
    include: {
      student: { select: { firstName: true, lastName: true } },
      milestones: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { title: "asc" },
  });

  const deadlines = await prisma.deadline.findMany({
    where: { setById: user.id },
    include: {
      project: {
        include: { student: { select: { firstName: true, lastName: true } } },
      },
    },
    orderBy: { dueAt: "asc" },
  });

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Deadlines"
        description="Set clear due dates for projects or milestones. Students are notified automatically."
      />

      <Card>
        <CardHeader>
          <CardTitle>Create deadline</CardTitle>
        </CardHeader>
        <CardContent>
          <DeadlineForm
            projects={projects.map((p) => ({
              id: p.id,
              label: `${p.title} (${fullName(p.student.firstName, p.student.lastName)})`,
              milestones: p.milestones.map((m) => ({ id: m.id, title: m.title })),
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deadlines you set</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {deadlines.length === 0 ? (
            <p className="text-sm text-slate-500">No deadlines created yet.</p>
          ) : (
            deadlines.map((d) => (
              <div key={d.id} className="rounded-xl border border-slate-100 px-4 py-3">
                <p className="font-medium text-slate-900">{d.title}</p>
                <p className="text-xs text-slate-500">
                  Due {formatDateTime(d.dueAt)}
                  {d.project
                    ? ` · ${fullName(d.project.student.firstName, d.project.student.lastName)}`
                    : ""}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
