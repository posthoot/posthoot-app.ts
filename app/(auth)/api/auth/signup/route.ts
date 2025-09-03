import { NextResponse } from "next/server";
import { logger } from "@/app/lib/logger";
import { SignupSchema } from "@/lib/validations/auth";
import { ApiError } from "@/lib";
import { APIService } from '@/lib/services/api';

// Response interfaces
interface SignUpResponse {
  data: {
    message: string;
  };
  error?: string;
}

const FILE_NAME = "app/(auth)/api/auth/signup/route.ts";

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Sign up a new user
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
 *                 description: The email of the user
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 example: password123
 *               name:
 *                 type: string
 *                 description: The name of the user
 *                 example: John Doe
 *               role:
 *                 type: string
 *                 description: The role of the user
 *                 example: ADMIN
 *               teamId:
 *                 type: string
 *                 description: The ID of the team the user belongs to
 *                 example: 123
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function POST(
  req: Request
): Promise<NextResponse<SignUpResponse | { error: string }>> {
  try {
    const json = await req.json().catch(() => {
      logger.error({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "parse",
        label: "signup_request",
        value: {},
        message: "Failed to parse request body"
      });
      throw new Error("Failed to parse request body");
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "🔍",
      action: "validate",
      label: "signup",
      value: { email: json.email },
      message: "Validating new user signup data"
    });

    const body = SignupSchema.safeParse(json);
    if (!body.success) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❓",
        action: "validate",
        label: "signup",
        // @ts-ignore
        value: { errors: body.error.errors },
        message: "Invalid signup data provided"
      });
      return NextResponse.json(
        { error: "Invalid input data", details: body.error.issues },
        { status: 400 }
      );
    }

    // Use APIService for the registration
    await new APIService('auth', null).post("register", {
      email: json.email,
      first_name: json.firstName,
      last_name: json.lastName,
      password: json.password
    })

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "create",
      label: "user",
      value: { email: json.email },
      message: "User successfully registered"
    });

    return NextResponse.json({
      data: {
        message: "User successfully registered"
      }
    });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "signup",
      label: "user",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to create user"
    });
    return NextResponse.json(
      { error: apiError.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
