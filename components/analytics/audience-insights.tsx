"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PersonIcon } from "@radix-ui/react-icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface AudienceInsights {
  demographics: Record<string, number>;
  behaviors: Record<string, {
    count: number;
    engagementRate: number;
    trend: 'stable' | 'insufficient_data';
  }>;
  segments: null;
  preferences: Record<string, unknown>;
}

export function AudienceInsights({ teamId }: { teamId: string }) {
  const [insights, setInsights] = useState<AudienceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/analytics/audience?teamId=${teamId}`);
        if (!response.ok) throw new Error("Failed to fetch audience insights");
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

  const demographicData = insights?.demographics
    ? Object.entries(insights.demographics).map(([key, value]) => ({
        category: key,
        value,
      }))
    : [];

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PersonIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Audience Demographics</CardTitle>
            <CardDescription>
              Detailed breakdown of your audience demographics and segments
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Demographics Chart */}
          <div>
            <h4 className="text-sm font-medium mb-4">Demographics Distribution</h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#007C89" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Segments Chart */}
          <div>
            <h4 className="text-sm font-medium mb-4">Audience Segments</h4>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={Object.entries(insights?.behaviors || {})
                    .map(([key, value]) => ({
                      segment: key,
                      contacts: value.count,
                      engagementRate: value.engagementRate * 100
                    }))
                    .sort((a, b) => b.contacts - a.contacts)
                    .slice(0, 10)}
                  layout="vertical"
                  margin={{ left: 150 }}
                >
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="segment" 
                    width={140}
                    tick={{
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'contacts') return [`${value} contacts`, 'Contacts'];
                      if (name === 'engagementRate') return [`${value}%`, 'Engagement Rate'];
                      return [value, name];
                    }}
                  />
                  <Area dataKey="contacts" fill="#007C89" />
                  <Area dataKey="engagementRate" fill="#00A5B5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
