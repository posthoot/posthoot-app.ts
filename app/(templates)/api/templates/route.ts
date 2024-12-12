import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";
import { auth } from "@/auth";
import { put } from "@vercel/blob";
import { extractVariables, isEmpty } from "@/lib/utils";

const FILE_NAME = "app/api/templates/route.ts";

const createTempFile = async (
  content: string,
  filename: string
): Promise<File> => {
  const tempFile = new File([content], filename, { type: "text/html" });
  return tempFile;
};

/**
 * @openapi
 * /api/templates:
 *   get:
 *     summary: List email templates
 *     tags: [Templates]
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
 *         description: List of email templates
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
 *                   html:
 *                     type: string
 *                   variables:
 *                     type: array
 *                     items:
 *                       type: string
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const teamId = url.searchParams.get("teamId");

    const templates = await prisma.emailTemplate.findMany({
      where: {
        teamId: {
          equals: teamId,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "📧",
      action: "GET",
      label: "templates",
      value: templates.length,
      message: "Retrieved email templates",
    });

    return NextResponse.json(templates);
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "💥",
      action: "GET",
      label: "error",
      value: error,
      message: "Error retrieving templates",
    });

    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/templates:
 *   post:
 *     summary: Create email template
 *     tags: [Templates]
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
 *               - html
 *               - teamId
 *             properties:
 *               name:
 *                 type: string
 *               html:
 *                 type: string
 *               teamId:
 *                 type: string
 *               emailCategoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Template created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
export async function POST(req: Request) {
  try {
    const json = await req.json();

    const htmlFile = `${json.id}.html`;

    const variables = extractVariables(json.html);

    // create a temp file with the html
    const tempFile: File = await createTempFile(json.html, htmlFile);

    const blob = await put(htmlFile, tempFile, {
      access: "public",
    });

    json.html = blob.url;

    if (!isEmpty(json.id)) {
      throw new Error("Template ID is not allowed to be set");
    } else {
      delete json.id;
    }

    const teamId = json.teamId;
    const emailCategoryId = json.emailCategoryId;

    delete json.teamId;
    delete json.emailCategoryId;

    const template = await prisma.emailTemplate.create({
      data: {
        ...json,
        variables,
        team: {
          connect: {
            id: teamId,
          },
        },
        category: {
          connect: {
            id: emailCategoryId,
          },
        },
      },
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "POST",
      label: "template",
      value: template.id,
      message: "Created new email template",
    });

    return NextResponse.json(template);
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "POST",
      label: "error",
      value: error.message,
      message: "Error creating template",
    });

    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();

    // create a html file with the name of the template id
    const htmlFile = `${json.id}.html`;

    const variables = extractVariables(json.html);

    // create a temp file with the html
    const tempFile: File = await createTempFile(json.html, htmlFile);

    const blob = await put(htmlFile, tempFile, {
      access: "public",
    });

    json.html = blob.url;

    const template = await prisma.emailTemplate.update({
      where: { id: json.id },
      data: {
        ...json,
        variables,
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
