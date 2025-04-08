"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  UsersIcon,
  TrendingUpIcon,
  BarChart2Icon,
  GlobeIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeamOverview {
  totalEmails: number;
  totalOpens: number;
  totalClicks: number;
  averageOpenRate: number;
  averageClickRate: number;
  deviceStats: Record<string, number>;
  geoStats: Record<string, number>;
  monthlyStats: Array<{
    month: string;
    totalEmails: number;
    openRate: number;
    clickRate: number;
  }>;
  topCampaigns: Array<{
    campaignId: string;
    name: string;
    openRate: number;
    clickRate: number;
    engagementScore: number;
  }>;
  topPerformers: Array<{
    type: string;
    value: string;
    engagementRate: number;
    sampleSize: number;
  }>;
}

const COLORS = ["#007C89", "#FF8C61", "#98D8AA", "#FFB7B7", "#A7BBC7"];

export function TeamAnalytics({ teamId }: { teamId: string }) {
  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overviewResponse, trendsResponse] = await Promise.all([
          fetch(`/api/analytics/team?teamId=${teamId}&type=overview`),
          fetch(`/api/analytics/team?teamId=${teamId}&type=trends`),
        ]);

        if (!overviewResponse.ok) throw new Error("Failed to fetch team analytics");

        const overviewData = await overviewResponse.json();
        setOverview(overviewData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchAnalytics();
    }
  }, [teamId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="min-h-[400px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="min-h-[400px] flex items-center justify-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!overview) return null;

  const deviceData = Object.entries(overview.deviceStats).map(([device, count]) => ({
    name: device,
    value: count,
  }));

  const geoData = Object.entries(overview.geoStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({
      name: country,
      value: count,
    }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Total Emails
            </div>
            <div className="text-2xl font-bold">
              {overview.totalEmails.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Avg Open Rate
            </div>
            <div className="text-2xl font-bold">
              {overview.averageOpenRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Avg Click Rate
            </div>
            <div className="text-2xl font-bold">
              {overview.averageClickRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Total Opens
            </div>
            <div className="text-2xl font-bold">
              {overview.totalOpens.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            Performance Trends
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <BarChart2Icon className="h-4 w-4" />
            Device Breakdown
          </TabsTrigger>
          <TabsTrigger value="geo" className="flex items-center gap-2">
            <GlobeIcon className="h-4 w-4" />
            Geographic Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>
                Email engagement trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overview.monthlyStats}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="openRate"
                      name="Open Rate"
                      stroke="#007C89"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="clickRate"
                      name="Click Rate"
                      stroke="#FF8C61"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Device Usage</CardTitle>
              <CardDescription>
                Distribution of email opens by device type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({name, percent}) => 
                        `${name} ${(percent * 100).toFixed(1)}%`
                      }
                    >
                      {deviceData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo">
          <Card>
            <CardHeader>
              <CardTitle>Top Regions</CardTitle>
              <CardDescription>
                Geographic distribution of email engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geoData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#007C89" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Campaigns</CardTitle>
          <CardDescription>Campaigns with highest engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overview?.topCampaigns?.map((campaign) => (
              <div
                key={campaign.campaignId}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {campaign.campaignId}
                  </div>
                </div>
                <div className="text-right">
                  <div>{campaign.openRate.toFixed(1)}% open rate</div>
                  <div className="text-sm text-muted-foreground">
                    {campaign.clickRate.toFixed(1)}% click rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
