import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { logger } from "./app/lib/logger";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const nextAuthConfig: NextAuthConfig = {
  callbacks: {
    ...authConfig.callbacks as any,
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          teamId: user.teamId,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.exp as number * 1000)) {
        return token;
      }

      // Access token has expired, try to refresh it
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: token.refreshToken,
          }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
          throw refreshedTokens;
        }

        return {
          ...token,
          accessToken: refreshedTokens.token,
          exp: refreshedTokens.exp,
        };
      } catch (error) {
        logger.error({
          fileName: "auth.ts",
          action: "refresh-token",
          label: "error",
          value: error,
          emoji: "❌",
          message: "Failed to refresh token",
        });

        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.error = token.error;
        session.user.role = token.role as string;
        session.user.teamId = token.teamId as string;
      }
      return session;
    },
  },
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 }, // 24 hours
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to authenticate");
          }

          // Get user details from our backend
          const userResponse = await fetch(`${API_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          });

          const userData = await userResponse.json();

          if (!userResponse.ok) {
            throw new Error("Failed to get user details");
          }

          return {
            id: userData.id,
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`,
            role: userData.role,
            teamId: userData.teamId,
            accessToken: data.token,
            refreshToken: data.refresh_token,
          };
        } catch (error) {
          logger.error({
            fileName: "auth.ts",
            action: "authorize",
            label: "error",
            value: error,
            emoji: "❌",
            message: "Error",
          });
          return null;
        }
      },
    }),
  ],
};

export const { handlers, auth, signIn, signOut } = NextAuth(nextAuthConfig);
