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
    <div className="flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 font-mono text-sm text-gold">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
      <span className="font-semibold">{credits.toLocaleString()}</span>
    </div>
  );
}
