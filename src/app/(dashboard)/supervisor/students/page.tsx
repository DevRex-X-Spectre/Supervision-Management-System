import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { fullName } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";
import { CustomMilestoneForm } from "@/components/shared/deadline-forms";

export const metadata = { title: "My students" };

export default async function SupervisorStudentsPage() {
  const user = await requireUser(["SUPERVISOR"]);
  const students = await prisma.user.findMany({
    where: { assignedSupervisorId: user.id, role: "STUDENT" },
    include: {
      studentProject: {
        include: { milestones: { orderBy: { sortOrder: "asc" } } },
      },
    },
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Assigned students"
        description="Review project status and add custom milestones for individual students."
      />

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students assigned"
          description="Students will appear here once the project coordinator assigns them to you."
        />
      ) : (
        students.map((s) => (
          <Card key={s.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{fullName(s.firstName, s.lastName)}</h3>
                  <p className="text-sm text-slate-500">
                    {s.matricNumber ?? "No matric"} · {s.department ?? "Department not set"} · {s.email}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {s.studentProject?.title ?? "Project not created yet"}
                  </p>
                  {s.studentProject ? <div className="mt-2"><StatusBadge status={s.studentProject.status} /></div> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/supervisor/chat?student=${s.id}`}>Message</Link>
                  </Button>
                </div>
              </div>

              {s.studentProject ? (
                <>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {s.studentProject.milestones.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                        <span className="truncate pr-2">{m.title}</span>
                        <StatusBadge status={m.status} />
                      </div>
                    ))}
                  </div>
                  <CustomMilestoneForm projectId={s.studentProject.id} />
                </>
              ) : null}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
