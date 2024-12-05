import { NextResponse } from 'next/server';
import { logger } from '@/app/lib/logger';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';
import { auth } from '@/auth';

// Validation schema for invite request
const InviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = InviteSchema.safeParse(body);
    if (!validatedData.success) {
      logger.error(
        "route.ts",
        20,
        "POST",
        "validatedData.error",
        validatedData.error,
        "Validation failed"
      );
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // get user id from session
    const session = await auth();

    if (!session?.user) {
      logger.error(
        "route.ts",
        32,
        "POST", 
        "session",
        session,
        "User not authenticated"
      );
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // get team for user
    const team = await prisma.team.findFirst({
      where: { users: { some: { id: session.user.id } } }
    });

    if (!team) {
      logger.error(
        "route.ts",
        42,
        "POST",
        "team",
        team,
        "User not in a team"
      );
      return NextResponse.json(
        { error: 'User not in a team' },
        { status: 403 }
      );
    }

    const { email, name } = validatedData.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email, status: 'ACTIVE' }
    });

    if (existingUser) {
      logger.error(
        "route.ts",
        32,
        "POST",
        "existingUser",
        { email, existingUser },
        "User already exists"
      );
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      logger.error(
        "route.ts",
        65,
        "POST",
        "userRole",
        { role: session.user.role, email },
        "User is not an admin"
      );
      return NextResponse.json(
        { error: 'User is not an admin' },
        { status: 403 }
      );
    }

    // Create invitation
    const invitation = await prisma.teamInvite.create({
      data: {
        teamId: team.id,
        inviterId: session.user.id,
        inviteeId: '1',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
      }
    });

    // TODO: Send invitation email
    
    logger.info(
      "route.ts",
      49,
      "POST",
      "invitation",
      { invitationId: invitation.id, email, name },
      "Invitation created successfully"
    );

    return NextResponse.json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (error) {
    logger.error(
      "route.ts",
      65,
      "POST",
      "error",
      error,
      "Server error"
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
