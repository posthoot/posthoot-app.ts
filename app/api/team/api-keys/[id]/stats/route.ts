import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * @openapi
 * /api/team/api-keys/{id}/stats:
 *   get:
 *     summary: Get API key usage stats
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key usage stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRequests:
 *                   type: number
 *                 successRate:
 *                   type: number
 *                 topEndpoints:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       endpoint:
 *                         type: string
 *                       count:
 *                         type: number
 *                 recentErrors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                       error:
 *                         type: string
 *       404:
 *         description: API key not found
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
 * 
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get API key usage stats
    const [
      totalRequests,
      successRate,
      topEndpoints,
      recentErrors
    ] = await Promise.all([
      // Total requests
      prisma.apiKeyUsage.count({
        where: { apiKeyId: (await params).id }
      }),
      // Success rate
      prisma.apiKeyUsage.aggregate({
        where: { apiKeyId: (await params).id },
        _count: {
          _all: true,
          success: true
        }
      }),
      // Top endpoints
      prisma.apiKeyUsage.groupBy({
        by: ['endpoint'],
        where: { apiKeyId: (await params).id },
        _count: true,
        orderBy: {
          _count: {
            endpoint: 'desc'
          }
        },
        take: 5
      }),
      // Recent errors
      prisma.apiKeyUsage.findMany({
        where: {
          apiKeyId: (await params).id,
          success: false,
          error: { not: null }
        },
        select: {
          timestamp: true,
          error: true
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 5
      })
    ]);

    return NextResponse.json({
      totalRequests,
      successRate: successRate._count._all > 0 
        ? Math.round((successRate._count.success / successRate._count._all) * 100)
        : 0,
      topEndpoints: topEndpoints.map(e => ({
        endpoint: e.endpoint,
        count: e._count
      })),
      recentErrors: recentErrors.map(e => ({
        timestamp: e.timestamp,
        error: e.error
      }))
    });
  } catch (error) {
    console.error('Error fetching API key stats:', error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
} 