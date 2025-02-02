import { APIService } from "@/lib/services/api";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { logger } from "@/app/lib/logger";
import { ApiError, APIKey } from "@/types";

const FILE_NAME = "app/(team)/api/team/api-keys/[id]/route.ts";

interface APIKeyParams {
  params: Promise<{
    id: string;
  }>;
}

interface DeleteAPIKeyResponse {
  success: boolean;
  error?: string;
}

/**
 * @openapi
 * /api/team/api-keys/{id}:
 *   delete:
 *     summary: Delete an API key
 *     tags: [API Keys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key deleted successfully
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(
  request: Request,
  { params }: APIKeyParams
): Promise<NextResponse<DeleteAPIKeyResponse | { error: string }>> {
  const id = (await params).id;

  try {
    const session = await auth();

    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "api-key",
        value: { id },
        message: "Unauthorized",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiService = new APIService("api-keys", session);
    await apiService.delete<void>(`/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "delete",
      label: "api-key",
      value: { id, error: apiError.message || "Unknown error" },
      message: "Failed to delete API key",
    });
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
