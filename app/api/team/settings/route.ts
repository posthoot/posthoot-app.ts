import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";

/**
 * @swagger
 * /api/team/settings:
 *   patch:
 *     summary: Update team settings
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inviteTemplateId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team settings updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { inviteTemplateId } = await request.json();

    const updatedTeam = await prisma.team.update({
      where: { id: session.user.teamId },
      data: { emailTemplateId: inviteTemplateId },
    });

    logger.info({
      fileName: "route.ts",
      emoji: "✅",
      action: "PATCH",
      label: "team-settings",
      value: JSON.stringify(updatedTeam),
      message: "Team settings updated successfully",
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "PATCH",
      label: "error",
      value: error,
      message: "Error updating team settings",
    });

    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
