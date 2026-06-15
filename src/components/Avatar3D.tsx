// @ts-nocheck
"use client";

import dynamic from "next/dynamic";
import { isProceduralAvatar } from "@/lib/avatar/types";
import type { AvatarConfig } from "@/lib/avatar/types";

const AvatarFigure = dynamic(
  () => import("./AvatarFigure").then((m) => ({ default: m.AvatarFigure })),
  { ssr: false, loading: () => <div className="h-20 w-20 animate-pulse rounded-full bg-[var(--bg-elevated)]" /> }
);

const AvatarGLTF = dynamic(
  () => import("./AvatarGLTF").then((m) => ({ default: m.AvatarGLTF })),
  { ssr: false, loading: () => <div className="h-20 w-20 animate-pulse rounded-full bg-[var(--bg-elevated)]" /> }
);

interface Avatar3DProps {
  modelUrl: string;
  avatarConfig?: AvatarConfig | null;
  equipped?: Record<string, string>;
  size?: "small" | "full";
  animate?: boolean;
}

export function Avatar3D({
  modelUrl,
  avatarConfig,
  equipped = {},
  size = "full",
  animate = true,
}: Avatar3DProps) {
  if (isProceduralAvatar(modelUrl)) {
    return (
      <AvatarFigure
        config={avatarConfig}
        equipped={equipped}
        size={size}
        animate={animate}
      />
    );
  }

  return (
    <AvatarGLTF modelUrl={modelUrl} size={size} animate={animate} />
  );
}
