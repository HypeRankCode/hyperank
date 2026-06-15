"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Zap } from "lucide-react";

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
        .single()
        .then(({ data }) => {
          if (data) setCredits(data.credits);
        });
    });
  }, []);

  if (credits === null) return null;

  return (
    <div className="flex items-center gap-1 font-mono text-sm text-gold">
      <Zap className="h-4 w-4" />
      <span>{credits}</span>
    </div>
  );
}
