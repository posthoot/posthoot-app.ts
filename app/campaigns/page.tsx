import { CampaignsList } from "@/components/campaigns/campaigns-list";
import { CampaignsHeader } from "@/components/campaigns/campaigns-header";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CampaignsPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Campaigns"
        description="Manage your campaigns and track their performance"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      </PageHeader>
      <div className="px-4">
        <CampaignsList />
      </div>
    </div>
  );
}
