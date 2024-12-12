import { register } from "@/app/actions/auth/register";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * @openapi
 * /api/team/invite/{id}:
 *   get:
 *     summary: Get an invitation
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get an invitation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invitation:
 *                   $ref: '#/components/schemas/TeamInvite'
 *       404:
 *         description: Invitation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const invitation = await prisma.teamInvite.findUnique({
    where: { id: (await params).id, status: "PENDING" },
    include: {
      team: true,
      inviter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invitation) {
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 }
    );
  }

  const shouldNotRedirect = req.url.includes("redirect=false");

  if (shouldNotRedirect) {
    return NextResponse.json({
      invitation,
    });
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${invitation.id}`
  );
}

/**
 * @openapi
 * /api/team/invite/{id}:
 *   post:
 *     summary: Accept an invitation
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Accept an invitation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Invitation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { password } = await req.json();
  const invitation = await prisma.teamInvite.findUnique({
    where: { id: (await params).id, status: "PENDING" },
  });

  if (!invitation) {
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 }
    );
  }

  const { user } = await register({
    email: invitation.email,
    name: invitation.name,
    password,
    teamId: invitation.teamId,
  });

  await prisma.teamInvite.update({
    where: { id: (await params).id },
    data: {
      status: "ACCEPTED",
    },
  });

  return NextResponse.json({
    message: "Invitation accepted",
    user,
  });
}

/**
 * @openapi
 * /api/team/invite/{id}:
 *   delete:
 *     summary: Cancel an invitation
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cancel an invitation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Invitation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const team = await prisma.team.findFirst({
    where: { users: { some: { id: session.user.id } } },
  });

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const invitation = await prisma.teamInvite.delete({
    where: { id: (await params).id, teamId: team.id },
  });

  if (!invitation) {
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Invitation cancelled",
  });
}
