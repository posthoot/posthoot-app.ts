import NextAuth, { NextAuthConfig, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import { authConfig } from "./auth.config";
import { logger } from "./app/lib/logger";
import { compareSync } from "bcrypt-edge";

const nextAuthConfig: NextAuthConfig = {
  callbacks: authConfig.callbacks as any,
  trustHost: true,
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
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

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string, status: "ACTIVE" },
            include: { team: true },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = compareSync(
            credentials.password as string,
            user.password as string
          );

          if (!passwordsMatch) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            teamId: user.team?.id,
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
    CredentialsProvider({
      id: "api-key",
      name: "API Key",
      credentials: {
        apiKey: { label: "API Key", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.apiKey) return null;

          const apiKey = await prisma.apiKey.findUnique({
            where: {
              key: credentials.apiKey as string,
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
                      name: true,
                      role: true,
                    },
                  },
                },
              },
            },
          });

          if (!apiKey?.team?.users[0]) return null;

          const user = apiKey.team.users[0];
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            teamId: apiKey.teamId,
          };
        } catch (error) {
          logger.error({
            fileName: "auth.ts",
            action: "api-key-authorize",
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
