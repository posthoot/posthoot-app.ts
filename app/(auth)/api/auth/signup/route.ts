import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";
import { z } from "zod";
import { SignupSchema } from "@/lib/validations/auth";
import { isEmpty, removeUndefined } from "@/lib/utils";
import { register } from "@/app/actions/auth/register";

const FILE_NAME = "app/api/auth/signup/route.ts";

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
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = SignupSchema.parse(json);
    const { user } = await register(body);

    logger.info({
      fileName: FILE_NAME,
      action: "POST",
      label: "user",
      value: user,
      emoji: "✅",
      message: "User created successfully",
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }

    logger.error({
      fileName: FILE_NAME,
      action: "POST",
      label: "error",
      value: error,
      emoji: "❌",
      message: "Error creating user",
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
