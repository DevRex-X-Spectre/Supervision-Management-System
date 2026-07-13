import Link from "next/link";
import { ForgotPasswordForm } from "@/components/shared/auth-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <Card className="border border-slate-200/80 shadow-sm md:border-0 md:shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>
          Enter the email linked to your NAUB Prism account. We will send a secure reset link if the
          account exists.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-naub-green hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
