import Link from "next/link";
import { getCurrentUser, roleHome } from "@/lib/session";
import { logoutAction } from "@/features/auth/actions";
import { LoginForm } from "@/components/shared/auth-forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <Card className="rounded-[24px] border-0 bg-slate-50 shadow-none">
        <CardHeader className="p-6 sm:p-8">
          <CardTitle
            className="text-3xl font-normal leading-tight tracking-normal text-naub-ink"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            You are already signed in
          </CardTitle>
          <CardDescription className="max-w-sm text-base leading-6 text-slate-600">
            Continue to your workspace or sign out to use a different account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-0 sm:p-8 sm:pt-0">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
            Signed in as <span className="font-medium text-slate-900">{user.email}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full bg-naub-green text-white hover:bg-naub-green-dark sm:flex-1">
              <Link href={roleHome(user.role)}>Continue to workspace</Link>
            </Button>
            <form action={logoutAction} className="sm:flex-1">
              <Button
                type="submit"
                variant="outline"
                className="w-full rounded-full border-naub-ink bg-transparent text-naub-ink hover:bg-white"
              >
                Sign out and use another account
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[24px] border-0 bg-slate-50 shadow-none">
      <CardHeader className="p-6 sm:p-8">
        <CardTitle
          className="text-4xl font-normal leading-tight tracking-normal text-naub-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Sign in to NAUB Prism
        </CardTitle>
        <CardDescription className="max-w-sm text-base leading-6 text-slate-600">
          Access your research workspace as a student, supervisor, or coordinator.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
        <LoginForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          New to the platform?{" "}
          <Link href="/register" className="font-medium text-naub-green hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
