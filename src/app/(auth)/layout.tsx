import Link from "next/link";
import { INSTITUTION } from "@/lib/constants";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-2">
      {/* Form side (left) */}
      <div className="flex min-h-screen flex-col justify-center bg-white px-5 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <Logo size={40} />
            <div>
              <p className="text-sm font-semibold text-slate-900">{INSTITUTION.systemName}</p>
              <p className="text-xs text-slate-500">{INSTITUTION.shortName}</p>
            </div>
          </Link>
          {children}
        </div>
      </div>

      {/* Brand side (right) — fills the empty space on desktop/tablet */}
      <div className="auth-brand-panel relative hidden min-h-screen flex-col justify-between overflow-hidden p-10 text-white md:flex lg:p-14">
        <div className="auth-brand-shapes pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-naub-gold" />
            {INSTITUTION.shortName} Research Supervision
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1
            className="text-3xl font-semibold leading-snug tracking-tight lg:text-4xl"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Continuous supervision for serious research.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/75 lg:text-base">
            Track milestones, exchange feedback, and stay aligned with your supervisor or
            students. Built for {INSTITUTION.name}.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-naub-gold" />
              Submit progress and get structured supervisor feedback
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-naub-gold" />
              Chat in real time with your assigned research team
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-naub-gold" />
              Coordinators oversee assignments and completion rates
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          Protected academic workspace · Role-based access
        </p>
      </div>
    </div>
  );
}
