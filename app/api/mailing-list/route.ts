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

/**
 * @openapi
 * /api/mailing-list:
 *   get:
 *     summary: List all mailing lists
 *     tags: [Mailing Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the team
 *     responses:
 *       200:
 *         description: List of mailing lists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   _count:
 *                     type: object
 *                     properties:
 *                       subscribers:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request - Team ID required
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @openapi
 * /api/mailing-list:
 *   put:
 *     summary: Update a mailing list
 *     tags: [Mailing Lists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - name
 *             properties:
 *               groupId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               teamId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mailing list updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found or not authorized
 *       500:
 *         description: Internal Server Error
 */
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { groupId, name, description, teamId } = groupSchema
      .extend({ groupId: z.string() })
      .parse(body);

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
      return new NextResponse("Group not found or not authorized", {
        status: 404,
      });
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
      return new NextResponse("Group not found or not authorized", {
        status: 404,
      });
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

/**
 * @openapi
 * /api/mailing-list:
 *   post:
 *     summary: Create a new mailing list
 *     tags: [Mailing Lists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               teamId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mailing list created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request - Invalid input
 *       500:
 *         description: Internal Server Error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = groupSchema.safeParse(body);

    if (!validatedData.success) {
      return new NextResponse("Invalid input", { status: 400 });
    }

    const { name, description, teamId } = validatedData.data;

    const mailingList = await prisma.mailingList.create({
      data: {
        name,
        description,
        team: {
          connect: {
            id: teamId,
          },
        },
      },
    });

    logger.info({
      fileName: "route.ts",
      emoji: "✨",
      action: "POST",
      label: "mailingList",
      value: mailingList,
      message: "Mailing list created successfully",
    });

    return NextResponse.json(mailingList, { status: 201 });
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "POST",
      label: "error",
      value: error,
      message: "Failed to create mailing list",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
