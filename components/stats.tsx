import { Card, CardContent } from "@/components/ui/card";
import { Users, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    name: "Total Contacts",
    value: "8,234",
    icon: Users,
    change: "+2.5%",
    trend: "up",
  },
  {
    name: "Email Sent",
    value: "12.3K",
    icon: Mail,
    change: "+12%",
    trend: "up",
  },
  {
    name: "Conversations",
    value: "24.4K",
    icon: MessageSquare,
    change: "+5%",
    trend: "up",
  },
  {
    name: "Conversion Rate",
    value: "2.4%",
    icon: TrendingUp,
    change: "-1.2%",
    trend: "down",
  },
];

export function Stats() {
  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.name} className="relative overflow-hidden">
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
                    className={
                      stat.trend === "up"
                        ? "text-emerald-500 text-sm font-medium"
                        : "text-rose-500 text-sm font-medium"
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="rounded-full p-2.5 bg-primary/5 dark:bg-primary/10">
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