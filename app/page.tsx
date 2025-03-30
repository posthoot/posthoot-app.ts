"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/overview";
import { RecentActivity } from "@/components/recent-activity";
import { Stats } from "@/components/stats";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { useEffect, useState } from "react";
import { useTeam } from "@/app/providers/team-provider";
import { downloadReport } from "@/app/lib/reports";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { subDays } from "date-fns";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";

interface CampaignMetrics {
  id: string;
  name: string;
  total: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  date: string;
}

export default function Home() {
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetrics[]>([]);
  const { team } = useTeam();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchCampaignMetrics = async () => {
      try {
        const response = await fetch(
          `/api/email/track/metrics?teamId=${team?.id}&groupBy=campaign`
        );
        const data = await response.json();
        setCampaignMetrics(data);
      } catch (error) {
        console.error("Failed to fetch campaign metrics:", error);
      }
    };

    // fetchCampaignMetrics();
  }, [team?.id]);

  const handleDownloadReport = async (
    period: "week" | "month" | "all",
    format: "csv" | "json"
  ) => {
    if (!team?.id || isDownloading) return;

    setIsDownloading(true);
    try {
      const startDate =
        period === "week"
          ? subDays(new Date(), 7)
          : period === "month"
          ? subDays(new Date(), 30)
          : subDays(new Date(), 90);

      await downloadReport({
        teamId: team.id,
        startDate,
        format,
        groupBy: "day",
      });
    } catch (error) {
      console.error("Failed to download report:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Campaign Name",
    },
    {
      accessorKey: "total",
      header: "Total Sent",
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
      <div className="flex-1 space-y-8">
        <PageHeader
          heading="Analytics"
          description="Your email campaign performance metrics"
          children={
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isDownloading}>
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? "Downloading..." : "Download Report"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport("week", "csv")}
                  >
                    This Week (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport("week", "json")}
                  >
                    This Week (JSON)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport("month", "csv")}
                  >
                    This Month (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport("month", "json")}
                  >
                    This Month (JSON)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport("all", "csv")}
                  >
                    All Time (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport("all", "json")}
                  >
                    All Time (JSON)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm">
                <Link href="/campaigns/new" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Link>
              </Button>
            </div>
          }
        />
        {/* / //{" "}
            <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
            //{" "}
            <p className="text-muted-foreground">
              // Your email campaign performance metrics //{" "}
            </p> */}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4">
          <Stats />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 px-4">
          <div className="col-span-4">
            <h2 className="text-2xl font-semibold mb-2">Overview</h2>
            <p className="text-muted-foreground mb-4">
              Campaign performance over time
            </p>
            <div className="pl-2 bg-primary/5 p-4 rounded-lg">
              <Overview />
            </div>
          </div>

          <div className="col-span-3">
            <h2 className="text-2xl font-semibold mb-2">Recent Activity</h2>
            <p className="text-muted-foreground mb-4">
              Your latest email campaign activities
            </p>
            <div>
              <RecentActivity />
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-4">
          <span className="text-2xl font-semibold">
            📊 Campaign Performance
          </span>
          <span className="text-muted-foreground">
            📈 Detailed metrics for all your email campaigns
          </span>
          <DataTable
            columns={columns}
            data={campaignMetrics}
            searchKey="name"
          />
        </div>
      </div>
    </div>
  );
}
