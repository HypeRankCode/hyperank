"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AvatarBuilder } from "@/components/AvatarBuilder";
import { BackLink } from "@/components/BackLink";
import { getAppearanceFromConfig } from "@/lib/avatar/types";

export default function AvatarSettingsPage() {
  const [appearance, setAppearance] = useState<ReturnType<
    typeof getAppearanceFromConfig
  > | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("avatar_config")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setAppearance(
            getAppearanceFromConfig(
              (data?.avatar_config as Record<string, unknown>) ?? null
            )
          );
        });
    });
  }, []);

  if (!appearance) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <BackLink href="/settings" label="Settings" />
      <h1 className="mt-4 font-display text-2xl font-bold">Avatar</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Customize your HypeRank character. Ready Player Me is no longer
        available — we use a built-in avatar system now.
      </p>
      <div className="mt-6">
        <AvatarBuilder initialConfig={appearance} />
      </div>
    </div>
  );
}
