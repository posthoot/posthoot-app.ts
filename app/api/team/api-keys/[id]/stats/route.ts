import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { APIService } from "@/lib/services/api";
import { logger } from "@/app/lib/logger";
import { ApiError } from "@/types";

const FILE_NAME = "app/api/team/api-keys/[id]/stats/route.ts";

interface GetAPIKeyStatsResponse {
  totalRequests: number;
  successRate: number;
  topEndpoints: Array<{
    endpoint: string;
    count: number;
  }>;
  recentErrors: Array<{
    timestamp: string;
    error: string;
  }>;
}

/**
 * @openapi
 * /api/team/api-keys/{id}/stats:
 *   get:
 *     summary: Get API key usage stats
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key usage stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRequests:
 *                   type: number
 *                 successRate:
 *                   type: number
 *                 topEndpoints:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       endpoint:
 *                         type: string
 *                       count:
 *                         type: number
 *                 recentErrors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                       error:
 *                         type: string
 *       404:
 *         description: API key not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 * 
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<GetAPIKeyStatsResponse | { error: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "api-key-stats",
        value: {},
        message: "Unauthorized access attempt"
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiService = new APIService("api-keys", session);
    const data = await apiService.get<GetAPIKeyStatsResponse>(`${(await params).id}/stats`);

    return NextResponse.json({ ...data });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "fetch",
      label: "api-key-stats",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to fetch API key stats"
    });
    return NextResponse.json(
      { error: "Failed to fetch API key statistics" }, 
      { status: 500 }
    );
  }
} 