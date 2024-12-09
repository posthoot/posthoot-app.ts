import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";
import { z } from "zod";

const contactSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  listId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { contacts, listId, teamId } = body;

    if (!teamId) {
      return new NextResponse("Team ID is required", { status: 400 });
    }

    // Validate list ownership
    const list = await prisma.mailingList.findFirst({
      where: {
        id: listId,
        teamId,
      },
    });

    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Validate and create contacts
    const createdContacts = await prisma.subscriber.createMany({
      data: contacts.map((contact: any) => ({
        ...contactSchema.parse({ ...contact, listId }),
        status: "ACTIVE",
      })),
      skipDuplicates: true,
    });

    logger.info({
      fileName: "route.ts",
      emoji: "👥",
      action: "POST",
      label: "contacts",
      value: createdContacts,
      message: "Contacts created successfully",
    });

    return NextResponse.json(createdContacts);
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "POST",
      label: "error",
      value: error,
      message: "Failed to create contacts",
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

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId");

    if (!listId) {
      return new NextResponse("List ID is required", { status: 400 });
    }

    // Validate list ownership
    const list = await prisma.mailingList.findFirst({
      where: {
        id: listId,
        teamId: session.user.teamId,
      },
    });

    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    const contacts = await prisma.subscriber.findMany({
      where: {
        listId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "GET",
      label: "error",
      value: error,
      message: "Failed to fetch contacts",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 