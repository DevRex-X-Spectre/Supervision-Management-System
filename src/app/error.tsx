"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INSTITUTION } from "@/lib/constants";
import { getErrorMessage, isDatabaseUnavailableError } from "@/lib/db-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const databaseDown = isDatabaseUnavailableError(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-naub-green-soft text-naub-green">
          {databaseDown ? <Database className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
        </div>

        <p className="text-sm font-semibold uppercase tracking-wide text-naub-green">
          {INSTITUTION.systemName}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {databaseDown ? "Database temporarily unavailable" : "Something went wrong"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {databaseDown
            ? "The app is running, but it cannot reach the database right now. Try again after restoring the database connection."
            : "An unexpected error interrupted this page. Try reloading the page or return to the home screen."}
        </p>

        {!databaseDown && getErrorMessage(error) ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            {getErrorMessage(error)}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
