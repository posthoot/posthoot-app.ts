"use client";

import { PageHeader } from "@/components/page-header";
import { TeamProvider, useTeam } from "@/app/providers/team-provider";
import { CampaignAnalytics } from "@/components/analytics/campaign-analytics";
import { CampaignComparison } from "@/components/analytics/campaign-comparison";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BarChart2, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { CampaignsProvider, useCampaigns } from "@/app/providers/campaigns-provider";

interface Campaign {
  id: string;
  name: string;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  date: string;
}

function CampaignsAnalytics() {
  const { campaigns } = useCampaigns();
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  const columns = [
    {
      id: "select",
      header: () => (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setSelectedCampaigns(
              selectedCampaigns.length > 0 ? [] : campaigns.map((c) => c.id)
            )
          }
        >
          {selectedCampaigns.length > 0 ? "Deselect All" : "Select All"}
        </Button>
      ),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const id = row.original.id;
            setSelectedCampaigns((prev) =>
              prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
            );
          }}
        >
          {selectedCampaigns.includes(row.original.id) ? "Selected" : "Select"}
        </Button>
      ),
    },
    {
      accessorKey: "name",
      header: "Campaign Name",
    },
    {
      accessorKey: "openRate",
      header: "Open Rate",
      cell: ({ row }) => {
        const value = row.getValue("openRate") as number;
        return `${(value * 100).toFixed(1)}%`;
      },
    },
    {
      accessorKey: "clickRate",
      header: "Click Rate",
      cell: ({ row }) => {
        const value = row.getValue("clickRate") as number;
        return `${(value * 100).toFixed(1)}%`;
      },
    },
    {
      accessorKey: "bounceRate",
      header: "Bounce Rate",
      cell: ({ row }) => {
        const value = row.getValue("bounceRate") as number;
        return `${(value * 100).toFixed(1)}%`;
      },
    },
    {
      accessorKey: "date",
      header: "Last Updated",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date") as string);
        return date.toLocaleDateString();
      },
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        heading="Campaign Analytics"
        description="Detailed analytics for individual campaigns and comparisons"
        children={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <BarChart2 className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="default" size="sm">
              <Layers className="w-4 h-4 mr-2" />
              Compare Selected
            </Button>
          </div>
        }
      />

      <div className="flex-1 space-y-8 p-8 pt-6">
        {selectedCampaigns.length > 1 ? (
          <CampaignComparison campaignIds={selectedCampaigns} />
        ) : selectedCampaigns.length === 1 ? (
          <CampaignAnalytics campaignId={selectedCampaigns[0]} />
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            Select one campaign to view detailed analytics, or multiple
            campaigns to compare them.
          </Card>
        )}

        <div className="grid gap-4">
          <h2 className="text-2xl font-semibold">Campaign Performance</h2>
          <p className="text-muted-foreground">
            Select campaigns to view detailed analytics or compare multiple
            campaigns
          </p>
          <DataTable columns={columns} data={campaigns} searchKey="name" />
        </div>
      </div>
    </div>
  );
}

export default function CampaignsAnalyticsPage() {
  return (
    <TeamProvider>
      <CampaignsProvider>
        <CampaignsAnalytics />
      </CampaignsProvider>
    </TeamProvider>
  );
}
