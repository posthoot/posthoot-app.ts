import { Card } from "@/components/ui/card";
import { Mail, MessageSquare, UserPlus } from "lucide-react";

const activities = [
  {
    icon: Mail,
    description: "Campaign 'Welcome Series' sent to 150 contacts",
    time: "2 hours ago",
  },
  {
    icon: UserPlus,
    description: "New contact John Doe added",
    time: "4 hours ago",
  },
  {
    icon: MessageSquare,
    description: "New conversation started with Sarah Smith",
    time: "5 hours ago",
  },
];

export function RecentActivity() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="rounded-full p-2 bg-primary/10">
              <activity.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}