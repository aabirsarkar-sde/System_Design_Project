import { NextRequest, NextResponse } from "next/server";
import type {
  LoginRequestPayload,
  LoginResponse,
} from "@/lib/api/types";
import {
  createSessionCookieValue,
  getSessionCookieName,
} from "@/lib/auth/session";
import { getBackendApiBaseUrl } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as LoginRequestPayload;
    const response = await fetch(`${getBackendApiBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => ({
      message: "Sign in failed",
    }))) as LoginResponse | { message?: string };

    if (!response.ok || !("user" in data)) {
      const errorMessage =
        "message" in data && typeof data.message === "string"
          ? data.message
          : "Unable to sign in right now.";

      return NextResponse.json(
        { message: errorMessage },
        { status: response.status || 500 },
      );
    }

    const result = NextResponse.json(data, { status: 200 });
    result.cookies.set({
      name: getSessionCookieName(),
      value: createSessionCookieValue(data.user),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return result;
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the backend service right now." },
      { status: 502 },
    );
  }
}
