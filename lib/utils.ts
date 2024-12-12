import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function isEmpty(value: string | undefined | null | boolean): boolean {
  if (typeof value === "boolean") {
    return !value;
  }
  return (
    !value ||
    value === undefined ||
    value === null ||
    value === "" ||
    value.length === 0
  );
}

export function extractVariables(html: string): string[] {
  const regex = /{{([^}]+)}}/g;
  const variables = new Set<string>();
  let match;
  while ((match = regex.exec(html)) !== null) {
    variables.add(match[1].trim());
  }
  return Array.from(variables);
}

export function removeUndefined<T>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => !isEmpty(v))
  ) as T;
}

export function createJwtFromSecret(
  payload: Record<string, string>,
  secret: string
) {
  const jwt = require("jsonwebtoken");
  return jwt.sign(payload, secret);
}
