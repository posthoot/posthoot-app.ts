// next-auth.d.ts
import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";

// Define user roles as an enum for better type safety
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER"
}

// Define user status as an enum
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

// Custom auth user interface extending NextAuth's base user
export interface CustomAuthUser extends NextAuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId: string;
  status: UserStatus;
  lastLoginAt?: Date;
}

// Extend next-auth module
export declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: CustomAuthUser;
  }
}

// Extend JWT module
declare module "next-auth/jwt" {
  interface JWT {
    user?: CustomAuthUser;
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    expiresAt?: number;
  }
}