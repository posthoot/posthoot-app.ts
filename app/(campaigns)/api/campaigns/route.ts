import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { APIService } from "@/lib/services/api";
import { isEmpty, removeUndefined } from "@/lib/utils";
import { logger } from "@/app/lib/logger";
import { ApiError } from "@/types";

// Response interfaces
interface CampaignResponse {
  campaigns: Campaign[];
  error?: string;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "COMPLETED" | "FAILED";
  analytics?: Record<string, any>;
}

interface CreateCampaignRequest {
  name: string;
  description?: string;
  templateId: string;
  listId: string;
  schedule?: string;
  scheduledFor?: string;
  recurringSchedule?: string;
  cronExpression?: string;
  smtpConfigId: string;
  teamId: string;
}

interface CreateCampaignResponse {
  campaign: Campaign;
  error?: string;
}

interface UpdateCampaignRequest {
  id: string;
  name?: string;
  description?: string;
  schedule?: string;
}

interface UpdateCampaignResponse {
  campaign: Campaign;
  error?: string;
}

const FILE_NAME = "campaigns/route.ts";

/**
 * @openapi
 * /api/campaigns:
 *   get:
 *     summary: List all campaigns
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the team
 *     responses:
 *       200:
 *         description: List of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [DRAFT, SCHEDULED, SENDING, COMPLETED, FAILED]
 *                   analytics:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request - Team ID required
 *       500:
 *         description: Internal Server Error
 */
export async function GET(
  req: Request
): Promise<NextResponse<CampaignResponse | { error: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "campaigns",
        value: {},
        message: "Unauthorized access attempt",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❓",
        action: "validate",
        label: "campaigns",
        value: { teamId },
        message: "Missing team ID",
      });
      return NextResponse.json({ error: "Team ID required" }, { status: 400 });
    }

    const apiService = new APIService("campaigns", session);
    const campaigns = await apiService.get<Campaign[]>("", {
      teamId,
      userId: session.user.id,
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "fetch",
      label: "campaigns",
      value: { count: campaigns.length },
      message: "Successfully retrieved campaigns",
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "fetch",
      label: "campaigns",
      value: {},
      message: apiError.message || "Failed to fetch campaigns",
    });
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - templateId
 *               - listId
 *               - smtpConfigId
 *               - teamId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               templateId:
 *                 type: string
 *               listId:
 *                 type: string
 *               schedule:
 *                 type: string
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
 *               recurringSchedule:
 *                 type: string
 *               cronExpression:
 *                 type: string
 *               smtpConfigId:
 *                 type: string
 *               teamId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Campaign created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
export async function POST(
  req: Request
): Promise<NextResponse<CreateCampaignResponse | { error: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "campaigns",
        value: {},
        message: "Unauthorized access attempt",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as CreateCampaignRequest;
    if (!body) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❓",
        action: "validate",
        label: "campaigns",
        value: {},
        message: "Missing request body",
      });
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    const apiService = new APIService("campaigns", session);
    const campaign = await apiService.post<Campaign>("", {
      ...body,
      userId: session.user.id,
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "create",
      label: "campaigns",
      value: { campaignId: campaign.id },
      message: "Campaign created successfully",
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "create",
      label: "campaigns",
      value: { error: apiError.message },
      message: "Failed to create campaign",
    });
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/campaigns:
 *   put:
 *     summary: Update a campaign
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               schedule:
 *                 type: string
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request - Campaign ID required
 *       500:
 *         description: Internal Server Error
 */
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "campaigns",
        value: {},
        message: "Unauthorized access attempt",
      });
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = (await req.json()) as UpdateCampaignRequest;
    const { id, ...updateData } = body;

    if (!id) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❓",
        action: "validate",
        label: "campaigns",
        value: {},
        message: "Missing campaign ID",
      });
      return new NextResponse("Campaign ID required", { status: 400 });
    }

    logger.info({
      fileName: FILE_NAME,
      emoji: "📝",
      action: "update",
      label: "campaigns",
      value: { id },
      message: "Updating campaign",
    });

    const campaign = await new APIService("campaigns", session).post<Campaign>(
      "/campaigns/update",
      body
    );

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "update",
      label: "campaigns",
      value: { id },
      message: "Successfully updated campaign",
    });

    return NextResponse.json(campaign);
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "update",
      label: "campaigns",
      value: { error: (error as ApiError).message },
      message: "Failed to update campaign",
    });
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * @openapi
 * /api/campaigns:
 *   delete:
 *     summary: Delete a campaign
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the campaign to delete
 *     responses:
 *       204:
 *         description: Campaign deleted successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request - Campaign ID required
 *       500:
 *         description: Internal Server Error
 */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("id");

    if (!campaignId) {
      return new NextResponse("Campaign ID required", { status: 400 });
    }

    await new APIService("campaigns", session).delete(`/${campaignId}`);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CAMPAIGNS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
