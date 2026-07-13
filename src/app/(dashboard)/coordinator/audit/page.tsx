import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime, fullName, statusLabel } from "@/lib/utils";

export const metadata = { title: "Audit log" };

export default async function AuditPage() {
  await requireUser(["COORDINATOR"]);
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { firstName: true, lastName: true, role: true } } },
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Audit log"
        description="System activity for compliance and operational monitoring. Private message content is never stored here."
      />
      <Card>
        <CardContent className="overflow-x-auto p-5">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 font-medium">Timestamp</th>
                <th className="pb-3 font-medium">Actor</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Entity</th>
                <th className="pb-3 font-medium">Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50">
                  <td className="py-3 text-slate-500">{formatDateTime(log.createdAt)}</td>
                  <td className="py-3">
                    {log.actor ? fullName(log.actor.firstName, log.actor.lastName) : "System"}
                  </td>
                  <td className="py-3 font-medium">{statusLabel(log.action)}</td>
                  <td className="py-3">{log.entityType}</td>
                  <td className="py-3 font-mono text-xs text-slate-500">{log.entityId ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
