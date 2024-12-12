import { uploadFile } from "@/app/lib/blobs";
import { auth } from "@/auth";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

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
export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const session = await auth();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const filename = searchParams.get("filename");

  const uploadedFile = await uploadFile(request.body);

  const blob = await put(filename, uploadedFile, {
    access: "public",
  });

  return NextResponse.json(blob);
}
