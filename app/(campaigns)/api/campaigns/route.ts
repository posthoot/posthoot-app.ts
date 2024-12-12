import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { isEmpty, removeUndefined } from "@/lib/utils";

/**
 * @openapi
 * /api/campaigns:
 *   get:
 *     summary: List all campaigns
 *     tags: [Campaigns]
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
 *         description: List of campaigns
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
 *                   status:
 *                     type: string
 *                     enum: [DRAFT, SCHEDULED, SENDING, COMPLETED, FAILED]
 *                   analytics:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request - Team ID required
 *       500:
 *         description: Internal Server Error
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return new NextResponse("Team ID required", { status: 400 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: {
        team: {
          users: {
            some: {
              id: session.user.id,
            },
          },
        },
      },
      include: {
        analytics: true,
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("[CAMPAIGNS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * @openapi
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - templateId
 *               - listId
 *               - smtpConfigId
 *               - teamId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               templateId:
 *                 type: string
 *               listId:
 *                 type: string
 *               schedule:
 *                 type: string
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
 *               recurringSchedule:
 *                 type: string
 *               cronExpression:
 *                 type: string
 *               smtpConfigId:
 *                 type: string
 *               teamId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Campaign created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    if (!body) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      templateId,
      listId,
      schedule,
      scheduledFor,
      recurringSchedule,
      cronExpression,
      smtpConfigId,
      teamId,
    } = body;

    const parsedBody = removeUndefined({
      name,
      description,
      schedule,
      scheduledFor: isEmpty(scheduledFor) ? null : new Date(scheduledFor),
      recurringSchedule,
      cronExpression,
      template: {
        connect: {
          id: templateId,
        },
      },
      mailingList: {
        connect: {
          id: listId,
        },
      },
      smtpConfig: {
        connect: {
          id: smtpConfigId,
        },
      },
      team: {
        connect: {
          id: teamId,
        },
      },
    });

    const campaign = await prisma.campaign.create({
      data: parsedBody,
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[CAMPAIGNS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * @openapi
 * /api/campaigns:
 *   put:
 *     summary: Update a campaign
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               schedule:
 *                 type: string
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request - Campaign ID required
 *       500:
 *         description: Internal Server Error
 */
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new NextResponse("Campaign ID required", { status: 400 });
    }

    const campaign = await prisma.campaign.update({
      where: {
        id,
        team: { users: { some: { id: session.user.id } } },
        status: "DRAFT",
      },
      data: updateData,
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[CAMPAIGNS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * @openapi
 * /api/campaigns:
 *   delete:
 *     summary: Delete a campaign
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the campaign to delete
 *     responses:
 *       204:
 *         description: Campaign deleted successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request - Campaign ID required
 *       500:
 *         description: Internal Server Error
 */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("id");

    if (!campaignId) {
      return new NextResponse("Campaign ID required", { status: 400 });
    }

    await prisma.campaign.delete({
      where: {
        id: campaignId,
        team: {
          users: {
            some: {
              id: session.user.id,
            },
          },
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CAMPAIGNS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
