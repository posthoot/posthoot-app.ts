import { NextResponse } from "next/server";
import { ApiError } from "@/types";
import { getApiDocs } from "@/lib/swagger";
import { auth } from "@/auth";
import { logger } from "@/app/lib/logger";

const FILE_NAME = "app/api/docs/route.ts";

// Response interfaces
interface GetApiDocsResponse {
  data: {
    openapi: string;
    info: Record<string, any>;
    paths: Record<string, any>;
  };
  error?: string;
}

/**
 * @openapi
 * /api/docs:
 *   get:
 *     summary: Get API documentation
 *     tags: [Documentation]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: API documentation
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(): Promise<NextResponse<GetApiDocsResponse | { error: string }>> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "docs",
        value: {},
        message: "Unauthorized access attempt to API docs"
      });
      
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    logger.info({
      fileName: FILE_NAME,
      emoji: "🔍",
      action: "fetch",
      label: "docs",
      value: { userId: session.user.id },
      message: "Fetching API documentation"
    });

    const docs = getApiDocs();
    
    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "fetch",
      label: "docs",
      value: { userId: session.user.id },
      message: "Successfully retrieved API documentation"
    });

    return NextResponse.json({ data: docs, error: null });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌", 
      action: "fetch",
      label: "docs",
      value: { error: apiError.message },
      message: "Failed to retrieve API documentation"
    });

    return NextResponse.json(
      { error: "Failed to retrieve API documentation" },
      { status: 500 }
    );
  }
}
