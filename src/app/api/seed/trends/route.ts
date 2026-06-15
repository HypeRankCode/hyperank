import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { calcHypeScore, slugify } from "@/lib/hype-score";
import trendsSeed from "../../../../../public/trends.json";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  let inserted = 0;

  for (const t of trendsSeed) {
    const slug = slugify(t.name);
    const hype = (t as { fire?: number }).fire ?? 0;
    const dead = (t as { dead?: number }).dead ?? 0;

    const { error } = await admin.from("trends").upsert(
      {
        slug,
        name: (t as { label?: string }).label ?? t.name,
        description: t.description,
        hype_votes: hype,
        dead_votes: dead,
        hype_score: calcHypeScore(hype, dead),
        status: "active",
        category: "general",
      },
      { onConflict: "slug" }
    );

    if (!error) inserted++;
  }

  return NextResponse.json({ ok: true, seeded: inserted });
}
