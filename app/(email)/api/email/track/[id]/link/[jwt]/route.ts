import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JwtDataForLink } from "nodemailer-mail-tracking/dist/types";
import { prisma } from "@/app/lib/prisma";
import { TrackingType } from "@prisma/client";

/**
 * @openapi
 * /api/email/track/link/{jwt}:
 *   get:
 *     summary: Track email link clicks
 *     tags: [Email]
 *     parameters:
 *       - in: path
 *         name: jwt
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Redirects to the tracked link
 *       401:
 *         description: Invalid JWT token
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ jwt: string; id: string }> }
) {
  // Verify and decode JWT token
  const decoded: JwtDataForLink = jwt.verify(
    (await params).jwt,
    process.env.JWT_SECRET
  ) as JwtDataForLink;
  try {
    const sentEmailId = (await params).id;

    if (decoded.recipient) {
      await prisma.sentEmail
        .update({
          where: { id: sentEmailId },
          data: {
            clickedAt: new Date(),
          },
        })
        .then(async () => {
          await prisma.emailTracking.create({
            data: {
              sentEmail: {
                connect: {
                  id: sentEmailId,
                },
              },
              type: TrackingType.CLICKED,
            },
          });
        });
    }

    // Redirect to the original link
    return NextResponse.redirect(decoded.link);
  } catch (error) {
    return NextResponse.redirect(decoded.link);
  }
}
