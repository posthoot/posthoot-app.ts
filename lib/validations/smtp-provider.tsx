import { z } from "zod";

export const formSchema = z.object({
  id: z.string().optional(),
  provider: z.string(),
  host: z.string().min(1, "Host is required"),
  port: z.string().regex(/^\d+$/, "Port must be a number"),
  username: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  isActive: z.boolean().default(true),
});

export type SMTPConfig = z.infer<typeof formSchema>;
