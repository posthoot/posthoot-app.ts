import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";

const FILE_NAME = 'app/api/templates/[id]/route.ts';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    logger.info(
      FILE_NAME,
      24,
      'GET',
      'template',
      template.id,
      '📧 Retrieved email template'
    );

    return NextResponse.json(template);
  } catch (error) {
    logger.error(
      FILE_NAME,
      36,
      'GET', 
      'error',
      error,
      '❌ Error retrieving template'
    );

    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await req.json();
    const template = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: {
        name: json.name,
        subject: json.subject,
        content: json.content,
        variables: json.variables,
      },
    });

    logger.info(
      FILE_NAME,
      64,
      'PUT',
      'template',
      template.id,
      '✅ Updated email template'
    );

    return NextResponse.json(template);
  } catch (error) {
    logger.error(
      FILE_NAME,
      76,
      'PUT',
      'error',
      error,
      '❌ Error updating template'
    );

    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.emailTemplate.delete({
      where: { id: params.id },
    });

    logger.info(
      FILE_NAME,
      98,
      'DELETE',
      'templateId',
      params.id,
      '🗑️ Deleted email template'
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error(
      FILE_NAME,
      110,
      'DELETE',
      'error',
      error,
      '❌ Error deleting template'
    );

    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}