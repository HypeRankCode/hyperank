"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { BackLink } from "@/components/BackLink";
import { PageShell, SectionHeader } from "@/components/PageShell";

const AvatarStudio = dynamic(
  () =>
    import("@/components/avatar/AvatarStudio").then((m) => ({
      default: m.AvatarStudio,
    })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-2xl bg-white/5" /> }
);

export default function ProfilePhotoPage() {
  const [data, setData] = useState<{
    avatarConfig: Record<string, unknown>;
    ownedIds: string[];
    username: string;
    avatarUrl: string | null;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("username, avatar_url, avatar_config, owned_cosmetic_ids")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data: p }) => {
          if (!p) return;
          setData({
            avatarConfig: (p.avatar_config as Record<string, unknown>) ?? {},
            ownedIds: p.owned_cosmetic_ids ?? [],
            username: p.username,
            avatarUrl: p.avatar_url,
          });
        });
    });
  }, []);

  return (
    <PageShell wide>
      <BackLink href="/settings" label="Settings" />
      <SectionHeader
        className="mt-4"
        label="Profile"
        title="Photo Studio"
        subtitle="Strike a pose on the mini stage. Snap your icon — used everywhere on HypeRank."
      />
      {data ? (
        <AvatarStudio
          avatarConfig={data.avatarConfig}
          ownedIds={data.ownedIds}
          username={data.username}
          currentAvatarUrl={data.avatarUrl}
        />
      ) : (
        <div className="h-96 animate-pulse rounded-2xl bg-white/5" />
      )}
    </PageShell>
  );
}
