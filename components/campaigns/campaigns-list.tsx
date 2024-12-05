import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const campaigns = [
  {
    id: "1",
    name: "Welcome Series",
    status: "Active",
    sent: 150,
    total: 300,
    openRate: "45%",
    clickRate: "12%",
  },
  {
    id: "2",
    name: "Monthly Newsletter",
    status: "Draft",
    sent: 0,
    total: 500,
    openRate: "0%",
    clickRate: "0%",
  },
];

export function CampaignsList() {
  return (
    <div className="grid gap-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{campaign.name}</h3>
              <p className="text-sm text-muted-foreground">
                {campaign.sent} of {campaign.total} sent
              </p>
            </div>
            <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>
              {campaign.status}
            </Badge>
          </div>
          <Progress value={(campaign.sent / campaign.total) * 100} className="mb-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Open Rate</p>
              <p className="font-medium">{campaign.openRate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Click Rate</p>
              <p className="font-medium">{campaign.clickRate}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}