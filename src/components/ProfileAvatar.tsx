import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZE_MAP = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-10 w-10 text-xs",
  md: "h-16 w-16 text-sm",
  lg: "h-24 w-24 text-xl",
  xl: "h-32 w-32 text-2xl",
} as const;

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  username?: string | null;
  size?: keyof typeof SIZE_MAP;
  className?: string;
  ring?: boolean;
}

export function ProfileAvatar({
  avatarUrl,
  username,
  size = "sm",
  className,
  ring = false,
}: ProfileAvatarProps) {
  const initial = username?.[0]?.toUpperCase() ?? "?";
  const sizeClass = SIZE_MAP[size];

  if (avatarUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-[#0a0a0a]",
          sizeClass,
          ring && "ring-2 ring-red-500/40 ring-offset-2 ring-offset-black",
          className
        )}
      >
        <Image
          src={avatarUrl}
          alt={username ? `${username}'s profile` : "Profile"}
          fill
          className="object-cover object-center"
          sizes={size === "lg" || size === "xl" ? "128px" : "48px"}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-900 font-bold text-white",
        sizeClass,
        ring && "ring-2 ring-red-500/40 ring-offset-2 ring-offset-black",
        className
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
