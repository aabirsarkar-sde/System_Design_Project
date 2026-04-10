import { NextRequest, NextResponse } from "next/server";
import { getBackendApiBaseUrl } from "@/lib/env";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const response = await fetch(`${getBackendApiBaseUrl()}/api/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({ message: "Request failed" }));
  return NextResponse.json(data, { status: response.status });
}
