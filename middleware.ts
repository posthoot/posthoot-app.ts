import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

export const config = {
  matcher: ["/((?!accept-invitation|_next/static|_next/image|favicon.ico|login|api/auth).*)"],
};

const API_SCOPES = {
  "/api/contacts": ["contacts:read", "contacts:write"],
  "/api/templates": ["templates:read", "templates:write"],
  "/api/campaigns": ["campaigns:read", "campaigns:write"],
  "/api/team": ["team:read", "team:write"],
  "/api/mailing-lists": ["mailing-lists:read", "mailing-lists:write"],
  "/api/email": ["email:read", "email:write", "email:send"],
  "/api/smtp": ["smtp:read", "smtp:write"],
  "/api/settings": ["settings:read", "settings:write"],
  "/api/domains": ["domains:read", "domains:write", "domains:verify"],
  "/api/branding": ["branding:read", "branding:write"],
  "/api/webhooks": ["webhooks:read", "webhooks:write"],
  "/api/users": ["users:read", "users:write"],
  "/api/roles": ["roles:read", "roles:write"],
  "/api/api-keys": ["api-keys:read", "api-keys:write"],
  "/api/email-categories": ["email-categories:read", "email-categories:write"],
  "/api/auth": ["auth:token"],
  "/api/tracking": ["tracking:read", "tracking:write"],
} as const;

async function logApiUsage(
  apiKeyId: string,
  request: NextRequest,
  success: boolean,
  error?: string
) {
  const userAgent = request.headers.get("user-agent") || undefined;
  const ipAddress =
    request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");

  await prisma.apiKeyUsage.create({
    data: {
      apiKeyId,
      endpoint: request.nextUrl.pathname,
      method: request.method,
      success,
      error,
      ipAddress: ipAddress?.toString(),
      userAgent,
    },
  });
}

function getRequiredScopes(path: string, method: string): string[] {
  const basePath = Object.keys(API_SCOPES).find((p) => path.startsWith(p));
  if (!basePath) return [];

  const scopes = API_SCOPES[basePath as keyof typeof API_SCOPES];
  return method === "GET" ? [scopes[0]] : Array.isArray(scopes) ? scopes : [];
}

export async function middleware(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (apiKey) {
    // Check API key validity and get record
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: {
        key: apiKey,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        team: {
          include: {
            users: {
              where: { role: "ADMIN" },
              take: 1,
              select: {
                id: true,
                email: true,
                role: true,
                teamId: true,
              },
            },
          },
        },
      },
    });

    if (!apiKeyRecord?.team?.users[0]) {
      return new NextResponse(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: {
          "content-type": "application/json",
          "x-pathname": request.nextUrl.pathname,
        },
      });
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(apiKey, apiKeyRecord.rateLimit);
    if (!rateLimit.success) {
      await logApiUsage(apiKeyRecord.id, request, false, "Rate limit exceeded");
      return new NextResponse(
        JSON.stringify({
          error: "Rate limit exceeded",
          reset: rateLimit.reset,
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
        }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.reset.toString(),
            "x-pathname": request.nextUrl.pathname,
          },
        }
      );
    }

    // Check scopes
    const requiredScopes = getRequiredScopes(
      request.nextUrl.pathname,
      request.method
    );
    const hasRequiredScopes = requiredScopes.every((scope) =>
      apiKeyRecord.scopes.includes(scope)
    );

    if (!hasRequiredScopes) {
      await logApiUsage(
        apiKeyRecord.id,
        request,
        false,
        `Missing required scopes: ${requiredScopes.join(", ")}`
      );
      return new NextResponse(
        JSON.stringify({
          error: "Insufficient permissions",
          requiredScopes,
          providedScopes: apiKeyRecord.scopes,
        }),
        {
          status: 403,
          headers: {
            "content-type": "application/json",
            "x-pathname": request.nextUrl.pathname,
          },
        }
      );
    }

    // Log successful API usage
    await logApiUsage(apiKeyRecord.id, request, true);

    // Authenticate with NextAuth
    const response = await fetch(
      new URL("/api/auth/callback/api-key", request.url),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      }
    );

    if (!response.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication failed" }),
        {
          status: 401,
          headers: {
            "content-type": "application/json",
            "x-pathname": request.nextUrl.pathname,
          },
        }
      );
    }
  }

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
}
