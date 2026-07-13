"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "@/features/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/types";
import type { SessionUser } from "@/types";

export function ProfileForm({ user }: { user: SessionUser & { phone?: string | null; specialization?: string | null } }) {
  const [state, action, pending] = useActionState(updateProfileAction, null as ActionResult | null);

  useEffect(() => {
    if (state?.success) toast.success(state.message);
    else if (state && !state.success) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid max-w-xl gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" defaultValue={user.firstName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" defaultValue={user.lastName} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" defaultValue={user.department ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={user.phone ?? ""} />
      </div>
      {user.role !== "STUDENT" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={user.title ?? ""} placeholder="Dr. / Prof." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              name="specialization"
              defaultValue={user.specialization ?? ""}
            />
          </div>
        </>
      ) : null}
      <div>
        <Button type="submit" disabled={pending}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
