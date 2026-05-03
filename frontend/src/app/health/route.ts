import { NextResponse } from "next/server";

/** Plain GET helper — if this works but HTML routes are blank, the issue is app/React/Turbo, not the port. */
export function GET() {
  return new NextResponse("ok", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
