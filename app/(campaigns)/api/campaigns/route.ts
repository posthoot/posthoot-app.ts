import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/app/lib/prisma";
import { isEmpty, removeUndefined } from "@/lib/utils";

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
