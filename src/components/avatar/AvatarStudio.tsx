"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PhotoCropper } from "./PhotoCropper";
import {
  AvatarStageCanvas,
  type StageCaptureHandle,
} from "./AvatarStageCanvas";
import {
  PROFILE_POSES,
  STUDIO_BACKGROUNDS,
  type ProfilePose,
} from "@/lib/avatar/studio";
import {
  getAppearanceFromConfig,
  getEquippedFromConfig,
} from "@/lib/avatar/types";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { ProfileAvatar } from "@/components/ProfileAvatar";

interface AvatarStudioProps {
  avatarConfig: Record<string, unknown>;
  ownedIds: string[];
  username: string;
  currentAvatarUrl?: string | null;
}

export function AvatarStudio({
  avatarConfig,
  ownedIds,
  username,
  currentAvatarUrl,
}: AvatarStudioProps) {
  const router = useRouter();
  const setProfile = useUserStore((s) => s.setProfile);
  const profile = useUserStore((s) => s.profile);

  const appearance = getAppearanceFromConfig(avatarConfig);
  const equipped = getEquippedFromConfig(avatarConfig);

  const [pose, setPose] = useState<ProfilePose>("default");
  const [backgroundId, setBackgroundId] = useState(
    equipped.background && STUDIO_BACKGROUNDS[equipped.background]
      ? equipped.background
      : "default"
  );
  const [flashing, setFlashing] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cropped, setCropped] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [error, setError] = useState("");
  const stageRef = useRef<StageCaptureHandle>(null);

  const ownedBackgrounds = Object.values(STUDIO_BACKGROUNDS).filter(
    (bg) => bg.id === "default" || ownedIds.includes(bg.id)
  );

  async function takePhoto() {
    setError("");
    setFlashing(true);
    await new Promise((r) => setTimeout(r, 120));
    const dataUrl = stageRef.current?.capture();
    await new Promise((r) => setTimeout(r, 180));
    setFlashing(false);
    if (!dataUrl) {
      setError("Could not capture photo. Try again.");
      return;
    }
    setCaptured(dataUrl);
    setCropped(null);
  }

  async function savePhoto() {
    if (!cropped) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/avatar/photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: cropped,
        pose,
        background: backgroundId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      setSaving(false);
      setConfirmSave(false);
      return;
    }
    if (profile) {
      setProfile({ ...profile, avatar_url: data.avatar_url });
    }
    setConfirmSave(false);
    setSaving(false);
    setCaptured(null);
    setCropped(null);
    router.refresh();
  }

  if (cropped) {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-4">
          <p className="section-label">Your new profile icon</p>
          <ProfileAvatar avatarUrl={cropped} username={username} size="xl" ring />
          <p className="text-center text-sm text-[var(--text-secondary)]">
            This is how you&apos;ll appear on battles, leaderboards, and the
            header.
          </p>
        </div>
        <div className="space-y-4">
          <Button
            type="button"
            className="w-full"
            onClick={() => setConfirmSave(true)}
            disabled={saving}
          >
            Save profile icon
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setCropped(null)}
          >
            Back to crop
          </Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <ConfirmDialog
            open={confirmSave}
            title="Set as profile icon?"
            description="This replaces your current profile photo everywhere on HypeRank."
            confirmLabel="Save icon"
            loading={saving}
            onConfirm={savePhoto}
            onCancel={() => setConfirmSave(false)}
          />
        </div>
      </div>
    );
  }

  if (captured) {
    return (
      <PhotoCropper
        imageSrc={captured}
        onCancel={() => setCaptured(null)}
        onConfirm={setCropped}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="relative">
        <div className="relative aspect-[4/5] max-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
          <AvatarStageCanvas
            ref={stageRef}
            config={appearance}
            equipped={equipped}
            pose={pose}
            backgroundId={backgroundId}
          />

          {/* Viewfinder overlay */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-4 rounded-lg border-2 border-white/25" />
            <div className="absolute left-4 right-4 top-1/2 h-px bg-white/10" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] text-white/50">
              <span>HYPERANK STUDIO</span>
              <span>POSE: {pose.toUpperCase()}</span>
            </div>
            <div className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-red-500/60" />
            <div className="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-red-500/60" />
            <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-red-500/60" />
            <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-red-500/60" />
          </div>

          <AnimatePresence>
            {flashing && (
              <motion.div
                className="absolute inset-0 z-20 bg-white"
                initial={{ opacity: 0.95 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="lg"
            className="gap-2"
            onClick={takePhoto}
            disabled={flashing}
          >
            <span className="text-lg">📸</span>
            Take photo
          </Button>
          {currentAvatarUrl && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span>Current:</span>
              <ProfileAvatar
                avatarUrl={currentAvatarUrl}
                username={username}
                size="sm"
              />
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <div className="space-y-6">
        <div>
          <p className="section-label mb-2">Pose</p>
          <div className="grid grid-cols-2 gap-2">
            {PROFILE_POSES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPose(p.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  pose === p.id
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className="text-xl">{p.emoji}</span>
                <p className="mt-1 text-sm font-medium">{p.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-2">Background</p>
          <div className="space-y-2">
            {ownedBackgrounds.map((bg) => (
              <button
                key={bg.id}
                type="button"
                onClick={() => setBackgroundId(bg.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                  backgroundId === bg.id
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div
                  className="h-10 w-10 shrink-0 rounded-lg ring-1 ring-white/10"
                  style={{
                    background: `linear-gradient(160deg, ${bg.wall}, ${bg.accent})`,
                  }}
                />
                <div>
                  <p className="text-sm font-medium">{bg.label}</p>
                  {bg.id !== "default" && !ownedIds.includes(bg.id) && (
                    <Badge variant="outline" className="mt-0.5 text-[10px]">
                      Locked
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Unlock more backgrounds in the shop or locker.
          </p>
        </div>
      </div>
    </div>
  );
}
