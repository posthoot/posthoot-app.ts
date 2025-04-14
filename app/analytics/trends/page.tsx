"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { useTeam } from "@/app/providers/team-provider";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Fix TypeScript issues with Recharts by providing explicit component types
import { ComponentProps, ComponentType } from "react";

type TrendData = {
  date: string;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  total: number;
};

export default function TrendsPage() {
  const { team } = useTeam();
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [timeframe, setTimeframe] = useState("30");

  useEffect(() => {
    const fetchTrendData = async () => {
      if (!team?.id) return;

      try {
        const response = await fetch(
          `/api/analytics/trends?teamId=${team.id}&days=${timeframe}`
        );
        if (!response.ok) throw new Error("Failed to fetch trend data");
        const { data } = await response.json();
        console.log(data);
        setTrendData(data);
      } catch (error) {
        console.error("Error fetching trend data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [team?.id, timeframe]);

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Trend Analysis"
        description="Analyze your email marketing performance over time."
      />
      <div className="grid gap-4 p-4 md:p-8 pt-6">
        <div className="flex justify-end ">
          <Select
            value={timeframe}
            onValueChange={(value) => setTimeframe(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          <Card className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                Loading trend data...
              </div>
            ) : trendData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] gap-2 text-muted-foreground">
                <h3 className="font-medium">No trend data available</h3>
                <p>Start sending campaigns to see performance trends.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  accessibilityLayer
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="openRate"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Open Rate"
                  />
                  <Area
                    type="monotone"
                    dataKey="clickRate"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Click Rate"
                  />
                  <Area
                    type="monotone"
                    dataKey="bounceRate"
                    stackId="1"
                    stroke="#ffc658"
                    fill="#ffc658"
                    name="Bounce Rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
