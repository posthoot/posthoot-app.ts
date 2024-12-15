import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";
import { WebhookEventType } from "@prisma/client";

const updateWebhookSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  isActive: z.boolean().optional(),
  events: z.array(z.nativeEnum(WebhookEventType)).optional(),
});

/**
 * @openapi
 * /api/webhooks/{webhookId}:
 *   get:
 *     summary: Get a webhook
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook details
 *       404:
 *         description: Webhook not found
 *       500:
 *         description: Internal Server Error
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const session = await auth();
    const { webhookId } = await params;
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const webhook = await prisma.webhook.findUnique({
      where: {
        id: webhookId,
        teamId: session.user.teamId,
      },
      include: {
        events: true,
      },
    });

    if (!webhook) {
      return new NextResponse("Webhook not found", { status: 404 });
    }

    return NextResponse.json(webhook);
  } catch (error) {
    console.error("[WEBHOOK_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * @openapi
 * /api/webhooks/{webhookId}:
 *   patch:
 *     summary: Update a webhook
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Webhook'
 *     responses:
 *       200:
 *         description: Webhook updated
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Webhook not found
 *       500:
 *         description: Internal Server Error
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { webhookId } = await params;

    const json = await req.json();
    const body = updateWebhookSchema.parse(json);

    // First, check if webhook exists and belongs to team
    const webhook = await prisma.webhook.findUnique({
      where: {
        id: webhookId,
        teamId: session.user.teamId,
      },
    });

    if (!webhook) {
      return new NextResponse("Webhook not found", { status: 404 });
    }

    // Update webhook
    const updatedWebhook = await prisma.webhook.update({
      where: {
        id: webhookId,
      },
      data: {
        name: body.name,
        url: body.url,
        isActive: body.isActive,
        ...(body.events && {
          events: {
            deleteMany: {},
            create: body.events.map((eventType) => ({
              eventType,
            })),
          },
        }),
      },
      include: {
        events: true,
      },
    });

    return NextResponse.json(updatedWebhook);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[WEBHOOK_UPDATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const session = await auth();
    const { webhookId } = await params;
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if webhook exists and belongs to team
    const webhook = await prisma.webhook.findUnique({
      where: {
        id: webhookId,
        teamId: session.user.teamId,
      },
    });

    if (!webhook) {
      return new NextResponse("Webhook not found", { status: 404 });
    }

    // Delete webhook
    await prisma.webhook.delete({
      where: {
        id: webhookId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[WEBHOOK_DELETE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 