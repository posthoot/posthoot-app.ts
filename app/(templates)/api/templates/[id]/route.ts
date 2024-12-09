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

    logger.info({
      fileName: FILE_NAME,
      emoji: "📧",
      action: "GET",
      label: "template",
      value: template.id,
      message: "Retrieved email template",
    });

    return NextResponse.json(template);
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "GET",
      label: "error",
      value: error,
      message: "Error retrieving template",
    });

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

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "PUT",
      label: "template",
      value: template.id,
      message: "Updated email template",
    });

    return NextResponse.json(template);
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "PUT",
      label: "error",
      value: error,
      message: "Error updating template",
    });

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

    logger.info({
      fileName: FILE_NAME,
      emoji: "🗑️",
      action: "DELETE",
      label: "templateId",
      value: params.id,
      message: "Deleted email template",
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "DELETE",
      label: "error",
      value: error,
      message: "Error deleting template",
    });

    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}