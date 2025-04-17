import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { logger } from "@/app/lib/logger";
import { APIService } from "@/lib/services/api";
import { ApiError } from "@/lib";
import { randomUUID } from "crypto";

const FILE_NAME = "api/blobs/route.ts";

interface BlobUploadRequest {
  filename: string;
  file: File;
}

interface BlobUploadResponse {
  data: {
    url: string;
  };
  error?: string;
}

/**
 * @openapi
 * /api/blobs:
 *   post:
 *     summary: Upload a file
 *     tags: [Blobs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 description: The name of the file to upload
 *                 in: formData
 *                 required: true
 */
export async function POST(
  request: Request
): Promise<NextResponse<BlobUploadResponse | { error: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      logger.warn({
        fileName: FILE_NAME,
        emoji: "🚫",
        action: "authenticate",
        label: "blob",
        value: {},
        message: "Unauthorized",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // upload file
    const form = await request.formData();
    const file = form.get("file") as File;
    const fileService = new APIService("files", session);
    const { file: fileId, url } = await fileService.upload(file);

    return NextResponse.json({ data: { url, fileId } });
  } catch (error) {
    const apiError = error as ApiError;
    logger.error({
      fileName: FILE_NAME,
      emoji: "❌",
      action: "upload",
      label: "blob",
      value: { error: apiError.message || "Unknown error" },
      message: "Failed to upload blob",
    });
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
