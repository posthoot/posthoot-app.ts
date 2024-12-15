import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";
import { webhookService } from "@/app/lib/webhooks";
import { WebhookEventType } from "@prisma/client";

const webhookSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.nativeEnum(WebhookEventType)),
});

/**
 * @openapi
 * /api/webhooks:
 *   post:
 *     summary: Create a webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Webhook'
 *     responses:
 *       200:
 *         description: Webhook created
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const team = await prisma.team.findFirst({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
    });

    if (!team) {
      return new NextResponse("Team not found", { status: 404 });
    }

    const json = await req.json();
    const body = webhookSchema.parse(json);

    const webhook = await webhookService.createWebhook({
      events: body.events,
      name: body.name,
      url: body.url,
      teamId: team.id,
    });

    return NextResponse.json(webhook);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[WEBHOOK_CREATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * @openapi
 * /api/webhooks:
 *   get:
 *     summary: Get all webhooks
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: List of webhooks
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const team = await prisma.team.findFirst({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
    });

    const webhooks = await prisma.webhook.findMany({
      where: {
        teamId: team.id,
      },
      include: {
        events: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error("[WEBHOOK_LIST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
