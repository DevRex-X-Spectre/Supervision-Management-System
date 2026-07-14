import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  FileCheck2,
  LineChart,
  MessagesSquare,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { INSTITUTION } from "@/lib/constants";
import { Logo } from "@/components/shared/logo";

const roleCards = [
  {
    role: "Students",
    icon: Users,
    points: ["Submit PDF or DOCX drafts", "Track approvals and revisions", "Chat with supervisors"],
  },
  {
    role: "Supervisors",
    icon: BookOpenCheck,
    points: ["Review assigned work", "Give structured feedback", "Set milestones and deadlines"],
  },
  {
    role: "Coordinators",
    icon: LineChart,
    points: ["Assign supervisor loads", "Monitor cohort activity", "Publish announcements"],
  },
];

const steps = [
  { n: "01", t: "Register", d: "Create a student, supervisor, or coordinator account." },
  { n: "02", t: "Get assigned", d: "Coordinator links each student to the right supervisor." },
  { n: "03", t: "Submit and review", d: "Share chapters, receive feedback, and resolve revisions." },
  { n: "04", t: "Complete", d: "Track milestones from proposal through final submission." },
];

function MiniTableCard() {
  return (
    <div className="rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-naub-ink">Review queue</p>
        <span className="rounded-full bg-naub-green-soft px-2.5 py-1 text-xs text-naub-green">
          Live
        </span>
      </div>
      <div className="space-y-3">
        {[
          ["Chapter Two", "Pending"],
          ["Proposal", "Approved"],
          ["Final Draft", "Revision"],
          ["Literature Review", "New"],
        ].map(([title, status]) => (
          <div key={title} className="grid grid-cols-[1fr_auto] items-center gap-4 text-sm">
            <span className="truncate text-slate-600">{title}</span>
            <span className="text-xs text-slate-400">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressArtifact() {
  return (
    <div className="rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">Milestone progress</p>
          <p className="mt-1 text-2xl font-medium text-naub-ink">72%</p>
        </div>
        <LineChart className="h-5 w-5 text-naub-green" />
      </div>
      <div className="flex h-20 items-end gap-2">
        {[34, 46, 38, 58, 54, 72, 66].map((height, index) => (
          <span
            key={index}
            className="w-full rounded-full bg-naub-green"
            style={{ height: `${height}%`, opacity: 0.28 + index * 0.08 }}
          />
        ))}
      </div>
    </div>
  );
}

function ComposerArtifact() {
  return (
    <div className="rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-3">
          <MessagesSquare className="h-5 w-5 text-slate-400" />
          <p className="flex-1 text-sm text-slate-400">Ask about a submission...</p>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-naub-ink text-white">
            <Send className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-naub-ink">
      <header className="relative z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Logo size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-naub-ink">{INSTITUTION.systemName}</p>
              <p className="text-xs text-slate-500">{INSTITUTION.shortName}</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-naub-ink md:flex">
            <a href="#roles" className="hover:text-naub-green">
              Roles
            </a>
            <a href="#workflow" className="hover:text-naub-green">
              Workflow
            </a>
            <a href="#security" className="hover:text-naub-green">
              Security
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="rounded-full text-naub-ink hover:bg-slate-100">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              className="hidden rounded-full bg-naub-green px-5 text-white hover:bg-naub-green-dark sm:inline-flex"
            >
              <Link href="/register">Create account</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:pb-28 lg:pt-16">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4 text-naub-green" />
                Official research supervision platform
              </div>
              <h1
                className="text-5xl font-normal leading-[1.08] tracking-normal text-naub-ink sm:text-6xl lg:text-7xl"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                Research supervision, modernised for{" "}
                <span className="italic text-naub-green">{INSTITUTION.name}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                NAUB Prism brings progress tracking, structured reviews, secure file exchange, and
                real-time collaboration into one quiet workspace for students, supervisors, and
                coordinators.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full bg-naub-green px-6 text-white hover:bg-naub-green-dark sm:w-auto"
                >
                  <Link href="/register">
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full border-naub-ink bg-transparent px-6 text-naub-ink hover:bg-slate-50 sm:w-auto"
                >
                  <Link href="/login">Sign in to your workspace</Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-[1fr_1.2fr_1fr] md:items-end">
              <div className="md:-translate-y-8">
                <MiniTableCard />
              </div>
              <div className="rounded-[24px] bg-slate-100 p-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { k: "3", v: "Role dashboards" },
                    { k: "100%", v: "Audit logged" },
                    { k: "24/7", v: "Real-time sync" },
                  ].map((stat) => (
                    <div key={stat.v} className="rounded-2xl bg-white p-5 text-center">
                      <p className="text-3xl font-medium text-naub-green">{stat.k}</p>
                      <p className="mt-2 text-sm text-slate-500">{stat.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:translate-y-8">
                <ProgressArtifact />
              </div>
              <div className="md:col-span-3 md:mx-auto md:w-[520px] md:-translate-y-2">
                <ComposerArtifact />
              </div>
            </div>
          </div>
        </section>

        <section id="roles" className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-sm text-slate-500">Roles</p>
                <h2
                  className="mt-3 text-4xl font-normal leading-tight tracking-normal text-naub-ink sm:text-5xl"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  Built around the real academic workflow.
                </h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3 lg:pt-2">
                {roleCards.map((card) => (
                  <div key={card.role} className="rounded-[24px] bg-white p-6">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-naub-green-soft text-naub-green">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-naub-ink">{card.role}</h3>
                    <ul className="mt-5 space-y-3">
                      {card.points.map((point) => (
                        <li key={point} className="flex gap-2.5 text-sm leading-6 text-slate-600">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-naub-green" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm text-slate-500">Workflow</p>
              <h2
                className="mt-3 text-4xl font-normal leading-tight tracking-normal text-naub-ink sm:text-5xl"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                From proposal to defence, every handoff stays visible.
              </h2>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-4">
              {steps.map((step) => (
                <div key={step.n} className="rounded-[24px] bg-slate-100 p-6">
                  <p className="text-sm text-slate-500">{step.n}</p>
                  <h3 className="mt-8 text-lg font-medium text-naub-ink">{step.t}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="bg-white">
          <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:pb-24">
            <div className="grid gap-6 rounded-[24px] bg-naub-green-soft p-8 text-naub-green md:grid-cols-[0.9fr_1.1fr] md:p-10">
              <div>
                <p className="text-sm">Secure by role</p>
                <h2
                  className="mt-4 text-3xl font-normal leading-tight tracking-normal sm:text-4xl"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  The right people see the right research records.
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: ShieldCheck, title: "Role-based access", text: "Dashboards and actions are scoped to each user type." },
                  { icon: FileCheck2, title: "Audit trail", text: "Submissions, reviews, and administrative actions stay logged." },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-white/70 p-5">
                    <item.icon className="h-5 w-5" />
                    <h3 className="mt-4 text-base font-medium">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 opacity-80">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center">
            <div>
              <h2
                className="text-4xl font-normal leading-tight tracking-normal text-naub-ink sm:text-5xl"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                Ready to continue your research journey?
              </h2>
              <p className="mt-4 max-w-xl text-slate-600">
                Sign in or register to access your NAUB Prism workspace.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-naub-green px-6 text-white hover:bg-naub-green-dark"
              >
                <Link href="/register">
                  Create account
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-naub-ink bg-transparent px-6 text-naub-ink hover:bg-white"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

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
