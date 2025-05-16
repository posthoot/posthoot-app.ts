import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { APIService } from "@/lib/services/api";
import { removeUndefined } from "@/lib/utils";

interface IMAPEmail {
  id: string;
  subject: string;
  from: string;
  to: string;
  cc: string;
  bcc: string;
  body: string;
  date: string;
  messageId: string;
  flags: string[] | null;
  attachments: {
    Filename: string;
    Data: string;
  }[];
}

interface IMAPEmailResponse {
  data: IMAPEmail[];
  total_emails: number;
  limit: number;
  offset: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const configId = searchParams.get("configId");
  const folder = searchParams.get("folder");

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // we support pagination
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const to = searchParams.get("to");
  const from = searchParams.get("from");
  const subject = searchParams.get("subject");
  const body = searchParams.get("body");
  const cc = searchParams.get("cc");
  const bcc = searchParams.get("bcc");
  const before = searchParams.get("before");
  const since = searchParams.get("since");
  const offset = page ? parseInt(page) * (limit ? parseInt(limit) : 10) : 0;

  const params = removeUndefined({
    configId,
    folder,
    offset,
    limit,
    to,
    from,
    subject,
    body,
    cc,
    bcc,
    before,
    since,
  });

  let url = `emails`;

  if (Object.keys(params).length > 0) {
    url += `?${new URLSearchParams(params as unknown as Record<string, string>).toString()}`;
  }

  const apiService = new APIService("imap", session);
  const response = await apiService.get<IMAPEmailResponse>(url);
  return NextResponse.json(response);
}
