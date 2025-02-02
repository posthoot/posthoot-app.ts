import { SMTPProvider } from "@/types";
import { z } from "zod";

export const formSchema = z.object({
  id: z.string().optional(),
  provider: z.nativeEnum(SMTPProvider),
  host: z.string().min(1, "Host is required"),
  port: z.string().regex(/^\d+$/, "Port must be a number"),
  username: z.string().email("Invalid email"),
  requiresAuth: z.boolean().default(true),
  password: z.string().min(8, "Password must be at least 8 characters"),
  isActive: z.boolean().default(true),
  supportsTLS: z.boolean().default(true),
  maxSendRate: z.string().min(1, "Max send rate is required"),
  documentation: z.string().url("Must be a valid URL"),
});

export type SMTPConfig = z.infer<typeof formSchema>;
