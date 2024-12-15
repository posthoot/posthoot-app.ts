"use client";
import { WebhookSettings } from "@/components/settings/webhook-settings";
import { PageHeader } from "@/components/page-header";
import { TeamProvider } from "@/app/providers/team-provider";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WebhooksPage() {
  return (
    <div className="flex flex-col">
      <PageHeader heading="Webhooks" description="Manage your webhooks">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Webhook
        </Button>
      </PageHeader>
      <div className="px-4 py-6">
        <TeamProvider>
          <WebhookSettings />
        </TeamProvider>
      </div>
    </div>
  );
} 