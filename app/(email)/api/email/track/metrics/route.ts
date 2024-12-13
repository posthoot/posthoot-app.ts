import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { removeUndefined } from "@/lib/utils";
import { TrackingType } from "@/@prisma/client";
import { MetricsData } from "@/types/stats";

/**
 * @openapi
 * /api/email/track/metrics:
 *   get:
 *     summary: Get email tracking metrics
 *     tags: [Email]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *         description: Filter by campaign ID
 *       - in: query
 *         name: templateId
 *         schema:
 *           type: string
 *         description: Filter by template ID
 *       - in: query
 *         name: emailId
 *         schema:
 *           type: string
 *         description: Filter by specific email ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Email tracking metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 opened:
 *                   type: number
 *                 clicked:
 *                   type: number
 *                 bounced:
 *                   type: number
 *                 failed:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const campaignId = searchParams.get("campaignId");
  const templateId = searchParams.get("templateId");
  const emailId = searchParams.get("emailId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  const emails = await prisma.sentEmail.findMany({
    where: removeUndefined({
      id: emailId,
      team: {
        id: teamId,
      },
      campaign: campaignId ? { id: campaignId } : undefined,
      template: templateId ? { id: templateId } : undefined,
      sentAt: removeUndefined({
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      }),
    }),
    include: {
      tracking: true,
    },
    orderBy: {
      sentAt: "asc",
    },
  });

  // Group emails by date
  const emailsByDate = emails.reduce((acc, email) => {
    const date = email.sentAt.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        emails: [],
        counts: {
          [TrackingType.OPENED]: 0,
          [TrackingType.CLICKED]: 0,
          [TrackingType.BOUNCED]: 0,
          [TrackingType.FAILED]: 0,
        },
      };
    }
    acc[date].emails.push(email);
    email.tracking.forEach((track) => {
      acc[date].counts[track.type]++;
    });
    return acc;
  }, {} as Record<string, { emails: typeof emails; counts: Record<TrackingType, number> }>);

  // Convert to array of daily metrics
  const metrics: MetricsData[] = Object.entries(emailsByDate).map(
    ([date, data]: [
      string,
      {
        emails: typeof emails;
        counts: Record<TrackingType, number>;
      }
    ]) => {
      const dailyTotal = data.emails.length;
      return {
        date,
        total: dailyTotal,
        opened: data.counts[TrackingType.OPENED],
        openRate:
          dailyTotal === 0 ? 0 : data.counts[TrackingType.OPENED] / dailyTotal,
        clicked: data.counts[TrackingType.CLICKED],
        clickRate:
          dailyTotal === 0 ? 0 : data.counts[TrackingType.CLICKED] / dailyTotal,
        bounced: data.counts[TrackingType.BOUNCED],
        bounceRate:
          dailyTotal === 0 ? 0 : data.counts[TrackingType.BOUNCED] / dailyTotal,
        failed: data.counts[TrackingType.FAILED],
        failRate:
          dailyTotal === 0 ? 0 : data.counts[TrackingType.FAILED] / dailyTotal,
      };
    }
  );

  return NextResponse.json(metrics);
}
