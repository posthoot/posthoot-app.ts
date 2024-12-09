import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const team = await prisma.team.findFirst({
    where: {
      users: {
        some: {
          id: session.user.id,
        },
      },
    },
    include: {
      apiKeys: true,
    },
  });

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(team.apiKeys);
}


export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const team = await prisma.team.findFirst({
    where: {
      users: {
        some: {
          id: session.user.id,
        },
      },
    },
  });

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const apiKey = await prisma.apiKey.create({
    data: {
      team: {
        connect: {
          id: team.id,
        },
      },
      name: body.name,
      key: crypto.randomUUID(),
      expiresAt: body.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 90 days,
      lastUsedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(apiKey);
}
