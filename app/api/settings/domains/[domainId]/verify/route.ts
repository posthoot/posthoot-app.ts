import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma as db } from "@/app/lib/prisma";
import dns from "dns/promises";

// Get this from environment variable
const EXPECTED_IP = process.env.SERVER_IP || "127.0.0.1";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ domainId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const domain = await db.customDomain.findUnique({
      where: {
        id: (await params).domainId,
        teamId: session.user.teamId,
      },
    });

    if (!domain) {
      return new NextResponse("Domain not found", { status: 404 });
    }

    // Verify domain ownership through A record
    try {
      const aRecords = await dns.resolve4(domain.domain);

      // Check if any of the A records match our expected IP
      const hasCorrectARecord = aRecords.some((ip) => ip === EXPECTED_IP);

      if (!hasCorrectARecord) {
        return new NextResponse(
          JSON.stringify({
            error: "Verification failed: A record not pointing to our server",
            details: {
              expected: EXPECTED_IP,
              found: aRecords,
              instructions: "Please add an A record pointing to our server IP",
            },
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Update domain verification status
      await db.customDomain.update({
        where: { id: domain.id },
        data: {
          isVerified: true,
          isActive: true,
        },
      });

      fetch(`https://${domain.domain}/`);

      return new NextResponse(
        JSON.stringify({
          message: "Domain verified successfully",
          status: "verified",
          domain: domain.domain,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("[DNS_VERIFICATION_ERROR]", error);

      // Check if it's a DNS resolution error
      if (error.code === "ENOTFOUND") {
        return new NextResponse(
          JSON.stringify({
            error: "Domain not found",
            details: {
              message:
                "The domain could not be resolved. Please check your DNS settings and try again.",
              expected: EXPECTED_IP,
              instructions: "Add an A record pointing to our server IP",
            },
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new NextResponse(
        JSON.stringify({
          error: "Failed to verify domain",
          details: {
            message: "Please check your DNS settings and try again.",
            expected: EXPECTED_IP,
            instructions: "Add an A record pointing to our server IP",
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("[DOMAIN_VERIFY_ERROR]", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while verifying the domain.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
