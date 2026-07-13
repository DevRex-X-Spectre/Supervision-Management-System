import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { fullName, roleLabel } from "@/lib/utils";
import { CreateUserForm, UserStatusForm } from "@/components/shared/coordinator-forms";

export const metadata = { title: "Users" };

export default async function CoordinatorUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  await requireUser(["COORDINATOR"]);
  const params = await searchParams;
  const role = params.role;
  const q = params.q?.trim();

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as never } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { matricNumber: { contains: q, mode: "insensitive" } },
              { staffId: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ role: "asc" }, { lastName: "asc" }],
    take: 100,
  });

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="User management"
        description="Create accounts, review registrations, and activate or suspend users."
      />

      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-col gap-2 sm:flex-row">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search name, email, matric, staff ID"
              className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
            />
            <select name="role" defaultValue={role ?? ""} className="h-10 rounded-lg border border-slate-300 px-3 text-sm">
              <option value="">All roles</option>
              <option value="STUDENT">Student</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="COORDINATOR">Coordinator</option>
            </select>
            <button className="h-10 rounded-lg bg-naub-green px-4 text-sm font-medium text-white" type="submit">
              Filter
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 align-top">
                    <td className="py-3">
                      <p className="font-medium text-slate-900">{fullName(u.firstName, u.lastName, u.title)}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                      <p className="text-xs text-slate-400">
                        {u.matricNumber || u.staffId || ""}
                      </p>
                    </td>
                    <td className="py-3">{roleLabel(u.role)}</td>
                    <td className="py-3 text-slate-600">{u.department ?? "Not set"}</td>
                    <td className="py-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3">
                      <UserStatusForm userId={u.id} current={u.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
