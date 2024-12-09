import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";

/**
 * @swagger
 * /api/team/{userid}:
 *   get:
 *     summary: Get team member details
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the team member
 *     responses:
 *       200:
 *         description: Team member details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       404:
 *         description: Team member not found
 *       401:
 *         description: Unauthorized
 */
export async function GET(
  request: Request,
  {
    params,
  }: { params: { userid: string } } & { params: Promise<{ userid: string }> }
) {
  try {
    const session = await auth();

    const { userid } = await params;

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const team = await prisma.team.findFirst({
      where: { users: { some: { id: userid } } },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!team) {
      return new NextResponse("Team not found", { status: 404 });
    }

    // Verify user belongs to team
    if (!team.users.some((user) => user.id === session.user.id)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    logger.info({
      fileName: "route.ts",
      emoji: "✅",
      action: "GET",
      label: "team",
      value: JSON.stringify(team),
      message: "Team data retrieved successfully",
    });

    return NextResponse.json(team);
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "GET",
      label: "error",
      value: error,
      message: "Error fetching team data",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * @swagger
 * /api/team/{userid}:
 *   put:
 *     summary: Update team member details
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the team member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team member updated successfully
 *       404:
 *         description: Team member not found
 *       401:
 *         description: Unauthorized
 */
export async function PUT(
  request: Request,
  { params }: { params: { userid: string } }
) {
  // ... existing implementation
}
