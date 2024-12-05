import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail, Users } from "lucide-react";

const automations = [
  {
    id: "1",
    name: "Welcome Email Sequence",
    status: "Active",
    triggers: "New Contact Added",
    actions: ["Send Email", "Wait 2 Days", "Send Follow-up"],
    lastRun: "2 hours ago",
  },
  {
    id: "2",
    name: "Lead Nurturing",
    status: "Draft",
    triggers: "Tag Added",
    actions: ["Send Email Series", "Update Contact"],
    lastRun: "Never",
  },
];

export function AutomationsList() {
  return (
    <div className="grid gap-4">
      {automations.map((automation) => (
        <Card key={automation.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{automation.name}</h3>
              <p className="text-sm text-muted-foreground">
                Triggers when: {automation.triggers}
              </p>
            </div>
            <Badge variant={automation.status === "Active" ? "default" : "secondary"}>
              {automation.status}
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{automation.actions.length} actions</span>
              <Clock className="h-4 w-4 ml-4" />
              <span>Last run: {automation.lastRun}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}