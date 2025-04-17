import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { APIService } from "@/lib/services/api";
import { logger } from "@/app/lib/logger";
import { ApiError } from "@/lib";

interface EmailCategory {
  id: string;
  name: string;
}

interface GetEmailCategoriesResponse {
  data: EmailCategory[];
  error?: string;
}

interface CreateEmailCategoryRequest {
  name: string;
}

interface UpdateEmailCategoryRequest {
  id: string;
  name: string;
}

interface DeleteEmailCategoryRequest {
  id: string;
}

const FILE_NAME = "app/(email-category)/api/email-category/route.ts";

export async function GET(
  request: Request
): Promise<NextResponse<GetEmailCategoriesResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "email_category",
        value: { userId: null },
        message: "Unauthorized access attempt"
      });
      return NextResponse.json({ data: [], error: "Unauthorized" }, { status: 401 });
    }

    const apiService = new APIService("categories", session);
    const data: { data: EmailCategory[]; total: number } = await apiService.get<{
      data: EmailCategory[];
      total: number;
    }>("", {
      limit: 10,
      page: 1,
    });

    console.log("data", data);

    logger.info({
      fileName: FILE_NAME,
      emoji: "🔍",
      action: "fetch",
      label: "email_category",
      value: { count: data.total },
      message: "Retrieved email categories"
    });

    return NextResponse.json({
      ...data,
      totalCount: data.total,
    });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "fetch",
      label: "email_category",
      value: { error: apiError.message || "Unknown error" },
      message: "Error fetching email categories"
    });
    return NextResponse.json(
      { data: [], error: "Failed to fetch email categories" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<{ data: EmailCategory; error?: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "email_category",
        value: { userId: null },
        message: "Unauthorized access attempt"
      });
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const apiService = new APIService("email-category", session);
    const data = await apiService.post<EmailCategory>("", body);

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "create",
      label: "email_category",
      value: { categoryId: data.id },
      message: "Created email category"
    });

    return NextResponse.json({ data });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "create",
      label: "email_category",
      value: { error: apiError.message || "Unknown error" },
      message: "Error creating email category"
    });
    return NextResponse.json(
      { data: null, error: "Failed to create email category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request
): Promise<NextResponse<{ data: EmailCategory; error?: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "email_category",
        value: { userId: null },
        message: "Unauthorized access attempt"
      });
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const apiService = new APIService("email-category", session);
    const data = await apiService.post<EmailCategory>(`${body.id}/update`, body);

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "update",
      label: "email_category",
      value: { categoryId: data.id },
      message: "Updated email category"
    });

    return NextResponse.json({ data });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "update",
      label: "email_category",
      value: { error: apiError.message || "Unknown error" },
      message: "Error updating email category"
    });
    return NextResponse.json(
      { data: null, error: "Failed to update email category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "email_category",
        value: { userId: null },
        message: "Unauthorized access attempt"
      });
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const apiService = new APIService("email-category", session);
    await apiService.post<void>(`${body.id}/delete`, {});

    logger.info({
      fileName: FILE_NAME,
      emoji: "✅",
      action: "delete",
      label: "email_category",
      value: { categoryId: body.id },
      message: "Deleted email category"
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "delete",
      label: "email_category",
      value: { error: apiError.message || "Unknown error" },
      message: "Error deleting email category"
    });
    return NextResponse.json(
      { success: false, error: "Failed to delete email category" },
      { status: 500 }
    );
  }
}
