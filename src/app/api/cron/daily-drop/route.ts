import { NextResponse } from "next/server";
import { verifyCron } from "@/lib/cron/verify";
import { runDailyDrop } from "@/lib/cron/tasks";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;
  const result = await runDailyDrop();
  return NextResponse.json({ ok: true, ...result });
}
