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
    <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 font-mono text-xs text-[var(--accent-gold)]">
      <span className="text-[var(--text-secondary)]">Credits</span>
      <span className="font-medium tabular-nums">{credits.toLocaleString()}</span>
    </div>
  );
}
