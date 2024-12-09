import { hash } from "bcrypt"
import { NextResponse } from "next/server"
import prisma from "@/app/lib/prisma"
import { logger } from "@/app/lib/logger"
import { z } from "zod"
import { SignupSchema } from "@/lib/validations/auth"

const FILE_NAME = 'app/api/auth/signup/route.ts';

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = SignupSchema.parse(json)

    const exists = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (exists) {
      logger.warn({
        fileName: FILE_NAME,
        action: "POST",
        label: "email",
        value: body.email,
        emoji: "❌",
        message: "Email already exists",
      });
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(body.password, 10)

    // Create user and team in a single transaction for atomicity
    const { user } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
          role: body.role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        }
      });

      const team = await tx.team.create({
        data: {
          name: body.name,
          users: {
            connect: {
              id: user.id,
            }
          }
        },
        select: {
          id: true,
          name: true
        }
      });

      // Update user with team ID in same transaction
      await tx.user.update({
        where: { id: user.id },
        data: { teamId: team.id }
      });

      return { user, team };
    });

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
      return NextResponse.json(
        { error: error.issues },
        { status: 422 }
      )
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
    )
  }
}