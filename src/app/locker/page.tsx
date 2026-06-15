import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CosmeticsLocker } from "@/components/CosmeticsLocker";
import { RPMEditor } from "@/components/RPMEditor";

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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Your Locker</h1>

      {!profile.avatar_rpm_url ? (
        <div className="mt-8">
          <p className="mb-4 text-[var(--text-secondary)]">
            You haven&apos;t built your character yet.
          </p>
          <RPMEditor userId={user.id} />
        </div>
      ) : (
        <div className="mt-8">
          <CosmeticsLocker
            cosmetics={cosmetics ?? []}
            ownedIds={profile.owned_cosmetic_ids ?? []}
            equipped={(profile.avatar_config as Record<string, string>) ?? {}}
            modelUrl={profile.avatar_rpm_url}
          />
          <div className="mt-8">
            <RPMEditor userId={user.id} />
          </div>
        </div>
      )}
    </div>
  );
}
