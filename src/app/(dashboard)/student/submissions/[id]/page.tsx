import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getSubmissionForUser } from "@/features/submissions/actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, fullName } from "@/lib/utils";
import { Paperclip } from "lucide-react";

export const metadata = { title: "Submission details" };

export default async function StudentSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmissionForUser(id);
  if (!submission) notFound();

  return (
    <div className="animate-fade-up mx-auto max-w-4xl">
      <PageHeader
        title={submission.title}
        description={`Version ${submission.version} · Submitted ${formatDateTime(submission.submittedAt)}`}
        actions={
          <Button asChild variant="outline">
            <Link href="/student/submissions">Back to list</Link>
          </Button>
        }
      />

      <div className="mb-4">
        <StatusBadge status={submission.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progress summary</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-slate-700">
            <p className="whitespace-pre-wrap">{submission.description}</p>
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
                  <span className="truncate">{f.fileName}</span>
                </a>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Supervisor feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {submission.feedback.length === 0 ? (
            <p className="text-sm text-slate-500">No feedback yet. Your supervisor will respond after review.</p>
          ) : (
            submission.feedback.map((f) => (
              <div key={f.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={f.decision} />
                  <span className="text-xs text-slate-500">
                    {fullName(f.supervisor.firstName, f.supervisor.lastName, f.supervisor.title)} ·{" "}
                    {formatDateTime(f.createdAt)}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none text-slate-700">
                  <ReactMarkdown>{f.comment}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
