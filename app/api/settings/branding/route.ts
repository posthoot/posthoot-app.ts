import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { prisma as db } from "@/app/lib/prisma";
import { uploadFile } from "@/app/lib/blobs";
const brandingSchema = z.object({
  dashboardName: z.string().min(2),
  logo: z.any().optional(), // File upload will be handled separately
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const data = {
      dashboardName: formData.get("dashboardName"),
      customDomain: formData.get("customDomain"),
    };

    const validatedData = brandingSchema.parse(data);

    // Handle logo upload if present
    const logoFile = formData.get("logo") as File | null;
    let logoUrl = null;
    
    if (logoFile) {
        const response = await uploadFile(logoFile);
        logoUrl = response;
    }

    // Update branding settings in the database
    await db.team.update({
      where: {
        id: session.user.teamId,
      },
      data: {
        name: validatedData.dashboardName,
        logoUrl: logoUrl || undefined,
      },
    });

    return new NextResponse("Branding settings updated successfully", { status: 200 });
  } catch (error) {
    console.error("[BRANDING_SETTINGS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const team = await db.team.findUnique({
      where: {
        id: session.user.teamId,
      },
      select: {
        name: true,
        customDomains: true,
        logoUrl: true,
      },
    });

    if (!team) {
      return new NextResponse("Team not found", { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("[BRANDING_SETTINGS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 