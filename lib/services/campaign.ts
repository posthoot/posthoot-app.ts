import { prisma } from "@/app/lib/prisma";
import { cleo } from "@/lib/services/email";
export async function scheduleCampaign(campaignId: string) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const queueManager = cleo.getQueueManager();
    queueManager.addTask("scheduleCampaign", {
      campaignId,
    }, {
        timeout: 10000,
        retryDelay: 1000,
        schedule: new Date(campaign.scheduledFor).toISOString(),
        backoff: {
            type: "exponential",
            delay: 1000,
        },
    });

    // Add your scheduling logic here
    // For example, you might want to send emails or update campaign status

    console.log(`Campaign ${campaignId} scheduled successfully.`);
  } catch (error) {
    console.error(`Failed to schedule campaign ${campaignId}:`, error);
    throw new Error("Failed to schedule campaign");
  }
}
