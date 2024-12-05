"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { CustomXAxis } from "./charts/custom-x-axis";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 500 },
  { name: "Apr", value: 450 },
  { name: "May", value: 470 },
  { name: "Jun", value: 600 },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CustomXAxis />
        <Tooltip 
          contentStyle={{ 
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}