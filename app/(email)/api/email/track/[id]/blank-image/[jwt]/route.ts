import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JwtData } from "nodemailer-mail-tracking/dist/types";
import { prisma } from "@/app/lib/prisma";
import { TrackingType } from "@prisma/client";

// Return 1x1 transparent GIF
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

const emptyImageResponse = new NextResponse(TRANSPARENT_GIF_BUFFER, {
  headers: {
    "Content-Type": "image/gif",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
});

/**
 * @openapi
 * /api/email/track/blank-image/{jwt}:
 *   get:
 *     summary: Track email opens via blank tracking image
 *     tags: [Email]
 *     parameters:
 *       - in: path
 *         name: jwt
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a 1x1 transparent GIF image
 *       401:
 *         description: Invalid JWT token
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ jwt: string; id: string }> }
) {
  try {
    // Verify and decode JWT token
    const decoded: JwtData = jwt.verify(
      (await params).jwt,
      process.env.JWT_SECRET
    ) as JwtData;

    if (decoded.recipient) {
      const imageId = (await params).id;

      if (imageId) {
        await prisma.sentEmail
          .update({
            where: { id: imageId },
            data: {
              openedAt: new Date(),
            },
          })
          .then(async () => {
            await prisma.emailTracking.create({
              data: {
                sentEmail: {
                  connect: {
                    id: imageId,
                  },
                },
                type: TrackingType.OPENED,
              },
            });
          });
      }
    }
    return emptyImageResponse;
  } catch (error) {
    return emptyImageResponse;
  }
}
