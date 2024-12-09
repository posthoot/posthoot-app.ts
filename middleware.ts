import { auth } from "@/auth";

const middleware = auth;

export const config = {
  // Protect all routes except public ones
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - login (auth pages)
     * - signup (auth pages)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|login|signup).*)",
  ],
};
export default middleware;

