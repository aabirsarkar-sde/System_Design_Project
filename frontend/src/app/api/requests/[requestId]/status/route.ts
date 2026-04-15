import { NextRequest, NextResponse } from "next/server";
import { getBackendApiBaseUrl } from "@/lib/env";
import { getSession } from "@/lib/auth/session";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> },
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const { requestId } = await context.params;
  const payload = await request.json();

  const response = await fetch(
    `${getBackendApiBaseUrl()}/api/requests/${encodeURIComponent(requestId)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  const data = await response.json().catch(() => ({ message: "Request failed" }));
  return NextResponse.json(data, { status: response.status });
}
