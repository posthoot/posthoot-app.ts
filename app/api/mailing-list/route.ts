import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";
import { z } from "zod";

const groupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  teamId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, description, teamId } = groupSchema.parse(body);

    const createdGroup = await prisma.mailingList.create({
      data: {
        name,
        description,
        teamId: teamId || session.user.teamId,
      },
    });

    logger.info({
      fileName: "route.ts",
      emoji: "👥",
      action: "POST",
      label: "group",
      value: createdGroup,
      message: "Group created successfully",
    });

    return NextResponse.json(createdGroup);
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "POST",
      label: "error",
      value: error,
      message: "Failed to create group",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // get from url params
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return new NextResponse("Team ID is required", { status: 400 });
    }

    const mailingLists = await prisma.mailingList.findMany({
      where: {
        teamId: teamId || session.user.teamId,
      },
      include: {
        _count: {
          select: {
            subscribers: true,
          },
        },
      },
    });


    return NextResponse.json(mailingLists);
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "GET",
      label: "error",
      value: error,
      message: "Failed to fetch group",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { groupId, name, description, teamId } = groupSchema.extend({ groupId: z.string() }).parse(body);

    const updatedGroup = await prisma.mailingList.updateMany({
      where: {
        id: groupId,
        teamId: teamId || session.user.teamId,
      },
      data: {
        name,
        description,
      },
    });

    if (updatedGroup.count === 0) {
      return new NextResponse("Group not found or not authorized", { status: 404 });
    }

    logger.info({
      fileName: "route.ts",
      emoji: "🔄",
      action: "PUT",
      label: "group",
      value: updatedGroup,
      message: "Group updated successfully",
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "PUT",
      label: "error",
      value: error,
      message: "Failed to update group",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const teamId = searchParams.get("teamId");
    if (!groupId) {
      return new NextResponse("Group ID is required", { status: 400 });
    }

    const deletedGroup = await prisma.mailingList.deleteMany({
      where: {
        id: groupId,
        teamId: teamId || session.user.teamId,
      },
    });

    if (deletedGroup.count === 0) {
      return new NextResponse("Group not found or not authorized", { status: 404 });
    }

    logger.info({
      fileName: "route.ts",
      emoji: "🗑️",
      action: "DELETE",
      label: "group",
      value: deletedGroup,
      message: "Group deleted successfully",
    });

    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "DELETE",
      label: "error",
      value: error,
      message: "Failed to delete group",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
