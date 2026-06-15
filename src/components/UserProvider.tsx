"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import type { Profile } from "@/lib/types/database";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((s) => s.setUser);
  const setProfile = useUserStore((s) => s.setProfile);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile(userId: string) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) return;
      setProfile(data ? (data as Profile) : null);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setUser(user);
      if (user) loadProfile(user.id);
      else setProfile(null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUser(user);
      if (user) loadProfile(user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile]);

  return <>{children}</>;
}
