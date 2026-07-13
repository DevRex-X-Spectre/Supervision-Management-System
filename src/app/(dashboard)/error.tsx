"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Database, LayoutDashboard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage, isDatabaseUnavailableError } from "@/lib/db-error";

export default function DashboardError({
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
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-naub-green-soft text-naub-green">
          <Database className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {databaseDown ? "Workspace temporarily unavailable" : "Unable to load this workspace"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {databaseDown
            ? "The dashboard could not reach the database. The app will recover automatically once the database connection is restored."
            : "This page hit an unexpected error while loading. Try again or return to your dashboard home."}
        </p>

        {!databaseDown && getErrorMessage(error) ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            {getErrorMessage(error)}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <LayoutDashboard className="h-4 w-4" />
              Return home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
