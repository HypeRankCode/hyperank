"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import type { Profile } from "@/lib/types/database";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const setProfile = useUserStore((s) => s.setProfile);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) return;
          if (data) setProfile(data as Profile);
        });
    });
  }, [setProfile]);

  return <>{children}</>;
}
