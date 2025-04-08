"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LineChartIcon } from "lucide-react";

interface BehaviorMetrics {
  count: number;
  engagementRate: number;
  trend: string;
}

interface AudienceInsights {
  behaviors: Record<string, BehaviorMetrics>;
}

export function AudienceBehavior({ teamId }: { teamId: string }) {
  const [insights, setInsights] = useState<AudienceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/analytics/audience?teamId=${teamId}`);
        if (!response.ok) throw new Error("Failed to fetch audience behavior");
        const data = await response.json();
        setInsights(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchInsights();
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

  const behaviorData = insights?.behaviors
    ? Object.entries(insights.behaviors).map(([type, metrics]) => ({
        type,
        ...metrics,
      }))
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Audience Behavior</CardTitle>
            <CardDescription>
              Engagement patterns and behavioral trends
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Engagement Rate Chart */}
          <div>
            <h4 className="text-sm font-medium mb-4">Engagement Rates</h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={behaviorData}>
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="engagementRate"
                    stroke="#007C89"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Behavior Metrics */}
          <div>
            <h4 className="text-sm font-medium mb-4">Behavioral Insights</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {behaviorData.map((behavior) => (
                <div
                  key={behavior.type}
                  className="p-4 border rounded-lg"
                >
                  <div className="font-medium capitalize mb-2">
                    {behavior.type.replace(/_/g, " ")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-semibold">
                        {behavior.engagementRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Engagement Rate
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold">
                        {behavior.count.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Occurrences
                      </div>
                    </div>
                  </div>
                  <div className={`mt-2 text-sm ${
                    behavior.trend.includes("up") ? "text-green-600" : "text-red-600"
                  }`}>
                    Trend: {behavior.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
