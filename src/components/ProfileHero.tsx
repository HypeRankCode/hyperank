import { Avatar3D } from "./Avatar3DClient";
import { SocialLinksBar } from "./SocialLinksBar";
import { Badge } from "./ui/badge";
import type { Profile } from "@/lib/types/database";
import {
  getAppearanceFromConfig,
  getEquippedFromConfig,
} from "@/lib/avatar/types";

export function ProfileHero({ profile }: { profile: Profile }) {
  const rawConfig = (profile.avatar_config as Record<string, unknown>) ?? {};
  const bg =
    getEquippedFromConfig(rawConfig).background ??
    (typeof rawConfig.background === "string" ? rawConfig.background : "default");

  return (
    <section
      className={`relative overflow-hidden rounded-xl border border-[var(--border)] p-6 ${
        bg === "bg_neon_city"
          ? "bg-gradient-to-b from-purple-900/40 to-[var(--bg-card)]"
          : bg === "bg_space"
            ? "bg-gradient-to-b from-indigo-950/60 to-[var(--bg-card)]"
            : "bg-[var(--bg-card)]"
      }`}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Avatar3D
          modelUrl={profile.avatar_rpm_url ?? ""}
          avatarConfig={getAppearanceFromConfig(rawConfig)}
          equipped={getEquippedFromConfig(rawConfig)}
          size="full"
        />
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
