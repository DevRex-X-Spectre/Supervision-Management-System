"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createCustomMilestoneAction,
  createDeadlineAction,
} from "@/features/projects/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/types";

export function DeadlineForm({
  projects,
}: {
  projects: { id: string; label: string; milestones: { id: string; title: string }[] }[];
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const milestones = projects.find((p) => p.id === projectId)?.milestones ?? [];
  const [state, action, pending] = useActionState(createDeadlineAction, null as ActionResult | null);

  useEffect(() => {
    if (state?.success) toast.success(state.message);
    else if (state && !state.success) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid max-w-2xl gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">Deadline title</Label>
        <Input id="title" name="title" required placeholder="Chapter 2 draft due" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="projectId">Project</Label>
          <Select
            id="projectId"
            name="projectId"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="milestoneId">Milestone (optional)</Label>
          <Select id="milestoneId" name="milestoneId" defaultValue="">
            <option value="">None</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueAt">Due date and time</Label>
        <Input id="dueAt" name="dueAt" type="datetime-local" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Optional guidance for the student" />
      </div>
      <Button type="submit" disabled={pending}>
        Save deadline
      </Button>
    </form>
  );
}

export function CustomMilestoneForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(
    createCustomMilestoneAction,
    null as ActionResult | null
  );

  useEffect(() => {
    if (state?.success) toast.success(state.message);
    else if (state && !state.success) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-dashed border-slate-200 p-4 sm:grid-cols-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="sm:col-span-2">
        <Label htmlFor={`title-${projectId}`}>Custom milestone</Label>
        <Input id={`title-${projectId}`} name="title" placeholder="e.g. Prototype demo" required />
      </div>
      <div>
        <Label htmlFor={`due-${projectId}`}>Due date</Label>
        <Input id={`due-${projectId}`} name="dueDate" type="date" />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          Add milestone
        </Button>
      </div>
    </form>
  );
}
