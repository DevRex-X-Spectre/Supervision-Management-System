import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { fullName } from "@/lib/utils";
import { CoordinatorDeadlineForm } from "@/components/shared/coordinator-forms";
import { CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Projects" };

export default async function CoordinatorProjectsPage() {
  await requireUser(["COORDINATOR"]);
  const projects = await prisma.researchProject.findMany({
    include: {
      student: { select: { firstName: true, lastName: true, matricNumber: true } },
      supervisor: { select: { firstName: true, lastName: true, title: true } },
      milestones: { select: { status: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Research projects"
        description="High-level oversight of all research projects. Document contents and chat remain private to participants."
      />

      <Card>
        <CardHeader>
          <CardTitle>Set project deadline</CardTitle>
        </CardHeader>
        <CardContent>
          <CoordinatorDeadlineForm
            projects={projects.map((p) => ({
              id: p.id,
              label: `${p.title} · ${fullName(p.student.firstName, p.student.lastName)}`,
            }))}
          />
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {projects.map((p) => {
          const total = p.milestones.length;
          const done = p.milestones.filter((m) => m.status === "APPROVED").length;
          return (
            <Card key={p.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{p.title}</h3>
                  <p className="text-sm text-slate-500">
                    Student: {fullName(p.student.firstName, p.student.lastName)}
                    {p.student.matricNumber ? ` (${p.student.matricNumber})` : ""}
                    {" · Supervisor: "}
                    {p.supervisor
                      ? fullName(p.supervisor.firstName, p.supervisor.lastName, p.supervisor.title)
                      : "Unassigned"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Milestones {done}/{total} · Submissions {p._count.submissions}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
