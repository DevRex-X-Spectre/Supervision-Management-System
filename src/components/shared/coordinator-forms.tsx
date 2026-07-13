"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  assignSupervisorAction,
  createUserAction,
  updateUserStatusAction,
} from "@/features/users/actions";
import { createAnnouncementAction } from "@/features/notifications/actions";
import { saveMilestoneTemplateAction } from "@/features/projects/actions";
import { createDeadlineAction } from "@/features/projects/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/types";

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUserAction, null as ActionResult | null);
  useEffect(() => {
    if (state?.success) toast.success(state.message);
    else if (state && !state.success) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" name="firstName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last name</Label>
        <Input id="lastName" name="lastName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" defaultValue="STUDENT">
          <option value="STUDENT">Student</option>
          <option value="SUPERVISOR">Supervisor</option>
          <option value="COORDINATOR">Coordinator</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="temporaryPassword">Temporary password</Label>
        <Input id="temporaryPassword" name="temporaryPassword" type="text" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="matricNumber">Matric number</Label>
        <Input id="matricNumber" name="matricNumber" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="staffId">Staff ID</Label>
        <Input id="staffId" name="staffId" />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>Create account</Button>
      </div>
    </form>
  );
}

export function UserStatusForm({ userId, current }: { userId: string; current: string }) {
  const [state, action, pending] = useActionState(updateUserStatusAction, null as ActionResult | null);
  useEffect(() => {
    if (state?.success) toast.success(state.message);
    else if (state && !state.success) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <Select name="status" defaultValue={current} className="h-8 text-xs">
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="SUSPENDED">Suspended</option>
      </Select>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Save
      </Button>
    </form>
  );
}

export function AssignmentForm({
  students,
  supervisors,
}: {
  students: { id: string; label: string; supervisorId: string | null }[];
  supervisors: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(assignSupervisorAction, null as ActionResult | null);
  useEffect(() => {
    if (state?.success) toast.success(state.message);
    else if (state && !state.success) toast.error(state.error);
  }, [state]);

  return (
    <div className="space-y-3">
      {students.map((s) => (
        <form key={s.id} action={action} className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center">
          <input type="hidden" name="studentId" value={s.id} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900">{s.label}</p>
          </div>
          <Select name="supervisorId" defaultValue={s.supervisorId ?? ""} className="sm:w-72">
            <option value="">Unassigned</option>
            {supervisors.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.label}
              </option>
            ))}
          </Select>
          <Button type="submit" size="sm" disabled={pending}>
            Save
          </Button>
        </form>
      ))}
    </div>
  );
}

export function AnnouncementForm() {
  const [state, action, pending] = useActionState(createAnnouncementAction, null as ActionResult | null);
  useEffect(() => {
    if (state?.success) toast.success(state.message);
    else if (state && !state.success) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid max-w-2xl gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Announcement</Label>
        <Textarea id="body" name="body" required />
      </div>
      <Button type="submit" disabled={pending}>Publish announcement</Button>
    </form>
  );
}

export function MilestoneTemplateForm({
  template,
}: {
  template?: {
    id: string;
    name: string;
    description?: string | null;
    sortOrder: number;
    defaultDays?: number | null;
  };
}) {
  const [state, action, pending] = useActionState(saveMilestoneTemplateAction, null as ActionResult | null);
  useEffect(() => {
    if (state?.success) toast.success(state.message);
    else if (state && !state.success) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-slate-100 p-4 md:grid-cols-4">
      {template ? <input type="hidden" name="id" value={template.id} /> : null}
      <div className="md:col-span-2 space-y-1">
        <Label>Name</Label>
        <Input name="name" defaultValue={template?.name ?? ""} required />
      </div>
      <div className="space-y-1">
        <Label>Order</Label>
        <Input name="sortOrder" type="number" defaultValue={template?.sortOrder ?? 0} />
      </div>
      <div className="space-y-1">
        <Label>Default days</Label>
        <Input name="defaultDays" type="number" defaultValue={template?.defaultDays ?? ""} />
      </div>
      <div className="md:col-span-3 space-y-1">
        <Label>Description</Label>
        <Input name="description" defaultValue={template?.description ?? ""} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          {template ? "Update" : "Add template"}
        </Button>
      </div>
    </form>
  );
}

export function CoordinatorDeadlineForm({
  projects,
}: {
  projects: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(createDeadlineAction, null as ActionResult | null);
  useEffect(() => {
    if (state?.success) toast.success(state.message);
    else if (state && !state.success) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid max-w-2xl gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="projectId">Project</Label>
        <Select id="projectId" name="projectId">
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueAt">Due at</Label>
        <Input id="dueAt" name="dueAt" type="datetime-local" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" />
      </div>
      <Button type="submit" disabled={pending}>Save deadline</Button>
    </form>
  );
}
