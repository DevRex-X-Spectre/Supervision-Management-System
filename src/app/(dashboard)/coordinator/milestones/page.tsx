import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MilestoneTemplateForm } from "@/components/shared/coordinator-forms";

export const metadata = { title: "Milestone templates" };

export default async function MilestonesPage() {
  await requireUser(["COORDINATOR"]);
  const templates = await prisma.milestoneTemplate.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Milestone templates"
        description="Define the standard research path applied to new projects. Supervisors may still add custom milestones per student."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add template</CardTitle>
        </CardHeader>
        <CardContent>
          <MilestoneTemplateForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing templates</CardTitle>
          <CardDescription>{templates.length} template(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((t) => (
            <MilestoneTemplateForm key={t.id} template={t} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
