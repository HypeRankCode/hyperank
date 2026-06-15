import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyCron } from "@/lib/cron/verify";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const { data: trends } = await admin
    .from("trends")
    .select("id, vote_velocity, hype_score")
    .eq("status", "active")
    .order("vote_velocity", { ascending: false });

  const sorted = trends ?? [];
  const riser = sorted[0]?.id;
  const faller = [...sorted].sort((a, b) => a.vote_velocity - b.vote_velocity)[0]?.id;
  const controversial = [...sorted].sort(
    (a, b) => Math.abs(a.hype_score - 50) - Math.abs(b.hype_score - 50)
  )[0]?.id;

  await admin.from("weekly_reports").insert({
    week_start: weekStart.toISOString().split("T")[0],
    week_end: new Date().toISOString().split("T")[0],
    biggest_riser_id: riser,
    biggest_faller_id: faller,
    most_controversial_id: controversial,
    report_data: { generated: true },
  });

  return NextResponse.json({ ok: true });
}
