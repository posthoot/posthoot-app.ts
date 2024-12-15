import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * @openapi
 * /api/webhooks/{webhookId}/deliveries:
 *   get:
 *     summary: Get webhook deliveries
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of webhook deliveries
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

    // First verify webhook belongs to team
    const webhook = await prisma.webhook.findUnique({
      where: {
        id: webhookId,
        teamId: session.user.teamId,
      },
    });

    if (!webhook) {
      return new NextResponse("Webhook not found", { status: 404 });
    }

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status")
      ? parseInt(searchParams.get("status")!)
      : undefined;

    // Get deliveries with pagination
    const [deliveries, total] = await Promise.all([
      prisma.webhookDelivery.findMany({
        where: {
          webhookId,
          ...(status && { status }),
        },
        orderBy: {
          createdAt: "desc",
        },
        take: Math.min(limit, 100), // Cap at 100
        skip: offset,
      }),
      prisma.webhookDelivery.count({
        where: {
          webhookId,
          ...(status && { status }),
        },
      }),
    ]);

    return NextResponse.json({
      deliveries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + deliveries.length < total,
      },
    });
  } catch (error) {
    console.error("[WEBHOOK_DELIVERIES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 