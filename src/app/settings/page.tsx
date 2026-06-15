import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Badge } from "@/components/ui/badge";
import {
  SettingsLinkCard,
  SettingsSection,
} from "@/components/settings/SettingsLinkCard";

function countVerifiedSocials(verified: Record<string, boolean> | null) {
  if (!verified) return 0;
  return Object.values(verified).filter(Boolean).length;
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "username, display_name, bio, avatar_url, credits, streak_days, hype_score, is_public, owned_cosmetic_ids, social_verified"
    )
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const verifiedSocials = countVerifiedSocials(
    profile.social_verified as Record<string, boolean> | null
  );
  const cosmeticCount = profile.owned_cosmetic_ids?.length ?? 0;

  return (
    <PageShell>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="hype" className="mb-3">
            Account
          </Badge>
          <h1 className="font-display text-4xl font-extrabold">Settings</h1>
          <p className="mt-2 max-w-xl text-[var(--text-secondary)]">
            Your look, your links, your privacy — everything that makes your
            HypeRank profile yours.
          </p>
        </div>
        <Link href={`/u/${profile.username}`} className="btn-ghost-glow text-sm">
          View public profile →
        </Link>
      </div>

      <div className="surface-card mb-10 overflow-hidden rounded-2xl">
        <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <ProfileAvatar
            avatarUrl={profile.avatar_url}
            username={profile.username}
            size="lg"
            ring
          />
          <div className="min-w-0">
            <p className="font-display text-2xl font-bold">
              {profile.display_name ?? profile.username}
            </p>
            <p className="text-[var(--text-secondary)]">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]">
                {profile.bio}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={profile.is_public ? "outline" : "gold"}>
                {profile.is_public ? "Public profile" : "Private profile"}
              </Badge>
              {cosmeticCount > 0 && (
                <Badge variant="outline">
                  {cosmeticCount} cosmetic{cosmeticCount === 1 ? "" : "s"}
                </Badge>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 font-mono text-sm md:text-right">
            <div>
              <p className="text-gold">{profile.credits.toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">
                credits
              </p>
            </div>
            <div>
              <p className="text-neon">{profile.streak_days}</p>
              <p className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">
                streak
              </p>
            </div>
            <div>
              <p>{profile.hype_score}%</p>
              <p className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">
                hype
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <div>
          <SectionHeader
            label="Customize"
            title="Your look"
            subtitle="Avatar, photo icon, and equipped cosmetics."
            className="mb-4"
          />
          <SettingsSection>
            <SettingsLinkCard
              href="/settings/profile-photo"
              icon="camera"
              title="Photo Studio"
              description="Strike a pose, crop your shot, and set your profile icon."
              meta={profile.avatar_url ? "Icon set" : "No icon"}
            />
            <SettingsLinkCard
              href="/settings/avatar"
              icon="avatar"
              title="Avatar Builder"
              description="Skin tone, hair, body type, and face shape for your 3D character."
            />
            <SettingsLinkCard
              href="/locker"
              icon="locker"
              title="Locker"
              description="Try on outfits, backgrounds, and effects. Equip what you own."
              meta={`${cosmeticCount} owned`}
            />
          </SettingsSection>
        </div>

        <div>
          <SectionHeader
            label="Identity"
            title="Profile & privacy"
            subtitle="Who can see you and where you're linked."
            className="mb-4"
          />
          <SettingsSection>
            <SettingsLinkCard
              href="/settings/social"
              icon="social"
              title="Social accounts"
              description="Link and verify Twitter, TikTok, Instagram, YouTube, and Twitch."
              meta={
                verifiedSocials > 0
                  ? `${verifiedSocials} verified`
                  : "Not linked"
              }
            />
            <SettingsLinkCard
              href="/settings/privacy"
              icon="privacy"
              title="Privacy"
              description="Control whether your profile is visible to everyone on HypeRank."
              meta={profile.is_public ? "Public" : "Private"}
            />
          </SettingsSection>
        </div>

        <div>
          <SectionHeader
            label="Shortcuts"
            title="Quick links"
            className="mb-4"
          />
          <SettingsSection>
            <SettingsLinkCard
              href={`/u/${profile.username}`}
              icon="profile"
              title="Public profile"
              description="See how others view your page — stats, votes, and your 3D avatar."
            />
            <SettingsLinkCard
              href="/dashboard"
              icon="dashboard"
              title="Dashboard"
              description="Streak, credits, predictions, and quick nav to the rest of the app."
            />
          </SettingsSection>
        </div>
      </div>
    </PageShell>
  );
}
