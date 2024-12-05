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

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      logger.error(
        FILE_NAME,
        19,
        'POST',
        'session',
        null,
        '🔒 User not authenticated'
      );
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate request body
    const validatedData = TeamCreateSchema.safeParse(body);
    if (!validatedData.success) {
      logger.error(
        FILE_NAME,
        36,
        'POST',
        'validationError',
        validatedData.error,
        '❌ Invalid team data'
      );
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
      logger.error(
        FILE_NAME,
        55,
        'POST',
        'existingTeam',
        existingTeam,
        '👥 User already belongs to a team'
      );
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

    logger.info(
      FILE_NAME,
      80,
      'POST',
      'team',
      team,
      '✨ Team created successfully'
    );

    return NextResponse.json(team);

  } catch (error) {
    logger.error(
      FILE_NAME,
      91,
      'POST',
      'error',
      error,
      '💥 Error creating team'
    );
    
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
