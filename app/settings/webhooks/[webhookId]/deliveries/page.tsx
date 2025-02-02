"use client";

import { WebhookDeliveries } from "@/components/settings/webhook-deliveries";
import { PageHeader } from "@/components/page-header";
import { TeamProvider } from "@/app/providers/team-provider";
import { useEffect, useState } from "react";
import { Webhook } from "@/types";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
export default function WebhookDeliveriesPage({
  params,
}: {
  params: Promise<{ webhookId: string }>;
}) {
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebhook = async () => {
      try {
        const { webhookId } = await params;
        const response = await fetch(`/api/webhooks/${webhookId}`);
        if (!response.ok) throw new Error("Failed to fetch webhook");
        const data = await response.json();
        setWebhook(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load webhook details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWebhook();
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!webhook) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Webhook not found</h2>
          <p className="text-muted-foreground">
            The webhook you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        heading={`Webhook Deliveries: ${webhook.name}`}
        description="View webhook delivery history and debug delivery issues"
      />
      <div className="px-4 py-6">
        <TeamProvider>
          <WebhookDeliveries webhookId={webhook.id} />
        </TeamProvider>
      </div>
    </div>
  );
} 