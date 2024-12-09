import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";
import { z } from "zod";

const smtpConfigSchema = z.object({
  id: z.string(),
  provider: z.string(),
  host: z.string().min(1),
  port: z.string().regex(/^\d+$/),
  username: z.string().email(),
  password: z.string().min(8),
  isActive: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { smtpConfigs, teamId } = body;

    // Validate configurations
    smtpConfigs.forEach((config: any) => {
      smtpConfigSchema.parse(config);
    });

    // Delete existing configs for this team
    await prisma.smtpConfig.deleteMany({
      where: { teamId },
    });

    // Create new configs
    const createdConfigs = await prisma.smtpConfig.createMany({
      data: smtpConfigs.map((config: any) => ({
        ...config,
        teamId,
      })),
    });

    logger.info({
      fileName: "route.ts",
      emoji: "📨",
      action: "POST",
      label: "smtpConfigs",
      value: createdConfigs,
      message: "SMTP configurations saved successfully",
    });

    return NextResponse.json({ message: "Configurations saved successfully" });
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "POST",
      label: "error",
      value: error,
      message: "Failed to save SMTP configurations",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return new NextResponse("Team ID is required", { status: 400 });
    }

    const configs = await prisma.smtpConfig.findMany({
      where: { teamId },
    });

    logger.info({
      fileName: "route.ts",
      emoji: "📨",
      action: "GET",
      label: `smtpConfigs: ${teamId}`,
      value: configs,
      message: "SMTP configurations fetched successfully",
    });

    return NextResponse.json(configs);
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "GET",
      label: "error",
      value: error,
      message: "Failed to fetch SMTP configurations",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Config ID is required", { status: 400 });
    }

    await prisma.smtpConfig.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "SMTP configuration deleted successfully",
    });
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "DELETE",
      label: "error",
      value: error,
      message: "Failed to delete SMTP configuration",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
