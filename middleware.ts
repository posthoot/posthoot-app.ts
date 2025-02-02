import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export const config = {
  runtime: "experimental-edge",
  matcher: ["/((?!accept-invitation|_next/static|_next/image|favicon.ico|auth/login|api/auth|public|assets).*)"],
};

export async function middleware(request: NextRequest) {
  // Check session (will work for both regular auth and API key auth)
  const session = await auth();
  if (!session?.user) {
    const publicRoutes = [
      /^\/accept-invitation$/,
      /^\/api\/team\/invite\/[^/]+$/,
      /^\/login$/,
      /^\/api\/auth\/callback\/api-key$/,
      /^\/api\/auth\//,
      /^\/api\/email\/track\/[^/]+\/blank-image\/[^/]+$/,
      /^\/api\/email\/track\/[^/]+\/link\/[^/]+$/,
    ];
    if (!publicRoutes.some((route) => route.test(request.nextUrl.pathname))) {
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: {
            "content-type": "application/json",
            "x-pathname": request.nextUrl.pathname,
          },
        });
      } else {
        return Response.redirect(new URL("/login", request.url));
      }
    } else {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}
