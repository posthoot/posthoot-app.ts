"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Mail, MousePointerClick, Eye, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeam } from "@/app/providers/team-provider";

interface EmailEvent {
  id: string;
  type: "OPENED" | "CLICKED" | "BOUNCED" | "FAILED";
  createdAt: string;
  sentEmail: {
    subject: string;
    recipient: string;
  };
}

export function RecentActivity() {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { team } = useTeam();
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `/api/email/track/events?limit=10&teamId=${team?.id}`
        );
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventIcon = (type: EmailEvent["type"]) => {
    switch (type) {
      case "OPENED":
        return <Eye className="h-4 w-4" />;
      case "CLICKED":
        return <MousePointerClick className="h-4 w-4" />;
      case "BOUNCED":
      case "FAILED":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: EmailEvent["type"]) => {
    switch (type) {
      case "OPENED":
        return "text-blue-500";
      case "CLICKED":
        return "text-green-500";
      case "BOUNCED":
      case "FAILED":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {events.map((event) => (
        <div key={event.id} className="flex items-start space-x-4">
          <div className={cn("mt-1", getEventColor(event.type))}>
            {getEventIcon(event.type)}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {event.sentEmail.subject}
            </p>
            <p className="text-sm text-muted-foreground">
              {event.sentEmail.recipient}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(event.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <div className="text-center text-sm text-muted-foreground">
          No recent activity
        </div>
      )}
    </div>
  );
}
