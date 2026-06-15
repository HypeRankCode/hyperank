import { NextResponse } from "next/server";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiOk<T extends Record<string, unknown>>(data: T) {
  return NextResponse.json(data);
}
