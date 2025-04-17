const FILE_NAME = "app/api/mailing-list/route.ts";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/app/lib/logger";
import { z } from "zod";
import { APIService } from "@/lib/services/api";
import { MailingList, ApiError } from "@/lib";

const mailingListSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  teamId: z.string().min(1, "Team ID is required"),
});

interface CreateMailingListRequest {
  name: string;
  description?: string;
  teamId: string;
}

interface CreateMailingListResponse {
  list?: MailingList;
  error?: string;
}

/**
 * @openapi
 * /api/mailing-list:
 *   post:
 *     summary: Create a new mailing list
 *     tags: [MailingList]
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
 *               - teamId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               teamId:
 *                 type: string
 */
export async function POST(
  request: Request
): Promise<NextResponse<CreateMailingListResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "mailing-list",
        value: {},
        message: "Unauthorized",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiService = new APIService("mailing-lists", session);
    const body = (await request.json()) as CreateMailingListRequest;

    const validatedData = mailingListSchema.parse(body);

    const createdList = await apiService.post<MailingList>(
      "",
      validatedData
    );

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "create",
      label: "mailing-list",
      value: { listId: createdList.id },
      message: "Mailing list created successfully",
    });

    return NextResponse.json({ list: createdList });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "create",
      label: "mailing-list",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to create mailing list",
    });
    return NextResponse.json(
      { error: apiError.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/mailing-list:
 *   get:
 *     summary: Get mailing lists
 *     tags: [Mailing Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of mailing lists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MailingList'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "mailing-list",
        value: {},
        message: "Unauthorized",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "validate",
        label: "mailing-list",
        value: { teamId: null },
        message: "Missing team ID",
      });
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    const apiService = new APIService("mailing-lists", session);
    const lists = await apiService.get<{
      data: MailingList[];
      total: number;
      page: number;
      limit: number;
    }>("", {
      limit: 100,
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "fetch",
      label: "mailing-list",
      value: { count: lists.total },
      message: "Mailing lists fetched successfully",
    });

    return NextResponse.json(lists);
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "fetch",
      label: "mailing-list",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to fetch mailing lists",
    });
    return NextResponse.json(
      { error: apiError.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
