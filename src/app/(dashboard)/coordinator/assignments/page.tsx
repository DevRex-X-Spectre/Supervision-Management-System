import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AssignmentForm } from "@/components/shared/coordinator-forms";
import { fullName } from "@/lib/utils";

export const metadata = { title: "Assignments" };

export default async function AssignmentsPage() {
  await requireUser(["COORDINATOR"]);

  const [students, supervisors] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT", status: "ACTIVE" },
      orderBy: { lastName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        matricNumber: true,
        assignedSupervisorId: true,
      },
    }),
    prisma.user.findMany({
      where: { role: "SUPERVISOR", status: "ACTIVE" },
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true, title: true },
    }),
  ]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Supervisor assignments"
        description="Each student is assigned to exactly one supervisor. Changes update the linked research project automatically."
      />
      <Card>
        <CardHeader>
          <CardTitle>Student to supervisor mapping</CardTitle>
          <CardDescription>One student maps to one supervisor</CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentForm
            students={students.map((s) => ({
              id: s.id,
              label: `${fullName(s.firstName, s.lastName)}${s.matricNumber ? ` · ${s.matricNumber}` : ""}`,
              supervisorId: s.assignedSupervisorId,
            }))}
            supervisors={supervisors.map((s) => ({
              id: s.id,
              label: fullName(s.firstName, s.lastName, s.title),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
