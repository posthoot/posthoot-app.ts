import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { logger } from "./app/lib/logger";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

if (process.env.NEXT_RUNTIME === "nodejs") {
  require("dotenv").config();
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const nextAuthConfig: NextAuthConfig = {
  callbacks: {
    ...(authConfig.callbacks as any),
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
      if (Date.now() < (token.exp as number) * 1000) {
        return token;
      }

      // Access token has expired, try to refresh it
      try {
        const {
          data: { token: accessToken, refresh_token: refreshToken, exp },
        } = await axios.post(`${API_URL}/auth/refresh`, {
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            refresh_token: token.refreshToken,
          },
        });

        return {
          ...token,
          accessToken,
          refreshToken,
          exp,
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
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
    newUser: "/auth/onboarding",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
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

          const { data } = await axios.post(`${API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          return data;
        } catch (error) {
          console.log("Error", error);
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
