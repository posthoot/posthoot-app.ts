"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { addDays, format, subDays } from "date-fns";
import { useTeam } from "@/app/providers/team-provider";
import { MetricsData } from "@/types/stats";

export function Overview() {
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const { team } = useTeam();

  useEffect(() => {
    if (!team?.id) return;
    
    const fetchMetrics = async () => {
      const startDate = timeframe === 'week' 
        ? subDays(new Date(), 7)
        : timeframe === 'month'
          ? subDays(new Date(), 30)
          : subDays(new Date(), 90);

      try {
        // Fetch analytics trends data
        const response = await fetch(
          `/api/analytics/trends?teamId=${team?.id}&startDate=${startDate.toISOString()}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch analytics trends');
        }
        const { data } = await response.json();

        console.log(data, "data trends pain");

        // Data comes pre-transformed from the trends API
        const transformedData = data.map((point: any) => ({
          date: point.date,
          openRate: point.openRate,
          clickRate: point.clickRate,
          bounceRate: point.bounceRate,
          total: point.total
        })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setMetricsData(transformedData);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
  }, [timeframe, team?.id]);

  const chartData = metricsData.map(metric => ({
    date: metric.date,
    openRate: metric.openRate,
    clickRate: metric.clickRate,
    bounceRate: metric.bounceRate,
    total: metric.total
  }));

  return (
    <Tabs 
      defaultValue="week" 
      className="space-y-4" 
      onValueChange={(value) => setTimeframe(value as 'week' | 'month' | 'all')}
    >
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value={timeframe} className="space-y-4">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="openRate" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="clickRate" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--secondary))"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--secondary))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="bounceRate" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--destructive))"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--destructive))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => format(new Date(), 'MMM dd')}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Date
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {format(new Date(payload[0].payload.date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Open Rate
                              </span>
                              <span className="font-bold text-primary">
                                {((payload[0].value as number) * 100).toFixed(1) || 0}%
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Click Rate
                              </span>
                              <span className="font-bold text-secondary">
                                {((payload[1].value as number) * 100).toFixed(1) || 0}%
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Bounce Rate
                              </span>
                              <span className="font-bold text-destructive">
                                {((payload[2].value as number) * 100).toFixed(1) || 0}%
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Total Emails
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].payload.total}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="openRate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#openRate)"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="clickRate"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                fill="url(#clickRate)"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="bounceRate"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                fill="url(#bounceRate)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  );
}
