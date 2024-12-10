"use client";

import { CampaignsList } from "@/components/campaigns/campaigns-list";
import { CampaignsHeader } from "@/components/campaigns/campaigns-header";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TemplatesProvider } from "../providers/templates-provider";
import { MailingListProvider } from "../providers/mailinglist-provider";
import { SMTPProvider } from "../providers/smtp-provider";
import { CampaignsProvider } from "../providers/campaigns-provider";

export default function CampaignsPage() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Campaigns"
        description="Manage your campaigns and track their performance"
      >
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      </PageHeader>
      <div className="px-4">
        <TemplatesProvider>
          <MailingListProvider>
            <SMTPProvider>
              <CampaignsProvider>
                <CampaignsList
                  isOpen={isOpen}
                  onClose={() => setIsOpen(!isOpen)}
                />
              </CampaignsProvider>
            </SMTPProvider>
          </MailingListProvider>
        </TemplatesProvider>
      </div>
    </div>
  );
}
