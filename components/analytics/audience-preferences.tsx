"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HeartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreferenceMetrics {
  count: number;
  score: number;
  confidence: number;
}

interface AudienceInsights {
  preferences: Record<string, PreferenceMetrics>;
}

export function AudiencePreferences({ teamId }: { teamId: string }) {
  const [insights, setInsights] = useState<AudienceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/analytics/audience?teamId=${teamId}`);
        if (!response.ok) throw new Error("Failed to fetch audience preferences");
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

  const preferenceData = insights?.preferences
    ? Object.entries(insights.preferences)
        .map(([category, metrics]) => ({
          category,
          ...metrics,
        }))
        .sort((a, b) => b.score - a.score)
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <HeartIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Content Preferences</CardTitle>
            <CardDescription>
              Audience preferences and content affinity
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Top Preferences */}
          <div>
            <h4 className="text-sm font-medium mb-4">Top Content Categories</h4>
            <div className="space-y-6">
              {preferenceData.map((preference) => (
                <div key={preference.category}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium capitalize">
                        {preference.category.replace(/_/g, " ")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {preference.count.toLocaleString()} interactions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{preference.score.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">
                        {preference.confidence >= 0.7
                          ? "High confidence"
                          : preference.confidence >= 0.4
                          ? "Medium confidence"
                          : "Low confidence"}
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={preference.score}
                    className={cn(
                      "h-2",
                      preference.confidence >= 0.7
                        ? "[&>div]:bg-green-500"
                        : preference.confidence >= 0.4
                        ? "[&>div]:bg-yellow-500"
                        : "[&>div]:bg-gray-500"
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <div className="text-2xl font-semibold">
                {preferenceData.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Content Categories
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold">
                {Math.round(
                  preferenceData.reduce((acc, curr) => acc + curr.confidence, 0) /
                    preferenceData.length * 100
                )}%
              </div>
              <div className="text-sm text-muted-foreground">
                Avg. Confidence
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold">
                {preferenceData
                  .reduce((acc, curr) => acc + curr.count, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Interactions
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
