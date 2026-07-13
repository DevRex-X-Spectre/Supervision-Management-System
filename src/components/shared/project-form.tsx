"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { upsertProjectAction } from "@/features/projects/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/types";

export function ProjectForm({
  project,
}: {
  project?: {
    title: string;
    topic?: string | null;
    abstract?: string | null;
    sessionYear?: string | null;
  } | null;
}) {
  const [state, action, pending] = useActionState(upsertProjectAction, null as ActionResult | null);

  useEffect(() => {
    if (state?.success) toast.success(state.message);
    else if (state && !state.success) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid max-w-2xl gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">Project title</Label>
        <Input id="title" name="title" defaultValue={project?.title ?? ""} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="topic">Research topic / area</Label>
          <Input id="topic" name="topic" defaultValue={project?.topic ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sessionYear">Academic session</Label>
          <Input id="sessionYear" name="sessionYear" defaultValue={project?.sessionYear ?? ""} placeholder="2025/2026" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="abstract">Abstract</Label>
        <Textarea id="abstract" name="abstract" defaultValue={project?.abstract ?? ""} />
      </div>
      <Button type="submit" disabled={pending}>
        Save project
      </Button>
    </form>
  );
}
