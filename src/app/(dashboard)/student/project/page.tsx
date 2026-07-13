import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProjectForm } from "@/components/shared/project-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, fullName, deadlineLabel } from "@/lib/utils";

export const metadata = { title: "My research project" };

export default async function StudentProjectPage() {
  const user = await requireUser(["STUDENT"]);
  const project = await prisma.researchProject.findUnique({
    where: { studentId: user.id },
    include: {
      milestones: { orderBy: { sortOrder: "asc" } },
      deadlines: { orderBy: { dueAt: "asc" } },
      supervisor: { select: { firstName: true, lastName: true, title: true, email: true } },
    },
  });

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Research project"
        description="Maintain your project profile, review milestones, and track deadlines set by your supervisor or coordinator."
      />

      <Card>
        <CardHeader>
          <CardTitle>{project ? "Update project details" : "Create your project"}</CardTitle>
          <CardDescription>
            Provide a clear title and abstract so your supervisor and coordinator can track your work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm project={project} />
        </CardContent>
      </Card>

      {project ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Supervision</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              {project.supervisor ? (
                <p>
                  Supervisor:{" "}
                  <span className="font-medium text-slate-900">
                    {fullName(project.supervisor.firstName, project.supervisor.lastName, project.supervisor.title)}
                  </span>{" "}
                  ({project.supervisor.email})
                </p>
              ) : (
                <p className="text-amber-700">No supervisor assigned yet. Your coordinator will complete this assignment.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
              <CardDescription>Predefined templates plus any custom milestones added for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.milestones.map((m) => (
                <div key={m.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{m.title}</p>
                    <p className="text-xs text-slate-500">
                      {m.dueDate ? deadlineLabel(m.dueDate) : "No due date"}
                      {m.isCustom ? " · Custom" : ""}
                    </p>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.deadlines.length === 0 ? (
                <p className="text-sm text-slate-500">No standalone deadlines recorded.</p>
              ) : (
                project.deadlines.map((d) => (
                  <div key={d.id} className="rounded-xl border border-slate-100 px-4 py-3">
                    <p className="font-medium text-slate-900">{d.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(d.dueAt)} · {deadlineLabel(d.dueAt)}</p>
                    {d.notes ? <p className="mt-1 text-sm text-slate-600">{d.notes}</p> : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
