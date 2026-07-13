import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/utils";

const map: Record<string, "warning" | "success" | "danger" | "secondary" | "info"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  NEEDS_REVISION: "warning",
  NOT_STARTED: "secondary",
  IN_PROGRESS: "info",
  SUBMITTED: "info",
  OVERDUE: "danger",
  ACTIVE: "success",
  INACTIVE: "secondary",
  SUSPENDED: "danger",
  COMPLETED: "success",
  DRAFT: "secondary",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={map[status] ?? "secondary"}>{statusLabel(status)}</Badge>;
}
