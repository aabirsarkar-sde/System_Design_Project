import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthenticatedUser } from "@/lib/api/types";

const SESSION_COOKIE_NAME = "campus_session";

function getSessionSecret(): string {
  const value = process.env.SESSION_SECRET?.trim();

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV !== "production") {
    return "development-session-secret-change-me";
  }

  throw new Error("Missing required environment variable: SESSION_SECRET");
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

export function createSessionCookieValue(user: AuthenticatedUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

function verifySignature(payload: string, signature: string): boolean {
  const expected = signPayload(payload);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

function decodeSessionCookie(value: string): AuthenticatedUser | null {
  const [payload, signature] = value.split(".");

  if (!payload || !signature || !verifySignature(payload, signature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<AuthenticatedUser>;

    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.role !== "string" ||
      typeof parsed.avatarUrl !== "string"
    ) {
      return null;
    }

    return {
      userId: parsed.userId,
      enrollmentNumber:
        typeof parsed.enrollmentNumber === "string"
          ? parsed.enrollmentNumber
          : null,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      avatarUrl: parsed.avatarUrl,
      seatNumber:
        typeof parsed.seatNumber === "number" ? parsed.seatNumber : null,
      classroomNumber:
        typeof parsed.classroomNumber === "string"
          ? parsed.classroomNumber
          : null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  return decodeSessionCookie(sessionCookie);
}

export async function requireSession(): Promise<AuthenticatedUser> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
