"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
} from "@/features/auth/actions";
import type { ActionResult } from "@/types";
import { Spinner } from "@/components/ui/loading";

export function LoginForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(loginAction, null as ActionResult | null);

  useEffect(() => {
    if (state?.success && state.message) {
      toast.success("Signed in successfully");
      router.push(state.message);
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-slate-600">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@naub.edu.ng"
          className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none"
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium text-slate-600">
            Password
          </Label>
          <Link href="/forgot-password" className="text-xs font-medium text-naub-green hover:underline">
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none"
          required
        />
      </div>
      <Button
        type="submit"
        className="h-12 w-full rounded-full bg-naub-green text-white hover:bg-naub-green-dark"
        disabled={pending}
      >
        {pending ? <Spinner className="border-white/40 border-t-white" /> : null}
        Sign in
      </Button>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-xs text-red-600">{messages[0]}</p>;
}

export function RegisterForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(registerAction, null as ActionResult | null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"" | "STUDENT" | "SUPERVISOR">("");
  const [department, setDepartment] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const errors = !state?.success ? state?.fieldErrors : undefined;

  const identityReady = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return firstName.trim().length >= 2 && lastName.trim().length >= 2 && emailOk;
  }, [firstName, lastName, email]);

  const showRole = identityReady;
  const showDetails = showRole && (role === "STUDENT" || role === "SUPERVISOR");

  useEffect(() => {
    if (!identityReady && role) {
      setRole("");
    }
  }, [identityReady, role]);

  useEffect(() => {
    if (state?.success && state.message) {
      toast.success("Account created successfully");
      router.push(state.message);
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-slate-600">
            First name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none"
            required
            autoComplete="given-name"
            aria-invalid={!!errors?.firstName}
          />
          <FieldError messages={errors?.firstName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-slate-600">
            Last name
          </Label>
          <Input
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none"
            required
            autoComplete="family-name"
            aria-invalid={!!errors?.lastName}
          />
          <FieldError messages={errors?.lastName} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-slate-600">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@naub.edu.ng"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none"
          required
          autoComplete="email"
          aria-invalid={!!errors?.email}
        />
        <FieldError messages={errors?.email} />
      </div>

      {showRole ? (
        <div className="space-y-2 animate-fade-up">
          <Label htmlFor="role" className="text-sm font-medium text-slate-600">
            I am registering as
          </Label>
          <Select
            id="role"
            name="role"
            required
            value={role}
            onChange={(e) => setRole(e.target.value as "" | "STUDENT" | "SUPERVISOR")}
            className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none"
            aria-invalid={!!errors?.role}
          >
            <option value="" disabled>
              Select student or supervisor
            </option>
            <option value="STUDENT">Student</option>
            <option value="SUPERVISOR">Supervisor</option>
          </Select>
          <p className="text-xs text-slate-500">
            Project Coordinator accounts are created by the administration.
          </p>
          <FieldError messages={errors?.role} />
        </div>
      ) : null}

      {showDetails ? (
        <div className="space-y-4 animate-fade-up">
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-slate-600">
              Department
            </Label>
            <Input
              id="department"
              name="department"
              placeholder="e.g. Computer Science"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none"
              required
              aria-invalid={!!errors?.department}
            />
            <FieldError messages={errors?.department} />
          </div>

          {role === "STUDENT" ? (
            <div className="space-y-2">
              <Label htmlFor="matricNumber" className="text-sm font-medium text-slate-600">
                Matric number
              </Label>
              <Input
                id="matricNumber"
                name="matricNumber"
                placeholder="e.g. NAUB/CS/20/001"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none"
                required
                autoComplete="off"
                aria-invalid={!!errors?.matricNumber}
              />
              <FieldError messages={errors?.matricNumber} />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="staffId" className="text-sm font-medium text-slate-600">
                Staff ID
              </Label>
              <Input
                id="staffId"
                name="staffId"
                placeholder="e.g. NAUB-SUP-001"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none"
                required
                autoComplete="off"
                aria-invalid={!!errors?.staffId}
              />
              <FieldError messages={errors?.staffId} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-600">
                Password
              </Label>
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none"
                required
                autoComplete="new-password"
                aria-invalid={!!errors?.password}
              />
              <p className="text-xs text-slate-500">
                At least 8 characters, with uppercase, lowercase, and a number.
              </p>
              <FieldError messages={errors?.password} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-600">
                Confirm password
              </Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none"
                required
                autoComplete="new-password"
                aria-invalid={!!errors?.confirmPassword}
              />
              <FieldError messages={errors?.confirmPassword} />
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-naub-green text-white hover:bg-naub-green-dark"
            disabled={pending}
          >
            {pending ? <Spinner className="border-white/40 border-t-white" /> : null}
            Create account
          </Button>
        </div>
      ) : null}
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    forgotPasswordAction,
    null as ActionResult | null
  );

  useEffect(() => {
    if (state?.success) toast.success(state.message ?? "Check your email");
    else if (state && !state.success) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        Send reset link
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    null as ActionResult | null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push("/login");
    } else if (state && !state.success) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <PasswordInput id="password" name="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput id="confirmPassword" name="confirmPassword" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        Update password
      </Button>
    </form>
  );
}
