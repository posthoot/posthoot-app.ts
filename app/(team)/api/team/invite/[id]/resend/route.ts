import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/app/lib/logger";
import { prisma } from "@/app/lib/prisma";
import emailService from "@/lib/services/email";

const FILE_NAME = "app/(team)/api/team/invite/[id]/resend/route.ts";

/**
 * @openapi
 * /api/team/invite/{id}/resend:
 *   post:
 *     summary: Resend an invitation email
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation email resent successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Internal Server Error
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const invitation = await prisma.teamInvite.findUnique({
      where: { 
        id: (await params).id,
        status: "PENDING"
      },
      include: {
        team: true
      }
    });

    if (!invitation) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "POST",
        label: "invitation",
        value: (await params).id,
        message: "Invitation not found",
      });
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    await emailService.sendInvitationEmail(
      invitation.email,
      `Hey ${invitation.name}! You've been invited to join ${invitation.team.name} as a member.`,
      invitation.teamId,
      invitation.team.emailTemplateId,
      null,
      {
        name: invitation.name,
        team: invitation.team.name,
        teamLogo: invitation.team.logoUrl,
        acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/team/invite/${invitation.id}`,
      }
    );

    logger.info({
      fileName: FILE_NAME,
      emoji: "📧",
      action: "POST",
      label: "invitation",
      value: { invitationId: invitation.id, email: invitation.email },
      message: "Invitation email resent successfully",
    });

    return NextResponse.json({
      message: "Invitation email resent successfully"
    });

  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "💥",
      action: "POST",
      label: "error",
      value: error,
      message: "Failed to resend invitation email",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
