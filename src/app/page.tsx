import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  MessagesSquare,
  ShieldCheck,
  LineChart,
  Users,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { INSTITUTION } from "@/lib/constants";
import { Logo } from "@/components/shared/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
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

      <section className="hero-grid relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-32">
          <div className="animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
              <ShieldCheck className="h-3.5 w-3.5 text-naub-gold" />
              Official research supervision platform
            </div>
            <h1
              className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Research supervision, modernised for{" "}
              <span className="text-naub-gold">{INSTITUTION.name}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              NAUB Prism replaces paper logbooks and delayed feedback with continuous progress
              tracking, structured reviews, secure document exchange, and real-time communication
              between students, supervisors, and project coordinators.
            </p>
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
            <p className="mt-6 text-xs text-white/55">
              Secure role-based access for students, supervisors, and coordinators.
            </p>
          </div>

          <div className="animate-fade-up grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: FileCheck2,
                title: "Structured progress",
                text: "Submit chapters and updates with clear review status.",
              },
              {
                icon: MessagesSquare,
                title: "Direct messaging",
                text: "Chat with your assigned supervisor in real time.",
              },
              {
                icon: LineChart,
                title: "Live oversight",
                text: "Coordinators monitor engagement and completion rates.",
              },
              {
                icon: BookOpenCheck,
                title: "Milestone tracking",
                text: "Proposal through final dissertation, with deadlines.",
              },
            ].map((item) => (
              <div key={item.title} className="glass-panel rounded-2xl p-5">
                <item.icon className="mb-3 h-5 w-5 text-naub-gold" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl font-semibold tracking-tight text-slate-900"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Built for academic excellence at NAUB
          </h2>
          <p className="mt-3 text-slate-600">
            One platform that keeps every stakeholder informed, accountable, and aligned from
            proposal to final submission.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              role: "Students",
              icon: Users,
              points: [
                "Submit progress with PDF or DOCX attachments",
                "Track approvals, rejections, and revision requests",
                "Chat with your assigned supervisor",
              ],
            },
            {
              role: "Supervisors",
              icon: BookOpenCheck,
              points: [
                "Review assigned student work in one queue",
                "Provide structured feedback and decisions",
                "Set milestones and deadlines for your cohort",
              ],
            },
            {
              role: "Coordinators",
              icon: LineChart,
              points: [
                "Assign students to supervisors",
                "Monitor system-wide research activity",
                "Publish announcements and manage accounts",
              ],
            },
          ].map((card) => (
            <div key={card.role} className="surface-card rounded-2xl p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-naub-green-soft text-naub-green">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{card.role}</h3>
              <ul className="mt-4 space-y-2.5">
                {card.points.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-naub-gold" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Ready to continue your research journey?</h3>
            <p className="mt-1 text-sm text-slate-600">
              Sign in with your institutional account or register to join NAUB Prism.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Create account</Link>
            </Button>
          </div>
        </div>
      </section>

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
