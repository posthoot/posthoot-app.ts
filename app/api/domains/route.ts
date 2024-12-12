import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";

/**
 * @swagger
 * /api/domains:
 *   get:
 *     summary: Get all whitelisted domains
 *     tags: [Domains]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of whitelisted domains
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       401:
 *         description: Unauthorized
 */
export async function GET() {
  try {
    const domains = await prisma.customDomain.findMany({
      where: {
        isVerified: true,
        isActive: true,
      },
      select: {
        id: true,
        domain: true,
        isVerified: true,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(domains.map((domain) => domain.domain));

  } catch (error) {
    logger.error({
      fileName: "domains/route.ts",
      action: "GET",
      label: "error",
      value: error,
      emoji: "❌",
      message: "Error retrieving whitelisted domains",
    });

    return NextResponse.json([]);
  }
}
