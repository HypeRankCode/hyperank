"use client";

import dynamic from "next/dynamic";

export const Avatar3D = dynamic(
  () => import("./Avatar3D").then((m) => ({ default: m.Avatar3D })),
  { ssr: false, loading: () => <div className="h-20 w-20 animate-pulse rounded-full bg-[var(--bg-elevated)]" /> }
);
