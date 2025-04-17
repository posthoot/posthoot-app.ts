import { Card, CardContent } from "@/components/ui/card";
import { Users, Mail, MousePointerClick, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { MetricsData } from "@/lib/stats";
import { useTeam } from "@/app/providers/team-provider";

export function Stats() {
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { team } = useTeam();

  useEffect(() => {
    if (!team?.id) return;

    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `/api/analytics/team/overview?teamId=${team?.id}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const { data } = await response.json();
        
        // Transform team overview data for stats
        const currentPeriodData = {
          total: data.totalEmails,
          openRate: data.averageOpenRate / 100,
          clickRate: data.averageClickRate / 100,
          bounceRate: data.bounceRate / 100,
        };

        // Get previous period from monthly stats
        const previousPeriodData = data?.monthlyStats?.[data?.monthlyStats?.length - 2] || null;
        const transformedPreviousData = previousPeriodData ? {
          total: previousPeriodData.totalEmails,
          openRate: previousPeriodData.openRate / 100,
          clickRate: previousPeriodData.clickRate / 100,
          bounceRate: previousPeriodData.bounceRate / 100,
        } : null;

        setMetricsData([currentPeriodData, transformedPreviousData].filter(Boolean));
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [team?.id]);

  // Calculate current metrics (most recent data point)
  const currentMetrics = metricsData[0] || null;

  // Calculate trends by comparing with previous period
  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get metrics from previous period for comparison
  const previousMetrics = metricsData[1] || null;

  const stats = [
    {
      name: "Total Sent",
      value: currentMetrics?.total || 0,
      icon: Mail,
      change: previousMetrics
        ? calculateTrend(
            currentMetrics?.total || 0,
            previousMetrics.total
          ).toFixed(1) + "%"
        : "0%",
      trend:
        previousMetrics && currentMetrics
          ? currentMetrics.total >= previousMetrics.total
            ? "up"
            : "down"
          : "up",
    },
    {
      name: "Open Rate",
      value: currentMetrics
        ? `${(currentMetrics.openRate * 100).toFixed(1)}%`
        : "0%",
      icon: Users,
      change: previousMetrics
        ? calculateTrend(
            currentMetrics?.openRate || 0,
            previousMetrics.openRate
          ).toFixed(1) + "%"
        : "0%",
      trend:
        previousMetrics && currentMetrics
          ? currentMetrics.openRate >= previousMetrics.openRate
            ? "up"
            : "down"
          : "up",
    },
    {
      name: "Click Rate",
      value: currentMetrics
        ? `${(currentMetrics.clickRate * 100).toFixed(1)}%`
        : "0%",
      icon: MousePointerClick,
      change: previousMetrics
        ? calculateTrend(
            currentMetrics?.clickRate || 0,
            previousMetrics.clickRate
          ).toFixed(1) + "%"
        : "0%",
      trend:
        previousMetrics && currentMetrics
          ? currentMetrics.clickRate >= previousMetrics.clickRate
            ? "up"
            : "down"
          : "up",
    },
    {
      name: "Bounce Rate",
      value: currentMetrics
        ? `${(currentMetrics.bounceRate * 100).toFixed(1)}%`
        : "0%",
      icon: AlertTriangle,
      change: previousMetrics
        ? calculateTrend(
            currentMetrics?.bounceRate || 0,
            previousMetrics.bounceRate
          ).toFixed(1) + "%"
        : "0%",
      trend: "down",
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <Card
          key={stat.name}
          className="shadow-none rounded-lg relative overflow-hidden"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium leading-none text-muted-foreground">
                  {stat.name}
                </span>
                <span className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </span>
                <div className="flex items-center space-x-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      stat.trend === "up" ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    {stat.change.startsWith("-") ? "" : "+"}
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    vs previous period
                  </span>
                </div>
              </div>
              <div className=" p-2.5 bg-primary/5 dark:bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div
              className={cn(
                "absolute bottom-0 left-0 h-1 w-full",
                stat.trend === "up"
                  ? "bg-gradient-to-r from-emerald-500/20 to-emerald-500/30"
                  : "bg-gradient-to-r from-rose-500/20 to-rose-500/30"
              )}
            />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
