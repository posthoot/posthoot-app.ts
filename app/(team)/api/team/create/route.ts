import { NextResponse } from 'next/server';
import { logger } from '@/app/lib/logger';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';
import { auth } from '@/auth';

const FILE_NAME = 'app/(team)/api/team/create/route.ts';

// Validation schema for team creation
const TeamCreateSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters')
});

/**
 * @openapi
 * /api/team/create:
 *   post:
 *     summary: Create a new team
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                       role:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "🔒",
        action: "POST",
        label: "session",
        value: null,
        message: "User not authenticated",
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate request body
    const validatedData = TeamCreateSchema.safeParse(body);
    if (!validatedData.success) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "POST",
        label: "validationError",
        value: validatedData.error,
        message: "Invalid team data",
      });
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Check if user already belongs to a team
    const existingTeam = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true }
    });

    if (existingTeam?.teamId) {
      logger.error({
        fileName: FILE_NAME,
        emoji: "👥",
        action: "POST",
        label: "existingTeam",
        value: existingTeam,
        message: "User already belongs to a team",
      });
      return NextResponse.json(
        { error: 'User already belongs to a team' },
        { status: 409 }
      );
    }

    // Create new team and update user
    const team = await prisma.team.create({
      data: {
        name: validatedData.data.name,
        users: {
          connect: { id: session.user.id }
        }
      },
      include: {
        users: true
      }
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✨",
      action: "POST",
      label: "team",
      value: team,
      message: "Team created successfully",
    });

    return NextResponse.json(team);

  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "💥",
      action: "POST",
      label: "error",
      value: error,
      message: "Error creating team",
    });
    
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
