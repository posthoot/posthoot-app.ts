"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const data = [
  { name: "Jan", total: 4800, sales: 2400 },
  { name: "Feb", total: 3800, sales: 2100 },
  { name: "Mar", total: 5200, sales: 3200 },
  { name: "Apr", total: 4800, sales: 2900 },
  { name: "May", total: 5500, sales: 3100 },
  { name: "Jun", total: 6800, sales: 4100 },
  { name: "Jul", total: 7200, sales: 4300 },
  { name: "Aug", total: 6800, sales: 4000 },
  { name: "Sep", total: 7900, sales: 4800 },
  { name: "Oct", total: 8500, sales: 5200 },
  { name: "Nov", total: 8900, sales: 5400 },
  { name: "Dec", total: 9200, sales: 5800 },
];

export function Overview() {
  return (
    <Tabs defaultValue="all" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="all">All Time</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all" className="space-y-4">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
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
                <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
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
              </defs>
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Total
                            </span>
                            <span className="font-bold text-muted-foreground">
                              ${payload[0].value}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Sales
                            </span>
                            <span className="font-bold text-muted-foreground">
                              ${payload[1].value}
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
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#total)"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                fill="url(#sales)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  );
}