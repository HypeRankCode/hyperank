import { Avatar3D } from "./Avatar3DClient";
import { ProfileAvatar } from "./ProfileAvatar";
import { SocialLinksBar } from "./SocialLinksBar";
import { Badge } from "./ui/badge";
import type { Profile } from "@/lib/types/database";
import {
  getAppearanceFromConfig,
  getEquippedFromConfig,
} from "@/lib/avatar/types";
import { STUDIO_BACKGROUNDS } from "@/lib/avatar/studio";

export function ProfileHero({ profile }: { profile: Profile }) {
  const rawConfig = (profile.avatar_config as Record<string, unknown>) ?? {};
  const equipped = getEquippedFromConfig(rawConfig);
  const bgId =
    equipped.background && STUDIO_BACKGROUNDS[equipped.background]
      ? equipped.background
      : typeof rawConfig.background === "string" &&
          STUDIO_BACKGROUNDS[rawConfig.background]
        ? rawConfig.background
        : "default";
  const studioBg = STUDIO_BACKGROUNDS[bgId] ?? STUDIO_BACKGROUNDS.default;

  return (
    <section
      className="relative overflow-hidden rounded-xl border border-[var(--border)] p-6"
      style={{
        background: `linear-gradient(180deg, ${studioBg.wall}ee 0%, var(--bg-card) 70%)`,
        boxShadow: `inset 0 0 0 1px ${studioBg.accent}22`,
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative flex min-h-[400px] items-center justify-center md:min-h-[420px]">
          <Avatar3D
            modelUrl={profile.avatar_rpm_url ?? ""}
            avatarConfig={getAppearanceFromConfig(rawConfig)}
            equipped={equipped}
            size="full"
          />
          {profile.avatar_url && (
            <div
              className="absolute bottom-3 right-3 md:bottom-4 md:right-4"
              title="Profile icon"
            >
              <ProfileAvatar
                avatarUrl={profile.avatar_url}
                username={profile.username}
                size="sm"
                ring
                className="h-14 w-14 shadow-lg shadow-black/50 ring-offset-[var(--bg-card)]"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-3xl font-bold">
            {profile.display_name ?? profile.username}
          </h1>
          <p className="text-[var(--text-secondary)]">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-sm">{profile.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.is_creator && (
              <Badge variant="gold">Creator</Badge>
            )}
            {profile.badge_ids?.slice(0, 5).map((b) => (
              <Badge key={b} variant="outline">
                {b}
              </Badge>
            ))}
          </div>
          <div className="mt-4">
            <SocialLinksBar profile={profile} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 font-mono text-sm">
            <div>
              <p className="text-gold">{profile.credits}</p>
              <p className="text-[var(--text-secondary)]">credits</p>
            </div>
            <div>
              <p className="text-neon">{profile.streak_days}</p>
              <p className="text-[var(--text-secondary)]">streak</p>
            </div>
            <div>
              <p>{profile.hype_score}%</p>
              <p className="text-[var(--text-secondary)]">hype score</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
