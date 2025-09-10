import { NextRequest, NextResponse } from "next/server";

const ok = (method: string, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ status: "ok", method, ...extra }, { status: 200 });

export function GET(_: NextRequest) {
  return ok("GET");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  return ok("POST", body ? { received: body } : {});
}

export async function PUT(_: NextRequest) {
  return ok("PUT");
}

export async function PATCH(_: NextRequest) {
  return ok("PATCH");
}

export async function DELETE(_: NextRequest) {
  return ok("DELETE");
}
