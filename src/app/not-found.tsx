import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-naub-green">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        The page you requested does not exist or you do not have access to view it.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
