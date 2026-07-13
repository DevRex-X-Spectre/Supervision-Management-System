import Link from "next/link";
import { RegisterForm } from "@/components/shared/auth-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <Card className="border border-slate-200/80 shadow-sm md:border-0 md:shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Students and supervisors can self-register. Coordinators are provisioned by administration.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
