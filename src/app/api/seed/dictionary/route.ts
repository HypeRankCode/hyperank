import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import trendsSeed from "../../../../../public/trends.json";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  let dictCount = 0;

  for (const t of trendsSeed) {
    const term = (t as { label?: string }).label ?? t.name;
    const { error } = await admin.from("dictionary").upsert(
      {
        term: term.toLowerCase(),
        definition: t.description,
        example_usage: `That's so ${term.toLowerCase()}.`,
      },
      { onConflict: "term" }
    );
    if (!error) dictCount++;
  }

  return NextResponse.json({ ok: true, dictionary: dictCount });
}
