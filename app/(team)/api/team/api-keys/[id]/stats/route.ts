import { APIService } from "@/lib/services/api";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { logger } from "@/app/lib/logger";
import { ApiError } from "@/lib";

const FILE_NAME = "app/(team)/api/team/api-keys/[id]/stats/route.ts";

interface APIKeyParams {
  params: Promise<{
    id: string;
  }>;
}

interface APIKeyUsageStats {
  totalRequests: number;
  successRate: number;
  topEndpoints: {
    endpoint: string;
    count: number;
  }[];
  recentErrors: {
    timestamp: string;
    error: string;
  }[];
}

/**
 * @openapi
 * /api/team/api-keys/{id}/stats:
 *   get:
 *     summary: Get API key usage statistics
 *     tags: [API Keys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key usage statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export async function GET(
  request: Request,
  { params }: APIKeyParams
): Promise<NextResponse<APIKeyUsageStats | { error: string }>> {
  const id = (await params).id;

  try {
    const session = await auth();

    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "api-key-stats",
        value: { id },
        message: "Unauthorized",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiService = new APIService("api-key-usage", session);
    const stats = await apiService.get<APIKeyUsageStats>(``, {
      api_key_id: id,
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "get-stats",
      label: "api-key",
      value: { id, stats },
      message: "API key stats retrieved successfully",
    });

    return NextResponse.json(stats);
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "get-stats",
      label: "api-key",
      value: { id },
      message: apiError.message || "Failed to get API key stats",
    });
    return NextResponse.json(
      { error: apiError.message || "Failed to get API key stats" },
      { status: 500 }
    );
  }
}
