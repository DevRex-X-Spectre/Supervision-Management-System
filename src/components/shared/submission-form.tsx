"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSubmissionAction } from "@/features/submissions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { UploadDropzone } from "@/lib/uploadthing-components";
import { FILE_CONSTRAINTS } from "@/lib/utils";
import { Spinner } from "@/components/ui/loading";
import type { ActionResult } from "@/types";
import { X, Paperclip } from "lucide-react";

type MilestoneOption = { id: string; title: string };
type UploadedFile = {
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
};

export function SubmissionForm({ milestones }: { milestones: MilestoneOption[] }) {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [state, action, pending] = useActionState(
    createSubmissionAction,
    null as ActionResult<{ id: string }> | null
  );

  useEffect(() => {
    if (state?.success && state.data?.id) {
      toast.success(state.message ?? "Submitted");
      router.push(`/student/submissions/${state.data.id}`);
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="files" value={JSON.stringify(files)} />

      <div className="space-y-2">
        <Label htmlFor="title">Submission title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Chapter 1 draft for review"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="milestoneId">Related milestone (optional)</Label>
        <Select id="milestoneId" name="milestoneId" defaultValue="">
          <option value="">General progress update</option>
          {milestones.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Progress summary</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Summarise what you completed, challenges faced, and what you need from your supervisor."
          required
        />
      </div>

      <div className="space-y-3">
        <div>
          <Label>Attachments ({FILE_CONSTRAINTS.allowedLabel}, max {FILE_CONSTRAINTS.maxSizeLabel} each)</Label>
          <p className="mt-1 text-xs text-slate-500">Up to 5 documents. PDF and DOCX only.</p>
        </div>

        <UploadDropzone
          endpoint="researchDocument"
          onClientUploadComplete={(res) => {
            const next = (res ?? []).map((f) => ({
              fileName: f.name,
              fileUrl: f.ufsUrl ?? f.url,
              fileKey: f.key,
              fileSize: f.size,
              mimeType: f.type,
            }));
            setFiles((prev) => [...prev, ...next].slice(0, 5));
            toast.success("File uploaded");
          }}
          onUploadError={(error: Error) => {
            toast.error(error.message || "Upload failed");
          }}
          appearance={{
            container: "border-slate-200 rounded-xl ut-ready:bg-slate-50",
            button: "bg-naub-green ut-ready:bg-naub-green",
          }}
        />

        {files.length > 0 ? (
          <ul className="space-y-2">
            {files.map((f) => (
              <li
                key={f.fileKey}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Paperclip className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{f.fileName}</span>
                </span>
                <button
                  type="button"
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                  onClick={() => setFiles((prev) => prev.filter((x) => x.fileKey !== f.fileKey))}
                  aria-label={`Remove ${f.fileName}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="border-white/40 border-t-white" /> : null}
          Submit for review
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
