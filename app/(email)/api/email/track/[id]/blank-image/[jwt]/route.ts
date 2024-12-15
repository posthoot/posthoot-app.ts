import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";
import { webhookService } from "@/app/lib/webhooks";
import { TrackingType, WebhookEventType } from "@/@prisma/client";
import jwt from "jsonwebtoken";
// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; jwt: string }> }
) {
  try {
    const { id, jwt: jwtToken } = await params;

    // Verify JWT token
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET!);
    if (!payload) {
      return new NextResponse("Invalid token", { status: 401 });
    }

    // Record open event
    const sentEmail = await prisma.sentEmail.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            teamId: true,
          },
        },
      },
    });

    if (!sentEmail) {
      return new NextResponse("Email not found", { status: 404 });
    }

    await prisma.emailTracking.create({
      data: {
        type: TrackingType.OPENED,
        sentEmailId: id,
      },
    });

    // Trigger webhook
    await webhookService.triggerWebhook(
      WebhookEventType.EMAIL_OPENED,
      sentEmail.campaign.teamId,
      {
        emailId: id,
        timestamp: new Date().toISOString(),
      }
    );

    logger.info({
      message: "Email opened",
      label: "email",
      value: {
        emailId: id,
      },
      emoji: "📩",
      fileName: "track/blank-image/[jwt]/route.ts",
      action: "trackEmailOpen",
    });

    // Return tracking pixel
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    logger.error({
      message: "Error tracking email open",
      label: "email",
      value: {
        emailId: (await params).id,
      },
      emoji: "📩",
      fileName: "track/blank-image/[jwt]/route.ts",
      action: "trackEmailOpen",
    });
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  }
}
