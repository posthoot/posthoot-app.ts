import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, UserPlus, Send, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    icon: Mail,
    description: "Campaign 'Welcome Series' sent to 150 contacts",
    time: "2 hours ago",
    type: "email",
  },
  {
    icon: UserPlus,
    description: "Added 23 new subscribers from LinkedIn campaign",
    time: "4 hours ago",
    type: "contact",
  },
  {
    icon: MessageSquare,
    description: "New conversation started with Sarah Smith about email automation",
    time: "5 hours ago",
    type: "message",
  },
  {
    icon: Send,
    description: "A/B test completed for 'Summer Sale' campaign",
    time: "6 hours ago",
    type: "campaign",
  },
  {
    icon: Bell,
    description: "Campaign performance alert: Open rate above 45%",
    time: "8 hours ago",
    type: "alert",
  },
];

const getActivityStyles = (type: string) => {
  switch (type) {
    case "email":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
    case "contact":
      return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
    case "message":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
    case "campaign":
      return "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400";
    case "alert":
      return "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  }
};

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="flex items-start space-x-4 rounded-lg border p-4 transition-all hover:bg-accent/5"
        >
          <div className={cn("rounded-full p-2", getActivityStyles(activity.type))}>
            <activity.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}