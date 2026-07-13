import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

export const metadata = { title: "My submissions" };

export default async function StudentSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser(["STUDENT"]);
  const params = await searchParams;
  const status = params.status;

  const submissions = await prisma.submission.findMany({
    where: {
      studentId: user.id,
      ...(status ? { status: status as never } : {}),
    },
    orderBy: { submittedAt: "desc" },
    include: { milestone: true, files: true },
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Submissions"
        description="All research progress entries you have sent for review."
        actions={
          <Button asChild>
            <Link href="/student/submissions/new">New submission</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: "All", value: "" },
          { label: "Pending", value: "PENDING" },
          { label: "Approved", value: "APPROVED" },
          { label: "Needs revision", value: "NEEDS_REVISION" },
          { label: "Rejected", value: "REJECTED" },
        ].map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/student/submissions?status=${f.value}` : "/student/submissions"}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              (status ?? "") === f.value
                ? "border-naub-green bg-naub-green text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No submissions found"
          description="Create a progress entry to share your work with your supervisor."
          action={
            <Button asChild>
              <Link href="/student/submissions/new">Create submission</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {submissions.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{s.title}</h3>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Submitted {formatDate(s.submittedAt)}
                    {s.milestone ? ` · ${s.milestone.title}` : ""}
                    {` · ${s.files.length} file(s)`}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/student/submissions/${s.id}`}>View details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
