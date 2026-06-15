import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CosmeticsLocker } from "@/components/CosmeticsLocker";
import { AvatarBuilder } from "@/components/AvatarBuilder";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { BackLink } from "@/components/BackLink";
import { Badge } from "@/components/ui/badge";
import {
  getAppearanceFromConfig,
  getEquippedFromConfig,
  hasBuiltAvatar,
} from "@/lib/avatar/types";

export const metadata = { title: "Your Locker | HypeRank" };

export default async function LockerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const { data: cosmetics } = await supabase.from("cosmetics").select("*");

  const rawConfig = (profile.avatar_config as Record<string, unknown>) ?? {};
  const built = hasBuiltAvatar(profile.avatar_rpm_url, rawConfig);
  const equipped = getEquippedFromConfig(rawConfig);
  const appearance = getAppearanceFromConfig(rawConfig);

  return (
    <PageShell wide>
      <BackLink href="/dashboard" label="Dashboard" />
      <SectionHeader
        className="mt-4"
        label="Avatar"
        title="Your Locker"
        subtitle="Build your character. Equip cosmetics. Flex."
        action={<Badge variant="hype">{profile.username}</Badge>}
      />

      {!built ? (
        <div className="surface-card rounded-2xl p-8">
          <p className="mb-6 text-[var(--text-secondary)]">
            You haven&apos;t built your character yet. Customize below — no
            external account needed.
          </p>
          <AvatarBuilder initialConfig={appearance} />
        </div>
      ) : (
        <div className="space-y-8">
          <CosmeticsLocker
            cosmetics={cosmetics ?? []}
            ownedIds={profile.owned_cosmetic_ids ?? []}
            equipped={equipped}
            modelUrl={profile.avatar_rpm_url ?? ""}
            avatarConfig={rawConfig}
          />
          <div className="surface-card rounded-2xl p-8">
            <h3 className="font-display text-lg font-bold">Edit appearance</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Skin, hair, body type — cosmetics stay equipped in the locker
              above.
            </p>
            <div className="mt-4">
              <AvatarBuilder initialConfig={appearance} />
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
