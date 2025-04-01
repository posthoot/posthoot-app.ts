import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/app/lib/logger";
import { z } from "zod";
import { SMTPProvider } from "@/types";
import { APIService } from "@/lib/services/api";
import { ApiError } from "@/types";

const FILE_NAME = "app/api/smtp/route.ts";

// Request/Response interfaces
interface SMTPConfigRequest {
  smtpConfigs: SMTPConfig[];
  teamId: string;
}

// Response interfaces
interface GetSMTPResponse {
  data: SMTPConfig[];
  error?: string;
}

interface SMTPConfigResponse {
  data?: { message: string };
  error?: string;
}

interface SMTPConfig {
  id?: string;
  provider: SMTPProvider;
  host: string;
  port: number;
  username: string;
  password: string;
  isActive: boolean;
  supportsTls?: boolean;
  requiresAuth?: boolean;
  supportsStartTLS?: boolean;
  maxSendRate?: number;
  documentation?: string;
}

const smtpConfigSchema = z.object({
  id: z.string().optional(),
  provider: z.nativeEnum(SMTPProvider),
  host: z.string().min(1),
  port: z.number().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  isActive: z.boolean(),
  isDefault: z.boolean().default(false),
  supportsTls: z.boolean().optional(),
  requiresAuth: z.boolean().optional(),
  supportsStartTLS: z.boolean().optional(),
  maxSendRate: z.number().min(1).optional(),
  documentation: z.string().url().optional(),
  fromEmail: z.string().optional(),
});

export async function GET(
  request: Request
): Promise<NextResponse<GetSMTPResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "fetch",
        label: "smtp",
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

    const apiService = new APIService("smtp-configs", session);
    const { data } = await apiService.get<{
      data: SMTPConfig[];
      error?: string;
    }>("");

    logger.info({
      fileName: FILE_NAME,
      emoji: "🔍",
      action: "fetch",
      label: "smtp",
      value: { teamId, configCount: data.length },
      message: "SMTP configurations retrieved successfully",
    });

    return NextResponse.json({
      data,
      message: "SMTP configurations retrieved successfully",
    });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "fetch",
      label: "smtp",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to fetch SMTP configurations",
    });
    return NextResponse.json(
      { error: "Failed to fetch SMTP configurations", data: [] },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<SMTPConfigResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "create",
        label: "smtp",
        value: { userId: session?.user?.id },
        message: "Unauthorized access attempt",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as SMTPConfigRequest;
    const { smtpConfigs, teamId } = body;

    // Validate configurations
    const validatedConfigs = smtpConfigs.map((config: unknown) =>
      smtpConfigSchema.parse(config)
    );

    const apiService = new APIService("smtp-configs", session);
    const createdConfigs = await apiService.post<SMTPConfig[]>("", {
      ...validatedConfigs[0],
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "📝",
      action: "create",
      label: "smtp",
      value: { teamId, count: createdConfigs.length },
      message: "SMTP configurations created successfully",
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
      { error: "Failed to create SMTP configurations" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request
): Promise<NextResponse<SMTPConfigResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "delete",
        label: "smtp",
        value: { userId: session?.user?.id },
        message: "Unauthorized access attempt",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❓",
        action: "delete",
        label: "smtp",
        value: { id },
        message: "Missing configuration ID",
      });
      return NextResponse.json(
        { error: "Config ID is required" },
        { status: 400 }
      );
    }

    const apiService = new APIService("smtp", session);
    await apiService.post<void>("delete", { id });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "delete",
      label: "smtp",
      value: { id },
      message: "SMTP configuration deleted successfully",
    });

    return NextResponse.json({
      data: { message: "SMTP configuration deleted successfully" },
    });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "delete",
      label: "smtp",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to delete SMTP configuration",
    });
    return NextResponse.json(
      { error: "Failed to delete SMTP configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request
): Promise<NextResponse<SMTPConfigResponse>> {
  try {
    const session = await auth();

    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "update",
        label: "smtp",
        value: { userId: session?.user?.id },
        message: "Unauthorized access attempt",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as SMTPConfigRequest;
    const { smtpConfigs, teamId } = body;

    // Validate configurations
    const validatedConfigs = smtpConfigs.map((config: unknown) =>
      smtpConfigSchema.parse(config)
    );

    const apiService = new APIService("smtp-configs", session);
    const updatedConfigs = await apiService.update<SMTPConfig[]>(
      validatedConfigs[0].id,
      {
        ...validatedConfigs[0],
      }
    );

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "update",
      label: "smtp",
      value: { teamId, count: updatedConfigs.length },
      message: "SMTP configurations updated successfully",
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
      label: "smtp",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to update SMTP configurations",
    });
    return NextResponse.json(
      {
        error: apiError.message,
        message: apiError.message,
      },
      { status: 500 }
    );
  }
}
