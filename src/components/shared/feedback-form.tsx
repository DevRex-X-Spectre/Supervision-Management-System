"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitFeedbackAction } from "@/features/submissions/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/loading";
import type { ActionResult } from "@/types";

export function FeedbackForm({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    submitFeedbackAction,
    null as ActionResult | null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Feedback saved");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="submissionId" value={submissionId} />
      <div className="space-y-2">
        <Label htmlFor="decision">Decision</Label>
        <Select id="decision" name="decision" required defaultValue="NEEDS_REVISION">
          <option value="APPROVED">Approve</option>
          <option value="NEEDS_REVISION">Request revision</option>
          <option value="REJECTED">Reject</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment">Structured feedback</Label>
        <Textarea
          id="comment"
          name="comment"
          placeholder="Provide clear comments on strengths, issues, and next steps. Markdown is supported for reading clarity."
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="border-white/40 border-t-white" /> : null}
        Submit feedback
      </Button>
    </form>
  );
}
