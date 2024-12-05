import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { logger, LogLevel } from "@/app/lib/logger";
import { auth } from "@/auth";

const FILE_NAME = 'app/api/templates/route.ts';

export async function GET() {
  try {
    const session = await auth();

    const templates = await prisma.emailTemplate.findMany({
      where: {
        teamId: {
          equals: session?.user.teamId,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    logger.info(
      FILE_NAME,
      12,
      "GET",
      "templates",
      templates.length,
      "📧 Retrieved email templates"
    );

    return NextResponse.json(templates);
  } catch (error) {
    logger.error(
      FILE_NAME,
      24,
      'GET',
      'error',
      error,
      '❌ Error retrieving templates'
    );

    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const template = await prisma.emailTemplate.create({
      data: json,
    });

    logger.info(
      FILE_NAME,
      48,
      'POST',
      'template',
      template.id,
      '✅ Created new email template'
    );

    return NextResponse.json(template);
  } catch (error) {
    logger.error(
      FILE_NAME,
      60,
      'POST',
      'error',
      error,
      '❌ Error creating template'
    );

    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}