import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma as db } from "@/app/lib/prisma";
import { z } from "zod";

const domainSchema = z.object({
  domain: z
    .string()
    .min(1)
    .regex(/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/),
});

/**
 * @openapi
 * /api/settings/domains:
 *   get:
 *     summary: List custom domains
 *     description: Retrieve all custom domains for the authenticated team
 *     tags:
 *       - Domains
 *     responses:
 *       200:
 *         description: List of custom domains
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   domain:
 *                     type: string
 *                   sslStatus:
 *                     type: string
 *                   isVerified:
 *                     type: boolean
 *                   isActive:
 *                     type: boolean
 *                   verificationToken:
 *                     type: string
 *                   sslExpiresAt:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *   post:
 *     summary: Add custom domain
 *     description: Add a new custom domain to the authenticated team
 *     tags:
 *       - Domains
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *             properties:
 *               domain:
 *                 type: string
 *                 pattern: ^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$
 *                 example: example.com
 *     responses:
 *       200:
 *         description: Custom domain created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 domain:
 *                   type: string
 *                 sslStatus:
 *                   type: string
 *                 isVerified:
 *                   type: boolean
 *                 isActive:
 *                   type: boolean
 *                 verificationToken:
 *                   type: string
 *       400:
 *         description: Invalid domain or domain already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { domain } = domainSchema.parse(json);

    // Check if domain already exists
    const existingDomain = await db.customDomain.findUnique({
      where: { domain },
    });

    if (existingDomain) {
      return new NextResponse("Domain already exists", { status: 400 });
    }

    // Create new domain
    const customDomain = await db.customDomain.create({
      data: {
        domain,
        teamId: session.user.teamId,
      },
    });

    return NextResponse.json(customDomain);
  } catch (error) {
    console.error("[DOMAIN_CREATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const domains = await db.customDomain.findMany({
      where: {
        teamId: session.user.teamId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(domains);
  } catch (error) {
    console.error("[DOMAIN_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 