import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, fullName } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList } from "lucide-react";

export const metadata = { title: "Reviews" };

export default async function SupervisorReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser(["SUPERVISOR"]);
  const params = await searchParams;
  const status = params.status;

  const submissions = await prisma.submission.findMany({
    where: {
      project: { supervisorId: user.id },
      ...(status ? { status: status as never } : {}),
    },
    include: {
      student: { select: { firstName: true, lastName: true, matricNumber: true } },
      milestone: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Review queue"
        description="Assess research progress and provide structured feedback."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["", "PENDING", "APPROVED", "NEEDS_REVISION", "REJECTED"].map((value) => {
          const label = value ? value.replaceAll("_", " ").toLowerCase() : "all";
          return (
            <Link
              key={value || "all"}
              href={value ? `/supervisor/reviews?status=${value}` : "/supervisor/reviews"}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                (status ?? "") === value
                  ? "border-naub-green bg-naub-green text-white"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No submissions in this filter"
          description="When students submit progress, they will appear here for review."
        />
      ) : (
        <div className="grid gap-3">
          {submissions.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{s.title}</h3>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {fullName(s.student.firstName, s.student.lastName)}
                    {s.student.matricNumber ? ` · ${s.student.matricNumber}` : ""}
                    {" · "}
                    {formatDate(s.submittedAt)}
                    {s.milestone ? ` · ${s.milestone.title}` : ""}
                  </p>
                </div>
                <Link href={`/supervisor/reviews/${s.id}`} className="text-sm font-medium text-naub-green hover:underline">
                  Review
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
