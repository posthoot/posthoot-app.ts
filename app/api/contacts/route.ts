const FILE_NAME = "app/api/contacts/route.ts";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/app/lib/logger";
import { z } from "zod";
import { APIService } from "@/lib/services/api";
import { Contact, ApiError, MailingList } from "@/lib";

// Response interfaces
interface CreateContactsResponse {
  contacts: Contact[];
  error?: string;
}

interface GetContactsResponse {
  contacts: Contact[];
  error?: string;
}

// Request interfaces
interface CreateContactsRequest {
  contacts: Contact[];
  listId: string;
  teamId: string;
}

const contactSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  listId: z.string(),
});

/**
 * @openapi
 * /api/contacts:
 *   post:
 *     summary: Create contacts
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contacts:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Contact'
 *     responses:
 *       200:
 *         description: Contacts created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function POST(
  request: Request
): Promise<NextResponse<CreateContactsResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "contacts",
        value: {},
        message: "Unauthorized",
      });
      return NextResponse.json(
        { error: "Unauthorized", contacts: [] },
        { status: 401 }
      );
    }

    const apiService = new APIService("contacts", session);
    const body = (await request.json()) as CreateContactsRequest;
    const { contacts, listId, teamId } = body;

    if (!teamId) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❌",
        action: "validate",
        label: "contacts",
        value: { teamId: null },
        message: "Missing team ID",
      });
      return NextResponse.json(
        { error: "Team ID is required", contacts: [] },
        { status: 400 }
      );
    }

    const list = await apiService.get<MailingList>(
      `${listId}?include=Contacts`,
      { teamId }
    );
    if (!list) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "❓",
        action: "fetch",
        label: "list",
        value: { listId, teamId },
        message: "List not found",
      });
      return NextResponse.json(
        { error: "List not found", contacts: [] },
        { status: 404 }
      );
    }

    const createdContacts = await apiService.post<Contact[]>("/contacts", {
      contacts: contacts.map((contact) =>
        contactSchema.parse({ ...contact, listId })
      ),
    });

    return NextResponse.json({ contacts: createdContacts });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "create",
      label: "contacts",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to create contacts",
    });
    return NextResponse.json(
      { error: apiError.message || "Internal Server Error", contacts: [] },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/contacts:
 *   get:
 *     summary: Get contacts
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: List ID
 *     responses:
 *       200:
 *         description: Contacts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function GET(
  request: Request
): Promise<NextResponse<GetContactsResponse | { error: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: "contacts/route.ts",
        emoji: "🚫",
        action: "authenticate",
        label: "contacts",
        value: null,
        message: "Unauthorized access attempt",
      });
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    if (!listId) {
      logger.warn({
        fileName: "contacts/route.ts",
        emoji: "❌",
        action: "validate",
        label: "contacts",
        value: { listId },
        message: "Missing list ID",
      });
      return new NextResponse("List ID is required", { status: 400 });
    }

    const apiService = new APIService("contacts", session);
    const contacts = await apiService.get<Contact[]>("", {
      list_id: listId,
      page: page ? parseInt(page) : 0,
      limit: limit ? parseInt(limit) : 20,
    });

    // @ts-ignore
    return NextResponse.json(contacts);
  } catch (error) {
    logger.error({
      fileName: "contacts/route.ts",
      emoji: "❌",
      action: "fetch",
      label: "contacts",
      value: error,
      message: "Failed to fetch contacts",
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
