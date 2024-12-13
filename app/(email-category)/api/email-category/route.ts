import { NextResponse } from "next/server";
import { PrismaClient } from "@/@prisma/client";
import { logger } from "@/app/lib/logger";
import { auth } from "@/auth";
const prisma = new PrismaClient();
const FILE_NAME = "app/(email-category)/api/email-category/route.ts";

/**
 * @openapi
 * /api/email-category:
 *   get:
 *     summary: List all email categories
 *     tags: [Email Categories]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of email categories
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.emailCategory.findMany();

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "GET",
      label: "categories",
      value: categories.length,
      message: "Fetched email categories",
    });

    return NextResponse.json(categories);
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "GET",
      label: "error",
      value: error,
      message: "Error fetching email categories",
    });

    return NextResponse.json(
      { error: "Failed to fetch email categories" },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/email-category:
 *   post:
 *     summary: Create a new email category
 *     tags: [Email Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email category created successfully
 *       401:
 *         description: Unauthorized - Requires admin role
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
export async function POST(req: Request) {
  try {
    const json = await req.json();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const getUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!getUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (getUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const category = await prisma.emailCategory.create({
      data: json,
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "POST",
      label: "category",
      value: category.id,
      message: "Created new email category",
    });

    return NextResponse.json(category);
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "POST",
      label: "error",
      value: error,
      message: "Error creating email category",
    });

    return NextResponse.json(
      { error: "Failed to create email category" },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/email-category:
 *   put:
 *     summary: Update an email category
 *     tags: [Email Categories]
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
 *               - name
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email category updated successfully
 *       401:
 *         description: Unauthorized - Requires admin role
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const getUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!getUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (getUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();

    const category = await prisma.emailCategory.update({
      where: { id: json.id },
      data: json,
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "PUT",
      label: "category",
      value: category.id,
      message: "Updated email category",
    });

    return NextResponse.json(category);
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "PUT",
      label: "error",
      value: error,
      message: "Error updating email category",
    });

    return NextResponse.json(
      { error: "Failed to update email category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const getUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!getUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (getUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();

    const category = await prisma.emailCategory.delete({
      where: { id: json.id },
    });

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "DELETE",
      label: "category",
      value: category.id,
      message: "Deleted email category",
    });

    return NextResponse.json({ message: "Email category deleted" });
  } catch (error) {
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "DELETE",
      label: "error",
      value: error,
      message: "Error deleting email category",
    });

    return NextResponse.json(
      { error: "Failed to delete email category" },
      { status: 500 }
    );
  }
}
