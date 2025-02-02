import { NextResponse } from "next/server";
import { logger } from "@/app/lib/logger";
import { z } from "zod";
import { APIService } from '@/lib/services/api';
import { ApiError } from "@/types";

// 🔒 Schema for forgot password request validation
const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format")
});

// 📝 Response interfaces
interface ForgotPasswordResponse {
  data: {
    message: string;
  };
  error?: string;
}

const FILE_NAME = "app/(auth)/api/auth/forgot-password/route.ts";

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: user@example.com
 */
export async function POST(
  req: Request
): Promise<NextResponse<ForgotPasswordResponse | { error: string }>> {
  try {
    const json = await req.json().catch(() => {
      logger.error({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "parse",
        label: "forgot_password_request",
        value: {},
        message: "Failed to parse request body"
      });
      throw new Error("Failed to parse request body");
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "🔍",
      action: "validate",
      label: "forgot_password",
      value: { email: json.email },
      message: "Validating forgot password request"
    });

    const body = ForgotPasswordSchema.safeParse(json);
    if (!body.success) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❓",
        action: "validate",
        label: "forgot_password",
        value: { errors: body.error.errors },
        message: "Invalid email provided"
      });
      return NextResponse.json(
        { error: "Invalid email address", details: body.error.issues },
        { status: 400 }
      );
    }

    // 📨 Send forgot password request through API service
    await new APIService('auth', null).post("password-reset", json);

    logger.info({
      fileName: FILE_NAME,
      emoji: "✉️",
      action: "send",
      label: "reset_email",
      value: { email: json.email },
      message: "Password reset email sent successfully"
    });

    return NextResponse.json({
      data: {
        message: "Password reset instructions have been sent to your email"
      }
    });

  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "forgot_password",
      label: "request",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to process forgot password request"
    });
    return NextResponse.json(
      { error: apiError.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
