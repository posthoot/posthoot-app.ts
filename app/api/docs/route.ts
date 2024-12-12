import { NextResponse } from "next/server";
import { getApiDocs } from "@/lib/swagger";
import { auth } from "@/auth";

/**
 * @openapi
 * /api/docs:
 *   get:
 *     summary: Get API documentation
 *     tags: [Documentation]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: API documentation
 */
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getApiDocs());
}
