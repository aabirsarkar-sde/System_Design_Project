import { NextResponse } from "next/server";
import { getBackendApiBaseUrl } from "@/lib/env";
import { getSession } from "@/lib/auth/session";

export async function GET(): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const response = await fetch(
    `${getBackendApiBaseUrl()}/api/notifications?userId=${encodeURIComponent(session.userId)}`,
    { cache: "no-store" },
  );

  const data = await response.json().catch(() => ({ message: "Request failed" }));
  return NextResponse.json(data, { status: response.status });
}
