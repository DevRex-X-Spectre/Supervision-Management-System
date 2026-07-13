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
      <Card className="border border-slate-200/80 shadow-sm md:border-0 md:shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl">You are already signed in</CardTitle>
          <CardDescription>
            Continue to your workspace or sign out to use a different account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Signed in as <span className="font-medium text-slate-900">{user.email}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="sm:flex-1">
              <Link href={roleHome(user.role)}>Continue to workspace</Link>
            </Button>
            <form action={logoutAction} className="sm:flex-1">
              <Button type="submit" variant="outline" className="w-full">
                Sign out and use another account
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200/80 shadow-sm md:border-0 md:shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in to NAUB Prism</CardTitle>
        <CardDescription>
          Access your research workspace as a student, supervisor, or coordinator.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
