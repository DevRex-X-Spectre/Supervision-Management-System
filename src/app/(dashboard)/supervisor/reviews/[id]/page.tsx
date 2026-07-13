import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getSubmissionForUser } from "@/features/submissions/actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { FeedbackForm } from "@/components/shared/feedback-form";
import { Button } from "@/components/ui/button";
import { formatDateTime, fullName } from "@/lib/utils";
import { Paperclip } from "lucide-react";

export const metadata = { title: "Review submission" };

export default async function SupervisorReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmissionForUser(id);
  if (!submission) notFound();

  return (
    <div className="animate-fade-up mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={submission.title}
        description={`${fullName(submission.student.firstName, submission.student.lastName)} · ${formatDateTime(submission.submittedAt)}`}
        actions={
          <Button asChild variant="outline">
            <Link href="/supervisor/reviews">Back</Link>
          </Button>
        }
      />

      <StatusBadge status={submission.status} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Student summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {submission.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {submission.files.length === 0 ? (
                <p className="text-sm text-slate-500">No files attached.</p>
              ) : (
                submission.files.map((f) => (
                  <a
                    key={f.id}
                    href={f.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-naub-green hover:bg-slate-50"
                  >
                    <Paperclip className="h-4 w-4" />
                    {f.fileName}
                  </a>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Previous feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {submission.feedback.length === 0 ? (
                <p className="text-sm text-slate-500">No prior feedback on this submission.</p>
              ) : (
                submission.feedback.map((f) => (
                  <div key={f.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <StatusBadge status={f.decision} />
                    <div className="prose prose-sm mt-2 max-w-none">
                      <ReactMarkdown>{f.comment}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Provide feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <FeedbackForm submissionId={submission.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
