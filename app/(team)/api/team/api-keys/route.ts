import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { APIService } from "@/lib/services/api";
import { ApiError, APIKeyResponse } from "@/types";
import { logger } from "@/app/lib/logger";

// Response interfaces
interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

interface GetAPIKeysResponse {
  data: {
    keys: APIKey[];
  };
  error?: string;
}

const FILE_NAME = "app/(team)/api/team/api-keys/route.ts";

export async function GET(
  request: Request
): Promise<NextResponse<GetAPIKeysResponse | { error: string }>> {
  try {
    const session = await auth();

    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "api-keys",
        value: {},
        message: "Unauthorized access attempt",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiService = new APIService("api-keys", session);
    const data = await apiService.get<{ keys: APIKey[] }>("");

    return NextResponse.json({ data });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "fetch",
      label: "api-keys",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to fetch API keys",
    });
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "api-keys",
        value: {},
        message: "Unauthorized access attempt",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const apiService = new APIService("api-keys", session);
    const data = await apiService.post<APIKeyResponse["data"]>("", {
      name: body.name,
      expiresAt: body.expiresAt,
    });

    return NextResponse.json({ data });
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "create",
      label: "api-keys",
      value: { error: "Failed to create API key" },
      message: "Failed to create API key",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
