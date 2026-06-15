import { ExternalLink } from "lucide-react";
import type { Profile } from "@/lib/types/database";

const platforms = [
  { key: "twitter", field: "social_twitter" as const, label: "X", base: "https://x.com/" },
  { key: "tiktok", field: "social_tiktok" as const, label: "TT", base: "https://tiktok.com/@" },
  { key: "instagram", field: "social_instagram" as const, label: "IG", base: "https://instagram.com/" },
  { key: "youtube", field: "social_youtube" as const, label: "YT", base: "https://youtube.com/@" },
  { key: "twitch", field: "social_twitch" as const, label: "TW", base: "https://twitch.tv/" },
];

export function SocialLinksBar({ profile }: { profile: Profile }) {
  const verified = profile.social_verified ?? {};

  return (
    <div className="flex gap-2">
      {platforms.map(({ key, field, label, base }) => {
        const handle = profile[field];
        if (!handle) return null;
        const isVerified = verified[key];
        return (
          <a
            key={key}
            href={`${base}${handle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${
              isVerified
                ? "border-hype text-hype"
                : "border-[var(--border)] text-[var(--text-secondary)]"
            }`}
            title={handle}
          >
            {label}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      })}
    </div>
  );
}
