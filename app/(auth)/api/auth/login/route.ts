import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { LoginSchema } from "@/lib/validations/auth";
import { logger } from "@/app/lib/logger";
import prisma from "@/app/lib/prisma";

const FILE_NAME = 'app/(auth)/api/auth/login/route.ts';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = LoginSchema.safeParse(body);
    if (!validatedData.success) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "POST",
        label: "validationError",
        value: JSON.stringify(validatedData.error),
        message: "Invalid input data",
      });
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    const { email, password } = validatedData.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "POST",
        label: "user",
        value: email,
        message: "User not found",
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "POST",
        label: "password",
        value: email,
        message: "Invalid password",
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "POST",
      label: "user",
      value: user.id,
      message: "User logged in successfully",
    });

    return NextResponse.json({
      user,
    });
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "POST",
      label: "error",
      value: error,
      message: "Server error",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
