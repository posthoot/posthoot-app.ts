import { APIService } from "@/lib/services/api";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { removeUndefined } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 1);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const id = searchParams.get("id") || undefined;
  const sort = searchParams.get("sort") || "sent_at";
  const order = searchParams.get("order") || "desc";
  const apiService = new APIService("emails", session);
  const status = searchParams.get("filter") || "SENT";

  const emails = await apiService.get<{
    data: any[];
  }>(
    "",
    removeUndefined({
      page,
      limit,
      id,
      sort,
      order,
      status,
      exclude: id ? undefined : "body",
    })
  );

  if (id) {
    const email = emails.data?.[0];
    emails.data[0].body = Buffer.from(email.body, "base64").toString("utf-8");
  }

  return NextResponse.json(emails);
}
