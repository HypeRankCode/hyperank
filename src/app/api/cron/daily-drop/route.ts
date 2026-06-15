import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { calcHypeScore, slugify } from "@/lib/hype-score";
import { verifyCron } from "@/lib/cron/verify";
import trendsSeed from "../../../../../public/trends.json";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const today = new Date().toISOString().split("T")[0];

  await admin.from("trends").update({ is_daily_drop: false }).neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: allTrends } = await admin
    .from("trends")
    .select("id")
    .eq("status", "active");

  if (!allTrends?.length) {
    for (const t of trendsSeed) {
      const slug = slugify(t.name);
      const hype = t.fire ?? 0;
      const dead = t.dead ?? 0;
      await admin.from("trends").upsert(
        {
          slug,
          name: t.label ?? t.name,
          description: t.description,
          hype_votes: hype,
          dead_votes: dead,
          hype_score: calcHypeScore(hype, dead),
          status: "active",
        },
        { onConflict: "slug" }
      );
    }
  }

  const { data: trends } = await admin
    .from("trends")
    .select("id")
    .eq("status", "active")
    .order("vote_velocity", { ascending: false })
    .limit(20);

  const shuffled = (trends ?? []).sort(() => Math.random() - 0.5).slice(0, 5);

  for (const t of shuffled) {
    await admin
      .from("trends")
      .update({ is_daily_drop: true, daily_drop_date: today })
      .eq("id", t.id);
  }

  return NextResponse.json({ ok: true, daily_drop_count: shuffled.length });
}
