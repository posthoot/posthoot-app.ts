import { CampaignsList } from "@/components/campaigns/campaigns-list";
import { CampaignsHeader } from "@/components/campaigns/campaigns-header";

export default function CampaignsPage() {
  return (
    <div className="p-8 space-y-8">
      <CampaignsHeader />
      <CampaignsList />
    </div>
  );
}