import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { APIService } from "@/lib/services/api";
import { logger } from "@/app/lib/logger";
import { ApiError } from "@/lib";

const FILE_NAME = "app/api/team/api-keys/[id]/toggle/route.ts";

/**
 * @openapi
 * /api/team/api-keys/{id}/toggle:
 *   post:
 *     summary: Toggle API key
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: API key toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 */

interface ToggleApiKeyRequest {
  isActive: boolean;
}

interface ToggleApiKeyResponse {
  message: string;
  apiKey: {
    id: string;
    isActive: boolean;
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ToggleApiKeyResponse | { error: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authorize",
        label: "api-key-toggle",
        value: { userId: session?.user?.id || 'unknown' },
        message: "Unauthorized access attempt to toggle API key"
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ToggleApiKeyRequest;
    const { isActive } = body;
    
    const apiService = new APIService("api-keys", session);

    logger.info({
      fileName: FILE_NAME,
      emoji: "📝",
      action: "toggle",
      label: "api-key",
      value: { keyId: (await params).id, isActive },
      message: "Attempting to toggle API key status"
    });

    const response = await apiService.post(`/api-keys/${(await params)  .id}/update`, { isActive });
    
    if (!response) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❓",
        action: "toggle",
        label: "api-key",
        value: { keyId: (await params).id },
        message: "API key not found"
      });
      return new NextResponse(
        JSON.stringify({ error: "API key not found" }),
        { status: 404 }
      );
    }

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "toggle",
      label: "api-key",
      value: { keyId: (await params).id, isActive },
      message: "Successfully toggled API key status"
    });

    return new NextResponse(
      JSON.stringify({
        message: `API key ${isActive ? 'activated' : 'deactivated'} successfully`,
        apiKey: response
      } as ToggleApiKeyResponse),
      { status: 200 }
    );

  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "toggle",
      label: "api-key",
      value: { keyId: (await params).id, error },
      message: "Failed to toggle API key status"
    });
    return new NextResponse(
      JSON.stringify({ error: "Failed to toggle API key" }),
      { status: 500 }
    );
  }
} 