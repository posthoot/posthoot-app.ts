import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/app/lib/logger";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const config = await request.json();

    // Create test transport
    const transport = nodemailer.createTransport({
      host: config.host,
      port: parseInt(config.port),
      secure: config.port === "465",
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    // Verify connection
    await transport.verify();

    logger.info({
      fileName: "route.ts",
      emoji: "✅",
      action: "POST",
      label: "config",
      value: { host: config.host, port: config.port },
      message: "SMTP test successful",
    });

    return NextResponse.json({ message: "Test successful" });
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "POST",
      label: "error",
      value: error,
      message: "SMTP test failed",
    });
    return new NextResponse(
      error instanceof Error ? error.message : "Test failed",
      { status: 500 }
    );
  }
} 