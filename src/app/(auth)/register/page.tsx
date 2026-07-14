import Link from "next/link";
import { RegisterForm } from "@/components/shared/auth-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <Card className="rounded-[24px] border-0 bg-slate-50 shadow-none">
      <CardHeader className="p-6 sm:p-8">
        <CardTitle
          className="text-4xl font-normal leading-tight tracking-normal text-naub-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Create your account
        </CardTitle>
        <CardDescription className="max-w-sm text-base leading-6 text-slate-600">
          Students and supervisors can self-register. Coordinators are provisioned by administration.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-naub-green hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
