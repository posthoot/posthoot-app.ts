import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";

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

    logger.info(
      "route.ts",
      42,
      "GET",
      "team",
      team,
      "✅ Team data retrieved successfully"
    );

    return NextResponse.json(team);
  } catch (error) {
    logger.error(
      "route.ts",
      51,
      "GET",
      "error",
      error,
      "❌ Error fetching team data"
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
