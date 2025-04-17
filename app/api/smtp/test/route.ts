const FILE_NAME = "app/api/smtp/test/route.ts";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/app/lib/logger";
import nodemailer from "nodemailer";
import { APIService } from "@/lib/services/api";
import { z } from "zod";
import { ApiError } from "@/lib";

/**
 * @openapi
 * /api/smtp/test:
 *   post:
 *     summary: Test SMTP configuration
 *     tags: [SMTP]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - host
 *               - port
 *               - username
 *               - password
 *             properties:
 *               host:
 *                 type: string
 *               port:
 *                 type: string
 *                 pattern: ^\d+$
 *               username:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: SMTP configuration test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Test successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Test failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

interface SMTPTestRequest {
  host: string;
  port: string;
  username: string;
  password: string;
}

interface SMTPTestResponse {
  message: string;
  error?: string;
}

const SMTPConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().positive(),
  username: z.string(),
  password: z.string().min(1),
  fromEmail: z.string(),
});

type SMTPConfig = z.infer<typeof SMTPConfigSchema>;

export async function POST(
  request: Request
): Promise<NextResponse<SMTPTestResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "smtp-test",
        value: { userId: null },
        message: "Unauthorized access attempt to SMTP test endpoint",
      });
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Unauthorized access attempt to SMTP test endpoint",
        },
        { status: 401 }
      );
    }

    const apiService = new APIService("smtp", session);

    const rawConfig: SMTPTestRequest = await request.json();
    const parseResult = SMTPConfigSchema.safeParse(rawConfig);

    if (!parseResult.success) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "validate",
        label: "smtp-config",
        value: { errors: parseResult.error.errors },
        message: "Invalid SMTP configuration provided",
      });
      return NextResponse.json(
        { message: "Invalid configuration" },
        { status: 400 }
      );
    }

    const config = parseResult.data;

    logger.info({
      fileName: FILE_NAME,
      emoji: "🔍",
      action: "test",
      label: "smtp-connection",
      value: { host: config.host, username: config.username },
      message: "Testing SMTP configuration",
    });

    const response = await apiService.post<SMTPTestResponse>("test", {
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      from: config.fromEmail,
      requireTls: config.port === 587,
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "test",
      label: "smtp-connection",
      value: { host: config.host, port: config.port },
      message: "SMTP connection test successful",
    });

    return NextResponse.json({ message: response.message });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "smtp-test",
      label: "smtp-config",
      value: { error: apiError.message || "Unknown error" },
      message: "SMTP test failed",
    });
    return NextResponse.json(
      { error: apiError.message, message: apiError.message },
      { status: 500 }
    );
  }
}
