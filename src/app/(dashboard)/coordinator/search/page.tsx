import { globalSearch } from "@/features/analytics/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { fullName, roleLabel, formatDate } from "@/lib/utils";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const results = q ? await globalSearch(q) : { users: [], projects: [], submissions: [] };

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Global search"
        description="Find users, projects, and submission metadata across the system."
      />
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, email, matric, project title..."
          className="h-11 flex-1 rounded-xl border border-slate-300 px-4 text-sm shadow-sm"
        />
        <button type="submit" className="h-11 rounded-xl bg-naub-green px-5 text-sm font-medium text-white">
          Search
        </button>
      </form>

      {!q ? (
        <p className="text-sm text-slate-500">Enter at least 2 characters to search.</p>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle>Users ({results.users.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {results.users.map((u) => (
                <div key={u.id} className="rounded-xl border border-slate-100 px-4 py-3 text-sm">
                  <p className="font-medium">{fullName(u.firstName, u.lastName)} · {roleLabel(u.role)}</p>
                  <p className="text-slate-500">{u.email} · {u.department ?? "No department"}</p>
                  <StatusBadge status={u.status} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Projects ({results.projects.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {results.projects.map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-100 px-4 py-3 text-sm">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-slate-500">
                    {fullName(p.student.firstName, p.student.lastName)}
                    {p.supervisor ? ` · Sup: ${fullName(p.supervisor.firstName, p.supervisor.lastName)}` : ""}
                  </p>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Submissions metadata ({results.submissions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-slate-500">
                Coordinators see titles and status only. File contents and chat are not available here.
              </p>
              {results.submissions.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-100 px-4 py-3 text-sm">
                  <p className="font-medium">{s.title}</p>
                  <p className="text-slate-500">
                    {fullName(s.student.firstName, s.student.lastName)} · {formatDate(s.submittedAt)}
                  </p>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
