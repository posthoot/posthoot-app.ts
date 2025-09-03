const FILE_NAME = "app/api/smtp/test/route.ts";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/app/lib/logger";
import { APIService } from "@/lib/services/api";
import { z } from "zod";
import { ApiError } from "@/lib";

/**
 * @openapi
 * /api/imap/test:
 *   post:
 *     summary: Test IMAP configuration
 *     tags: [IMAP]
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
 *         description: IMAP configuration test successful
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

interface IMAPTestRequest {
  host: string;
  port: string;
  username: string;
  password: string;
}

interface IMAPTestResponse {
  message: string;
  error?: string;
}

const IMAPConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().positive(),
  username: z.string(),
  password: z.string().min(1),
});

export async function POST(
  request: Request
): Promise<NextResponse<IMAPTestResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "imap-test",
        value: { userId: null },
        message: "Unauthorized access attempt to IMAP test endpoint",
      });
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Unauthorized access attempt to IMAP test endpoint",
        },
        { status: 401 }
      );
    }

    const apiService = new APIService("imap", session);

    const rawConfig: IMAPTestRequest = await request.json();
    const parseResult = IMAPConfigSchema.safeParse(rawConfig);

    if (!parseResult.success) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "validate",
        label: "imap-config",
        // @ts-ignore
        value: { errors: parseResult.error.errors },
        message: "Invalid IMAP configuration provided",
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

    const response = await apiService.post<IMAPTestResponse>("test", {
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
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
