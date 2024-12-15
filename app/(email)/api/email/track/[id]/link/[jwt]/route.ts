import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";
import { logger } from "@/app/lib/logger";
import { webhookService } from "@/app/lib/webhooks";
import { JwtDataForLink } from "nodemailer-mail-tracking/dist/types";
import { TrackingType, WebhookEventType } from "@/@prisma/client";

/**
 * @openapi
 * /api/email/track/link/{jwt}:
 *   get:
 *     summary: Track email link clicks
 *     tags: [Email]
 *     parameters:
 *       - in: path
 *         name: jwt
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Redirects to the tracked link
 *       401:
 *         description: Invalid JWT token
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; jwt: string }> }
) {
  try {
    const { id, jwt: jwtToken } = await params;

    // Verify JWT token
    const payload: JwtDataForLink = jwt.verify(
      jwtToken,
      process.env.JWT_SECRET!
    ) as JwtDataForLink;
    if (!payload || !payload.link) {
      return new NextResponse("Invalid token", { status: 401 });
    }

    // Record click event
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
        type: TrackingType.CLICKED,
        sentEmailId: id,
        data: {
          url: payload.url,
        },
      },
    });

    // Trigger webhook
    await webhookService.triggerWebhook(
      WebhookEventType.EMAIL_CLICKED,
      sentEmail.campaign.teamId,
      {
        emailId: id,
        url: payload.url,
        timestamp: new Date().toISOString(),
      }
    );

    logger.info({
      message: "Email link clicked",
      label: "email-link-clicked",
      value: {
        url: payload.url,
      },
      fileName: "email-link-clicked",
      emoji: "🔗",
      action: "email-link-clicked",
    });

    // Redirect to original URL
    return NextResponse.redirect(payload.url);
  } catch (error) {
    logger.error({
      message: "Error tracking email link click",
      label: "email-link-clicked",
      value: {},
      fileName: "email-link-clicked",
      emoji: "🔗",
      action: "email-link-clicked",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
