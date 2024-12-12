import { NextResponse } from "next/server";
import { logger } from "@/app/lib/logger";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";
import { auth } from "@/auth";
import emailService from "@/lib/services/email";

// Validation schema for invite request
const InviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

const FILE_NAME = "app/(team)/api/team/invite/route.ts";

/**
 * @openapi
 * /api/team/invite:
 *   post:
 *     summary: Invite a user to a team
 *     tags: [Team]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invite a user to a team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 invitation:
 *                   $ref: '#/components/schemas/TeamInvite'
 *       400:
 *         description: Invalid input data
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
    const body = await req.json();

    // Validate request body
    const validatedData = InviteSchema.safeParse(body);
    if (!validatedData.success) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "POST",
        label: "validatedData.error",
        value: validatedData.error,
        message: "Validation failed",
      });
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // get user id from session
    const session = await auth();

    if (!session?.user) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "🔒",
        action: "POST",
        label: "session",
        value: session,
        message: "User not authenticated",
      });
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // get team for user
    const team = await prisma.team.findFirst({
      where: { users: { some: { id: session.user.id } } },
    });

    if (!team) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "🔒",
        action: "POST",
        label: "team",
        value: team,
        message: "User not in a team",
      });
      return NextResponse.json(
        { error: "User not in a team" },
        { status: 403 }
      );
    }

    const { email, name } = validatedData.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email, status: "ACTIVE" },
    });

    if (existingUser) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "👥",
        action: "POST",
        label: "existingUser",
        value: { email, existingUser },
        message: "User already exists",
      });
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "ADMIN") {
      logger.error({
        fileName: FILE_NAME,
        emoji: "🔒",
        action: "POST",
        label: "userRole",
        value: { role: user?.role, email },
        message: "User is not an admin",
      });
      return NextResponse.json(
        { error: "User is not an admin" },
        { status: 403 }
      );
    }

    // Create invitation
    const invitation = await prisma.teamInvite.create({
      data: {
        teamId: team.id,
        inviterId: session.user.id,
        name: name,
        email: email,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
      },
    });

    // TODO: Send invitation email

    logger.info({
      fileName: FILE_NAME,
      emoji: "✨",
      action: "POST",
      label: "invitation",
      value: { invitationId: invitation.id, email, name },
      message: "Invitation created successfully",
    });

    emailService.sendInvitationEmail(
      email,
      `Hey ${name}! You've been invited to join ${team.name} as a member.`,
      team.id,
      team.emailTemplateId,
      null,
      {
        name,
        teamName: team.name,
        teamLogo: team.logoUrl,
        acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/invite/${invitation.id}`,
      }
    );

    return NextResponse.json({
      message: "Invitation sent successfully",
      invitation: {
        id: invitation.id,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "💥",
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
