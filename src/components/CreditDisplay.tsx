"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function CreditDisplay() {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) return;
          setCredits(data.credits);
        });
    });
  }, []);

  if (credits === null) return null;

  return (
    <div className="group relative">
      <div
        className="flex cursor-default items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 font-mono text-sm text-gold transition-colors group-hover:border-yellow-500/40 group-hover:bg-yellow-500/15"
        aria-describedby="credits-tooltip"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
        <span className="font-semibold">{credits.toLocaleString()}</span>
      </div>
      <div
        id="credits-tooltip"
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#111] p-3 text-xs leading-relaxed text-[var(--text-secondary)] opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
      >
        <p className="font-semibold text-gold">Hype credits</p>
        <p className="mt-1">
          Earn by voting, streaks, and winning auditions. Spend in the shop on
          cosmetics and flex items.
        </p>
      </div>
    </div>
  );
}
