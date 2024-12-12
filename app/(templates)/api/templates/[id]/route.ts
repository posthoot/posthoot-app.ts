import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";

const FILE_NAME = 'app/api/templates/[id]/route.ts';

/**
 * @openapi
 * /api/templates/{id}:
 *   get:
 *     summary: Get a specific email template
 *     tags: [Templates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Email template details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 html:
 *                   type: string
 *                 variables:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal Server Error
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: (await params).id },
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

/**
 * @openapi
 * /api/templates/{id}:
 *   put:
 *     summary: Update an email template
 *     tags: [Templates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subject
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *               variables:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal Server Error
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const json = await req.json();
    const template = await prisma.emailTemplate.update({
      where: { id: (await params).id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.emailTemplate.delete({
      where: { id: (await params).id },
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "🗑️",
      action: "DELETE",
      label: "templateId",
      value: (await params).id,
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