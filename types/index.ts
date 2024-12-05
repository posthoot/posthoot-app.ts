export enum SmtpProvider {
  GMAIL = "gmail",
  SENDGRID = "sendgrid",
  CUSTOM = "custom",
}

export interface SmtpConfig {
  id: string;
  provider: SmtpProvider;
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  isDefault: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  html?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  expiresAt?: Date;
} 