import NextAuth, { NextAuthConfig, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/app/lib/prisma";
import { authConfig } from "./auth.config";
import { logger } from "./app/lib/logger";
import bcrypt from "bcryptjs";
import { CustomAuthUser } from "./types/next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  callbacks: authConfig.callbacks as any,
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            logger.info(
              "auth.ts",
              25,
              "authorize",
              "Missing credentials",
              { email: credentials?.email },
              "Missing credentials"
            );
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string, status: "ACTIVE" },
            include: { team: true },
          });

          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            user.password as string
          );

          if (!user || !user?.hasOwnProperty("email") || !passwordsMatch) {
            logger.info(
              "auth.ts",
              50,
              "authorize",
              "User not found",
              { email: credentials.email },
              "User not found"
            );
            return null;
          }

          const finalUser: CustomAuthUser = {
            ...user,
            teamId: user.team.id,
          } as CustomAuthUser;

          return finalUser;
        } catch (error) {
          logger.error("auth.ts", 49, "authorize", "Error", { error }, "Error");
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig);
