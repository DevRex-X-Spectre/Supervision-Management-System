import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SubmissionForm } from "@/components/shared/submission-form";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "New submission" };

export default async function NewSubmissionPage() {
  const user = await requireUser(["STUDENT"]);
  const project = await prisma.researchProject.findUnique({
    where: { studentId: user.id },
    include: { milestones: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="animate-fade-up mx-auto max-w-3xl">
      <PageHeader
        title="Submit research progress"
        description="Share your latest work with your supervisor. Attach PDF or DOCX documents where needed."
      />
      <Card>
        <CardContent className="p-5 sm:p-6">
          {!project ? (
            <EmptyState
              icon={FolderKanban}
              title="Project required"
              description="Set up your research project before submitting progress."
              action={
                <Button asChild>
                  <Link href="/student/project">Set up project</Link>
                </Button>
              }
            />
          ) : !project.supervisorId ? (
            <EmptyState
              icon={FolderKanban}
              title="Supervisor not assigned"
              description="You will be able to submit once a project coordinator assigns your supervisor."
            />
          ) : (
            <SubmissionForm
              milestones={project.milestones.map((m) => ({ id: m.id, title: m.title }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
