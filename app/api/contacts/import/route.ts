import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";
import { parse } from "papaparse";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const listId = formData.get("listId") as string;
    const teamId = formData.get("teamId") as string;

    if (!file || !listId) {
      return new NextResponse("File and list ID are required", { status: 400 });
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

    // Parse CSV
    const csvText = await file.text();
    const { data, errors } = parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Invalid CSV format", errors },
        { status: 400 }
      );
    }

    // Transform and validate data
    const contacts = data.map((row: any) => ({
      email: row.email,
      firstName: row.firstName || row.first_name || null,
      lastName: row.lastName || row.last_name || null,
      metadata: row,
      listId,
      status: "ACTIVE",
    }));

    // Create contacts
    const result = await prisma.subscriber.createMany({
      data: contacts.map((contact: any) => ({
        ...contact,
        status: "ACTIVE",
      })),
      skipDuplicates: true,
    });

    logger.info({
      fileName: "route.ts",
      emoji: "📥",
      action: "POST",
      label: "import",
      value: result,
      message: "Contacts imported successfully",
    });

    return NextResponse.json({
      message: "Import successful",
      imported: result.count,
    });
  } catch (error) {
    logger.error({
      fileName: "route.ts",
      emoji: "❌",
      action: "POST",
      label: "error",
      value: error,
      message: "Failed to import contacts",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 