import { WebhookEventType } from "@/@prisma/client";
import { prisma } from "./prisma";
import { logger } from "./logger";
import crypto from "crypto";
import cleo from "@/lib/job";
const MAX_RETRIES = 3;

export interface WebhookPayload {
  id: string;
  type: WebhookEventType;
  timestamp: string;
  data: any;
}

class WebhookService {
  async createWebhook(data: {
    name: string;
    url: string;
    teamId: string;
    events: WebhookEventType[];
  }) {
    const secret = crypto.randomBytes(32).toString("hex");

    const webhook = await prisma.webhook.create({
      data: {
        name: data.name,
        url: data.url,
        secret,
        teamId: data.teamId,
        events: {
          create: data.events.map((eventType) => ({
            eventType,
          })),
        },
      },
      include: {
        events: true,
      },
    });

    return webhook;
  }

  @cleo.task({
    id: "webhook.trigger",
    queue: "webhooks",
    maxRetries: MAX_RETRIES,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  })
  async triggerWebhook(
    eventType: WebhookEventType,
    teamId: string,
    payload: any
  ) {
    try {
      // Find all active webhooks for this team that are subscribed to this event
      const webhooks = await prisma.webhook.findMany({
        where: {
          teamId,
          isActive: true,
          events: {
            some: {
              eventType,
            },
          },
        },
      });

      // Process each webhook
      const deliveryPromises = webhooks.map((webhook) =>
        this.deliverWebhook(webhook.id, eventType, payload)
      );

      await Promise.allSettled(deliveryPromises);
    } catch (error) {
      logger.error({
        message: "Failed to trigger webhooks",
        label: "webhooks",
        value: {
          eventType,
          teamId,
        },
        emoji: "🔔",
        fileName: "webhooks.ts",
        action: "triggerWebhook",
      });
    }
  }

  @cleo.task({
    id: "webhook.deliver",
    queue: "webhooks-deliveries",
    maxRetries: MAX_RETRIES,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  })
  async deliverWebhook(
    webhookId: string,
    eventType: WebhookEventType,
    data: any,
    retryCount = 0
  ): Promise<void> {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.isActive) {
      return;
    }

    const payload: WebhookPayload = {
      id: crypto.randomUUID(),
      type: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    // Generate signature
    const signature = generateSignature(
      JSON.stringify(payload),
      webhook.secret
    );

    // Make the HTTP request
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-ID": payload.id,
        "X-Webhook-Timestamp": payload.timestamp,
      },
      body: JSON.stringify(payload),
    });

    // Record the delivery
    await prisma.webhookDelivery.create({
      data: {
        webhookId,
        eventType,
        payload: payload as any,
        status: response.status,
        response: await response.text(),
      },
    });

    // Update webhook status
    await prisma.webhook.update({
      where: { id: webhookId },
      data: {
        lastStatus: response.status,
        lastAttempt: new Date(),
        retryCount: 0, // Reset retry count on success
      },
    });

    if (!response.ok && retryCount < MAX_RETRIES) {
      // Record the failed delivery
      await prisma.webhookDelivery.create({
        data: {
          webhookId,
          eventType,
          payload: data,
          status: 500,
          error: response.statusText,
        },
      });

      // Update webhook status
      await prisma.webhook.update({
        where: { id: webhookId },
        data: {
          lastStatus: 500,
          lastAttempt: new Date(),
          retryCount: retryCount + 1,
        },
      });

      // Retry if not exceeded max retries
      if (retryCount < MAX_RETRIES) {
        throw new Error("Webhook delivery failed");
      }
    }
  }
}

export function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export const webhookService = new WebhookService();