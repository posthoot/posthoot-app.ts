import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { User } from "./types";
export const authConfig = {
  callbacks: {
    // @ts-ignore
    session({
      session,
      user,
      token,
    }: {
      session: Session;
      user: User;
      token: JWT;
    }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          teamId: token.teamId || session.user.teamId,
        },
      };
    },
    // @ts-ignore
    jwt({ token, user }: { token: JWT; user: CustomAuthUser }) {
      if (user) {
        token.teamId = user.teamId;
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApiRoute = nextUrl.pathname.startsWith("/api");
      const isOnDashboard = nextUrl.pathname.startsWith("/");
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      // Allow API routes to handle their own auth
      if (isApiRoute) return true;

      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
