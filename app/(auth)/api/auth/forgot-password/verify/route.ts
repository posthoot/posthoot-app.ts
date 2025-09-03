import { NextResponse } from "next/server";
import { logger } from "@/app/lib/logger";
import { z } from "zod";
import { APIService } from "@/lib/services/api";
import { ApiError } from "@/lib";

// 🔒 Schema for password reset verification
const VerifyResetSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const FILE_NAME = "app/(auth)/api/auth/forgot-password/verify/route.ts";

/**
 * @openapi
 * /api/auth/forgot-password/verify:
 *   post:
 *     summary: Verify password reset token and set new password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *               password:
 *                 type: string
 *                 description: New password
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm new password
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const json = await req.json().catch(() => {
      logger.error({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "parse",
        label: "verify_reset_request",
        value: {},
        message: "Failed to parse request body",
      });
      throw new Error("Failed to parse request body");
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "🔍",
      action: "validate",
      label: "verify_reset",
      value: { token: json.token },
      message: "Validating password reset verification",
    });

    const body = VerifyResetSchema.safeParse(json);
    if (!body.success) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❓",
        action: "validate",
        label: "verify_reset",
        // @ts-ignore
        value: { errors: body.error.errors },
        message: "Invalid verification data provided",
      });
      return NextResponse.json(
        { error: "Invalid input data", details: body.error.issues },
        { status: 400 }
      );
    }

    // 🔄 Verify token and reset password through API service
    await new APIService("auth/password-reset", null).post("verify", {
      new_password: body.data.password,
      code: json.token,
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "reset",
      label: "password",
      value: { token: json.token },
      message: "Password reset successful",
    });

    // redirect to login page
    return NextResponse.redirect(new URL("/auth/login", req.url));
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "verify_reset",
      label: "request",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to verify password reset",
    });
    return NextResponse.json(
      { error: apiError.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
