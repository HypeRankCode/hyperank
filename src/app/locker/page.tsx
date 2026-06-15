import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CosmeticsLocker } from "@/components/CosmeticsLocker";
import { RPMEditor } from "@/components/RPMEditor";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";

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

  return (
    <PageShell wide>
      <SectionHeader
        label="Avatar"
        title="Your Locker"
        subtitle="Build your character. Equip cosmetics. Flex."
        action={
          <Badge variant="hype">{profile.username}</Badge>
        }
      />

      {!profile.avatar_rpm_url ? (
        <div className="surface-card rounded-2xl p-8">
          <p className="mb-6 text-[var(--text-secondary)]">
            You haven&apos;t built your character yet. Time to fix that.
          </p>
          <RPMEditor userId={user.id} />
        </div>
      ) : (
        <div className="space-y-8">
          <CosmeticsLocker
            cosmetics={cosmetics ?? []}
            ownedIds={profile.owned_cosmetic_ids ?? []}
            equipped={(profile.avatar_config as Record<string, string>) ?? {}}
            modelUrl={profile.avatar_rpm_url}
          />
          <div className="surface-card rounded-2xl p-8">
            <h3 className="font-display text-lg font-bold">Edit avatar</h3>
            <div className="mt-4">
              <RPMEditor userId={user.id} />
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
