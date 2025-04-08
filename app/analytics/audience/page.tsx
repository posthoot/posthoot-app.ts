"use client";

import { AudienceInsights } from "@/components/analytics/audience-insights";
import { PageHeader } from "@/components/page-header";
import { useTeam } from "@/app/providers/team-provider";

export default function AudienceAnalyticsPage() {
  const { team } = useTeam();

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Audience Analytics" 
        description="Understand your audience behavior and demographics."
      />
      <div className="grid gap-4 p-4 md:p-8 pt-6">
        {team?.id && <AudienceInsights teamId={team.id} />}
      </div>
    </div>
  );
}
