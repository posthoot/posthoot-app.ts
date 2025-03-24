import { SMTPProvider } from "@/types";
import { z } from "zod";

export const formSchema = z.object({
  id: z.string().optional(),
  provider: z.nativeEnum(SMTPProvider),
  host: z.string().min(1, "Host is required"),
  port: z.number(),
  username: z.string(),
  requiresAuth: z.boolean().default(true),
  fromEmail: z.string(),
  password: z.string(),
  isActive: z.boolean().default(true),
  supportsTls: z.boolean().default(true),
  maxSendRate: z.number().min(1, "Max send rate is required"),
  documentation: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type SMTPConfig = z.infer<typeof formSchema>;
