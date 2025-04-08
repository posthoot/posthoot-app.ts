"use client";

import { PageHeader } from "@/components/page-header";
import { useTeam } from "@/app/providers/team-provider";
import { TeamAnalytics } from "@/components/analytics/team-analytics";
import { Overview } from "@/components/overview";
import { Stats } from "@/components/stats";
import { RecentActivity } from "@/components/recent-activity";
import { AnalyticsExport } from "@/components/analytics/analytics-export";

export default function AnalyticsPage() {
  const { team } = useTeam();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        heading="Analytics Dashboard"
        description="Comprehensive analytics and insights for your email campaigns"
      />

      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stats />
        </div>

        <div className="grid gap-4">
          <AnalyticsExport teamId={team?.id} />
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          <div className="col-span-4">
            <h2 className="text-2xl font-semibold mb-2">Performance Overview</h2>
            <p className="text-muted-foreground mb-4">
              Campaign performance trends over time
            </p>
            <div className="pl-2 bg-primary/5 p-4 rounded-lg">
              <Overview />
            </div>
          </div>

          <div className="col-span-3">
            <h2 className="text-2xl font-semibold mb-2">Recent Activity</h2>
            <p className="text-muted-foreground mb-4">
              Latest email campaign events and interactions
            </p>
            <div>
              <RecentActivity />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <h2 className="text-2xl font-semibold">Team Analytics</h2>
          <p className="text-muted-foreground">
            Performance metrics across your entire team
          </p>
          <TeamAnalytics teamId={team?.id || ''} />
        </div>
      </div>
    </div>
  );
}
