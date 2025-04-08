"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { TeamAnalytics } from "@/components/analytics/team-analytics";
import { useTeam } from "@/app/providers/team-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart2,
  Users,
  Mail,
  TrendingUp
} from "lucide-react";

export default function TeamAnalyticsPage() {
  const { team } = useTeam();

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Team Analytics" 
        description="Analyze your team's email marketing performance."
      />
      
      <Tabs defaultValue="overview" className="p-4 md:p-8 pt-6 space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="member-activity" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Member Activity
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {team?.id && <TeamAnalytics teamId={team.id} />}
          </div>
        </TabsContent>

        <TabsContent value="member-activity" className="space-y-4">
          <Card className="p-6">
            <div className="grid gap-4">
              {/* Member activity details will be implemented here */}
              <div className="text-center text-muted-foreground">
                Member activity analytics coming soon
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card className="p-6">
            <div className="grid gap-4">
              {/* Campaign performance by team member will be implemented here */}
              <div className="text-center text-muted-foreground">
                Campaign performance by team member coming soon
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="p-6">
            <div className="grid gap-4">
              {/* Trend analysis will be implemented here */}
              <div className="text-center text-muted-foreground">
                Team performance trends coming soon
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
