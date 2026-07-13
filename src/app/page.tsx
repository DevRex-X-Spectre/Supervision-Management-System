import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  MessagesSquare,
  ShieldCheck,
  LineChart,
  Users,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { INSTITUTION } from "@/lib/constants";
import { Logo } from "@/components/shared/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ─────────── HEADER ─────────── */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <p className="text-sm font-semibold text-white">{INSTITUTION.systemName}</p>
              <p className="text-xs text-white/70">{INSTITUTION.shortName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="gold" className="hidden sm:inline-flex">
              <Link href="/register">Create account</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ─────────── HERO ─────────── */}
      <section className="hero-grid relative overflow-hidden text-white">
        {/* Decorative ambient blurs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-24 pt-28 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-32">
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-naub-gold" />
              Official research supervision platform
            </div>
            <h1
              className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Research supervision,
              <br />
              modernised for{" "}
              <span className="text-naub-gold">{INSTITUTION.name}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              One secure platform for progress tracking, structured reviews, and real-time
              collaboration between students, supervisors, and coordinators.
            </p>

            {/* Trust micro-strip */}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/65">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-naub-gold" /> Role-based access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-naub-gold" /> Real-time chat
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-naub-gold" /> Secure file exchange
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="gold">
                <Link href="/register">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/login">Sign in to your workspace</Link>
              </Button>
            </div>
          </div>

          {/* Feature cards */}
          <div className="animate-fade-up grid gap-3 sm:grid-cols-2">
            {[
              { icon: FileCheck2, title: "Structured progress", text: "Chapters with clear review status." },
              { icon: MessagesSquare, title: "Direct messaging", text: "Chat with your supervisor in real time." },
              { icon: LineChart, title: "Live oversight", text: "Monitor engagement across cohorts." },
              { icon: BookOpenCheck, title: "Milestone tracking", text: "Proposal through final dissertation." },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
              >
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-naub-gold/60 to-transparent opacity-60" />
                <item.icon className="mb-3 h-5 w-5 text-naub-gold transition-transform group-hover:scale-110" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stat strip at hero bottom */}
        <div className="relative border-t border-white/10 bg-black/15 backdrop-blur-sm">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/10 px-4 sm:px-6 md:grid-cols-4">
            {[
              { k: "3", v: "Role dashboards" },
              { k: "100%", v: "Audit logged" },
              { k: "10 MB", v: "Per document" },
              { k: "24/7", v: "Real-time sync" },
            ].map((s) => (
              <div key={s.v} className="px-4 py-5 text-center md:py-6">
                <p className="text-2xl font-semibold text-naub-gold">{s.k}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/65">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── ROLE CARDS ─────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-naub-green-soft px-3 py-1 text-xs font-medium text-naub-green">
              <Sparkles className="h-3.5 w-3.5" /> Built for every stakeholder
            </span>
            <h2
              className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Built for academic excellence at NAUB
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                role: "Students",
                icon: Users,
                accent: "from-rose-500/15 to-rose-500/0",
                points: [
                  "Submit progress with PDF or DOCX",
                  "Track approvals and revisions",
                  "Chat with your supervisor",
                ],
              },
              {
                role: "Supervisors",
                icon: BookOpenCheck,
                accent: "from-amber-500/15 to-amber-500/0",
                points: [
                  "Review assigned work in one queue",
                  "Give structured feedback",
                  "Set milestones and deadlines",
                ],
              },
              {
                role: "Coordinators",
                icon: LineChart,
                accent: "from-emerald-500/15 to-emerald-500/0",
                points: [
                  "Assign students to supervisors",
                  "Monitor system-wide activity",
                  "Publish announcements",
                ],
              },
            ].map((card) => (
              <div
                key={card.role}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-naub-green/40 hover:shadow-lg"
              >
                <span
                  className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${card.accent}`}
                />
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-naub-green-soft text-naub-green ring-1 ring-naub-green/10">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{card.role}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {card.points.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-naub-green" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="border-y border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              From proposal to defence, in four steps
            </h2>
          </div>

          <div className="relative mt-14 grid gap-6 md:grid-cols-4">
            {/* Connecting line (desktop only) */}
            <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent md:block" />

            {[
              { n: "01", t: "Register", d: "Create your student or supervisor account." },
              { n: "02", t: "Get assigned", d: "Coordinator links you to your supervisor." },
              { n: "03", t: "Submit & review", d: "Share work, receive structured feedback." },
              { n: "04", t: "Defend", d: "Track milestones all the way to submission." },
            ].map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-naub-green to-naub-green-dark text-base font-bold text-white shadow-md ring-4 ring-white">
                  {s.n}
                </div>
                <h3 className="text-base font-semibold text-slate-900">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── CTA BANNER ─────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-naub-ink via-naub-ink to-naub-green-dark" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-naub-green/20 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center text-white sm:px-6 sm:py-20">
          <h2
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Ready to continue your research journey?
          </h2>
          <p className="max-w-xl text-white/75">
            Sign in or register to access your NAUB Prism workspace.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gold">
              <Link href="/register">
                Create account <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            {INSTITUTION.systemName} · {INSTITUTION.name}
          </p>
          <p>Secure · Role-based · Built for academic research</p>
        </div>
      </footer>
    </div>
  );
}