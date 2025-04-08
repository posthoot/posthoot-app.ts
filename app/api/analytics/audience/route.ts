import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/app/lib/logger";
import { z } from "zod";
import { APIService } from "@/lib/services/api";
import { ApiError } from "@/types";

const FILE_NAME = "app/api/analytics/audience/route.ts";

interface AudienceResponse {
  data?: AudienceInsights;
  error?: string;
}

// Matches the schema from Swagger
interface AudienceInsights {
  demographics: Record<string, number>;
  behaviors: Record<string, {
    count: number;
    engagementRate: number;
    trend: string;
  }>;
  preferences: Record<string, {
    count: number;
    score: number;
    confidence: number;
  }>;
  segments: Array<{
    name: string;
    size: number;
    openRate: number;
    clickRate: number;
    growth: number;
  }>;
}

export async function GET(request: Request): Promise<NextResponse<AudienceResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "fetch",
        label: "audience_analytics",
        value: { userId: null },
        message: "Unauthorized access attempt",
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❓",
        action: "fetch",
        label: "audience_analytics",
        value: { teamId },
        message: "Missing team ID parameter",
      });
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    const apiService = new APIService("analytics/audience", session);
    const data = await apiService.get<AudienceInsights>(null, {
      teamId,
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "📊",
      action: "fetch",
      label: "audience_analytics",
      value: { teamId },
      message: "Audience insights retrieved successfully",
    });

    return NextResponse.json({
      data,
      message: "Audience insights retrieved successfully",
    });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "fetch",
      label: "audience_analytics",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to fetch audience insights",
    });
    return NextResponse.json(
      { error: "Failed to fetch audience insights" },
      { status: 500 }
    );
  }
}
