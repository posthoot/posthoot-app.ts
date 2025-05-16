import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/app/lib/logger";
import { z } from "zod";
import { APIService } from "@/lib/services/api";
import { ApiError } from "@/lib";

const FILE_NAME = "app/api/imap/route.ts";

// Request/Response interfaces
interface IMAPConfigRequest {
  imapConfigs: IMAPConfig[];
  teamId: string;
}

// Response interfaces
interface GetIMAPResponse {
  data: IMAPConfig[];
  error?: string;
}

interface IMAPConfigResponse {
  data?: { message: string };
  message?: string;
  error?: string;
}

interface IMAPConfig {
  id?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  isActive: boolean;
  isDeleted?: boolean;
}

const imapConfigSchema = z.object({
  id: z.any().optional(),
  host: z.string().min(1),
  port: z.number().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  isActive: z.boolean(),
  isDeleted: z.boolean().optional().default(false),
});

export async function GET(
  request: Request
): Promise<NextResponse<GetIMAPResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "fetch",
        label: "imap",
        value: { userId: null },
        message: "Unauthorized access attempt",
      });
      return NextResponse.json(
        { error: "Unauthorized", data: [] },
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
        label: "smtp",
        value: { teamId },
        message: "Missing team ID parameter",
      });
      return NextResponse.json(
        { error: "Team ID is required", data: [] },
        { status: 400 }
      );
    }

    const apiService = new APIService("imap", session);
    const { data } = await apiService.get<{
      data: IMAPConfig[];
      error?: string;
    }>("");

    logger.info({
      fileName: FILE_NAME,
      emoji: "🔍",
      action: "fetch",
      label: "imap",
      value: { teamId, configCount: data.length },
      message: "IMAP configurations retrieved successfully",
    });

    return NextResponse.json({
      data,
      message: "IMAP configurations retrieved successfully",
    });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "fetch",
      label: "imap",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to fetch IMAP configurations",
    });
    return NextResponse.json(
      { error: "Failed to fetch IMAP configurations", data: [] },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<IMAPConfigResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "create",
        label: "imap",
        value: { userId: session?.user?.id },
        message: "Unauthorized access attempt",
      });
      return NextResponse.json(
        { error: "Unauthorized", data: { message: "" } },
        { status: 401 }
      );
    }

    const body = (await request.json()) as IMAPConfigRequest;
    const { imapConfigs, teamId } = body;

    // Validate configurations
    const validatedConfigs = imapConfigs.map((config: unknown) =>
      imapConfigSchema.parse(config)
    );

    const apiService = new APIService("imap", session);
    const createdConfigs = await apiService.post<IMAPConfig[]>("", {
      ...validatedConfigs[0],
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "📝",
      action: "create",
      label: "imap",
      value: { teamId, count: createdConfigs.length },
      message: "IMAP configurations created successfully",
    });

    return NextResponse.json({
      data: { message: "Configurations saved successfully" },
    });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "create",
      label: "smtp",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to create SMTP configurations",
    });
    return NextResponse.json(
      { error: "Failed to create IMAP configurations", data: { message: "" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request
): Promise<NextResponse<IMAPConfigResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "delete",
        label: "imap",
        value: { userId: session?.user?.id },
        message: "Unauthorized access attempt",
      });
      return NextResponse.json(
        { error: "Unauthorized", data: { message: "" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❓",
        action: "delete",
        label: "imap",
        value: { id },
        message: "Missing configuration ID",
      });
      return NextResponse.json(
        { error: "Config ID is required", data: { message: "" } },
        { status: 400 }
      );
    }

    const apiService = new APIService("imap", session);
    await apiService.delete<void>(id);

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "delete",
      label: "imap",
      value: { id },
      message: "IMAP configuration deleted successfully",
    });

    return NextResponse.json({
      data: { message: "IMAP configuration deleted successfully" },
    });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "delete",
      label: "imap",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to delete IMAP configuration",
    });
    return NextResponse.json(
      { error: "Failed to delete IMAP configuration", data: { message: "" } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request
): Promise<NextResponse<IMAPConfigResponse>> {
  try {
    const session = await auth();

    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "update",
        label: "imap",
        value: { userId: session?.user?.id },
        message: "Unauthorized access attempt",
      });
      return NextResponse.json(
        { error: "Unauthorized", data: { message: "" } },
        { status: 401 }
      );
    }

    const body = (await request.json()) as IMAPConfigRequest;
    const { imapConfigs, teamId } = body;

    // Validate configurations
    const validatedConfigs = imapConfigs.map((config: unknown) =>
      imapConfigSchema.parse(config)
    );

    const apiService = new APIService("imap", session);
    const updatedConfigs = await apiService.update<IMAPConfig[]>(
      validatedConfigs[0].id,
      {
        ...validatedConfigs[0],
      }
    );

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "update",
      label: "imap",
      value: { teamId, count: updatedConfigs.length },
      message: "IMAP configurations updated successfully",
    });

    return NextResponse.json({
      data: { message: "Configurations saved successfully" },
    });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "update",
      label: "imap",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to update IMAP configurations",
    });
    return NextResponse.json(
      {
        error: apiError.message,
      },
      { status: 500 }
    );
  }
}
