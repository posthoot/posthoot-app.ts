import { auth } from "@/auth";
import { APIService } from "@/lib/services/api";
import { NextResponse } from "next/server";

interface IMAPFolder {
  Name: string;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const configId = searchParams.get("configId");

  const apiService = new APIService("imap", session);
  const folders = await apiService.get<IMAPFolder[]>(
    `folders${configId ? `?config_id=${configId}` : ""}`
  );
  return NextResponse.json({ folders });
}
