import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "green",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "green" | "gold" | "sky" | "amber" | "red";
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    gold: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-orange-50 text-orange-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
            {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
          </div>
          <div className={cn("rounded-xl p-2.5", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
