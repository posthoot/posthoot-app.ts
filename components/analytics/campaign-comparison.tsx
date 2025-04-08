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
} from "recharts";
import { ScaleIcon, TrendingUpIcon } from "lucide-react";
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
  timelineData: Array<{
    timestamp: string;
    eventType: string;
    count: number;
    uniqueCount: number;
  }>;
}

export function CampaignComparison({ campaignIds }: { campaignIds: string[] }) {
  const [analytics, setAnalytics] = useState<Record<string, EmailAnalytics> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/analytics/campaign?campaignIds=${campaignIds.join(",")}`
        );

        if (!response.ok) throw new Error("Failed to fetch campaign comparison");

        const data = await response.json();
        setAnalytics(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (campaignIds.length > 0) {
      fetchAnalytics();
    }
  }, [campaignIds]);

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

  if (!analytics) return null;

  const campaigns = Object.entries(analytics);
  const engagementData = campaigns.map(([id, data]) => ({
    id,
    openRate: data.openRate,
    clickRate: data.clickRate,
    engagementScore: data.engagementScore,
  }));

  const timelineData = campaigns.reduce((acc, [id, data]) => {
    data?.timelineData?.forEach((point) => {
      const date = new Date(point.timestamp).toLocaleDateString();
      acc[date] = {
        ...acc[date],
        date,
        [id]: point.count,
      };
    });
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ScaleIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Campaign Comparison</CardTitle>
              <CardDescription>
                Compare performance metrics across campaigns
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="engagement">
            <TabsList>
              <TabsTrigger value="engagement">Engagement Metrics</TabsTrigger>
              <TabsTrigger value="timeline">Timeline Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="engagement">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData}>
                    <XAxis dataKey="id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      name="Open Rate"
                      dataKey="openRate"
                      fill="#007C89"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      name="Click Rate"
                      dataKey="clickRate"
                      fill="#FF8C61"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      name="Engagement Score"
                      dataKey="engagementScore"
                      fill="#98D8AA"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Object.values(timelineData)}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {campaigns.map(([id], index) => (
                      <Line
                        key={id}
                        type="monotone"
                        dataKey={id}
                        name={`Campaign ${index + 1}`}
                        stroke={
                          index === 0
                            ? "#007C89"
                            : index === 1
                            ? "#FF8C61"
                            : "#98D8AA"
                        }
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed Metrics Comparison */}
      <div className="grid gap-6 md:grid-cols-3">
        {campaigns.map(([id, data], index) => (
          <Card key={id}>
            <CardHeader>
              <CardTitle className="text-base">Campaign {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Open Rate
                </div>
                <div className="text-2xl font-bold">{data.openRate?.toFixed(1) || 0}%</div>
                <div className="text-xs text-muted-foreground">
                  Industry avg: {data.industryAvgOpenRate?.toFixed(1) || 0}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Click Rate
                </div>
                <div className="text-2xl font-bold">{data.clickRate?.toFixed(1) || 0}%</div>
                <div className="text-xs text-muted-foreground">
                  Industry avg: {data.industryAvgClickRate?.toFixed(1) || 0}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Engagement Score
                </div>
                <div className="text-2xl font-bold">
                  {data.engagementScore?.toFixed(1) || 0}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Avg Read Time
                </div>
                <div className="text-2xl font-bold">
                  {Math.round(data.averageReadTime / 1000) || 0}s
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
