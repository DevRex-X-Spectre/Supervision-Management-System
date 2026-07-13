import { getCoordinatorAnalytics } from "@/features/analytics/queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionsChart } from "@/components/shared/analytics-charts";
import { BarChart3, CheckCircle2, Clock3, Users } from "lucide-react";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const a = await getCoordinatorAnalytics();
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Analytics"
        description="Engagement and completion metrics for research supervision across the institution."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={a.students} icon={Users} />
        <StatCard label="Approved submissions" value={a.approved} icon={CheckCircle2} tone="sky" />
        <StatCard label="Pending reviews" value={a.pending} icon={Clock3} tone="amber" />
        <StatCard label="Avg. feedback hours" value={a.avgTurnaroundHours} icon={BarChart3} tone="gold" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Status breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionsChart data={a.submissionsByStatus} />
        </CardContent>
      </Card>
    </div>
  );
}
