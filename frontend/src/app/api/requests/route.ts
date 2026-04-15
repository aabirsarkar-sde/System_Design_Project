import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getBackendApiBaseUrl } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const payload = await request.json();
    const response = await fetch(`${getBackendApiBaseUrl()}/api/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        userId: session.userId,
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({ message: "Request failed" }));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the backend service right now." },
      { status: 502 },
    );
  }
}
