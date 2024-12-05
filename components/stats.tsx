import { Card } from "@/components/ui/card";
import { Users, Mail, MessageSquare, TrendingUp } from "lucide-react";

const stats = [
  {
    name: "Total Contacts",
    value: "8",
    icon: Users,
    change: "+2.5%",
  },
  {
    name: "Email Sent",
    value: "300",
    icon: Mail,
    change: "+12%",
  },
  {
    name: "Conversations",
    value: "24",
    icon: MessageSquare,
    change: "+5%",
  },
  {
    name: "Conversion Rate",
    value: "2.4%",
    icon: TrendingUp,
    change: "+1.2%",
  },
];

export function Stats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
            <div className="rounded-full p-2 bg-primary/10">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">{stat.change}</div>
        </Card>
      ))}
    </div>
  );
}