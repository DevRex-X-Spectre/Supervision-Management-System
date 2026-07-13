import Link from "next/link";
import { ResetPasswordForm } from "@/components/shared/auth-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Set new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <Card className="border border-slate-200/80 shadow-sm md:border-0 md:shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Choose a new password</CardTitle>
        <CardDescription>
          Use a strong password with uppercase, lowercase, and numbers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-red-600">
            This reset link is missing or invalid. Request a new one from the forgot password page.
          </p>
        )}
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-naub-green hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
