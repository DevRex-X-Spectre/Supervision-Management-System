import Link from "next/link";
import { CheckCircle2, FileCheck2, LineChart, MessagesSquare } from "lucide-react";
import { INSTITUTION } from "@/lib/constants";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-naub-ink lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <div className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-[30rem]">
          <Link href="/" className="mb-10 flex items-center gap-3">
            <Logo size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-naub-ink">{INSTITUTION.systemName}</p>
              <p className="text-xs text-slate-500">{INSTITUTION.shortName}</p>
            </div>
          </Link>
          {children}
        </div>
      </div>

      <div className="relative hidden min-h-screen overflow-hidden bg-slate-50 p-10 lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-[0_0_0_1px_rgba(4,23,43,0.03)]">
            <span className="h-1.5 w-1.5 rounded-full bg-naub-green" />
            {INSTITUTION.shortName} Research Supervision
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1
            className="text-5xl font-normal leading-[1.08] tracking-normal text-naub-ink"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Continuous supervision for{" "}
            <span className="italic text-naub-green">serious research.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-600">
            Track milestones, exchange feedback, and stay aligned with your supervisor or
            students. Built for {INSTITUTION.name}.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
            <div className="rounded-[20px] bg-white p-5 shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Reviews</p>
                  <p className="mt-1 text-3xl font-medium text-naub-ink">84</p>
                </div>
                <FileCheck2 className="h-5 w-5 text-naub-green" />
              </div>
              <p className="mt-6 text-sm text-slate-500">Structured feedback submitted this term</p>
            </div>
            <div className="translate-y-8 rounded-[20px] bg-white p-5 shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-slate-500">Progress</p>
                <LineChart className="h-5 w-5 text-naub-green" />
              </div>
              <div className="flex h-20 items-end gap-2">
                {[42, 56, 48, 68, 74, 86].map((height, index) => (
                  <span
                    key={index}
                    className="w-full rounded-full bg-naub-green"
                    style={{ height: `${height}%`, opacity: 0.32 + index * 0.1 }}
                  />
                ))}
              </div>
            </div>
            <div className="col-span-2 mt-6 rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-3">
                  <MessagesSquare className="h-5 w-5 text-slate-400" />
                  <p className="flex-1 text-sm text-slate-400">Send chapter feedback...</p>
                  <span className="h-10 w-10 rounded-full bg-naub-ink" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
          {["Role-based access", "Audit logged", "Real-time sync"].map((item) => (
            <span key={item} className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-naub-green" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
