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
} from "recharts";
import { TrendingUpIcon, MousePointerClickIcon, BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailAnalytics {
  openCount: number;
  openRate: number;
  uniqueOpens: number;
  clickCount: number;
  clickRate: number;
  uniqueClicks: number;
  bounceCount: number;
  complaintCount: number;
  repeatOpens: number;
  repeatClicks: number;
  firstOpenTime: number;
  averageReadTime: number;
  industryAvgOpenRate: number;
  industryAvgClickRate: number;
  engagementScore: number;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
  geoBreakdown: Record<string, number>;
  timelineData: Array<{
    timestamp: string;
    eventType: string;
    count: number;
    uniqueCount: number;
    deviceType: string;
    browser: string;
    country: string;
  }>;
}

interface HeatmapData {
  url: string;
  clicks: Array<{
    element: string;
    x: number;
    y: number;
    count: number;
  }>;
  segments: Array<{
    selector: string;
    clickRate: number;
    count: number;
  }>;
}

export function CampaignAnalytics({ campaignId }: { campaignId: string }) {
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [analyticsResponse, heatmapResponse] = await Promise.all([
          fetch(`/api/analytics/campaign?campaignId=${campaignId}`),
          fetch(`/api/analytics/heatmap?campaignId=${campaignId}`),
        ]);

        if (!analyticsResponse.ok) throw new Error("Failed to fetch analytics");
        if (!heatmapResponse.ok) throw new Error("Failed to fetch heatmap");

        const analyticsData = await analyticsResponse.json();
        const heatmapData = await heatmapResponse.json();

        setAnalytics(analyticsData.data);
        setHeatmap(heatmapData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchAnalytics();
    }
  }, [campaignId]);

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

  const timelineData = analytics?.timelineData || [];
  const deviceData = Object.entries(analytics?.deviceBreakdown || {}).map(
    ([device, count]) => ({
      device,
      count,
    })
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Open Rate
            </div>
            <div className="text-2xl font-bold">
              {analytics?.openRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Industry avg: {analytics?.industryAvgOpenRate?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Click Rate
            </div>
            <div className="text-2xl font-bold">
              {analytics?.clickRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Industry avg: {analytics?.industryAvgClickRate?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Engagement Score
            </div>
            <div className="text-2xl font-bold">
              {analytics?.engagementScore?.toFixed(1) || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Based on opens, clicks & time spent
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Avg Read Time
            </div>
            <div className="text-2xl font-bold">
              {Math.round(analytics?.averageReadTime / 1000) || 0}s
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Time between open & click
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            Activity Timeline
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Device Breakdown
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <MousePointerClickIcon className="h-4 w-4" />
            Click Heatmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Activity Over Time</CardTitle>
              <CardDescription>
                Opens and clicks over the campaign duration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Total Events"
                      stroke="#007C89"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="uniqueCount"
                      name="Unique Events"
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
              <CardTitle>Device Distribution</CardTitle>
              <CardDescription>
                Breakdown of devices used to open emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviceData}>
                    <XAxis dataKey="device" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#007C89" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle>Click Distribution</CardTitle>
              <CardDescription>
                Most clicked areas in your email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {heatmap?.segments.map((segment) => (
                  <div
                    key={segment.selector}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="font-medium">{segment.selector}</div>
                    <div className="text-right">
                      <div>{segment.count} clicks</div>
                      <div className="text-sm text-muted-foreground">
                        {segment.clickRate.toFixed(1)}% click rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
