"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { useRegisterUnsavedChanges } from "@/hooks/useRegisterUnsavedChanges";
import { useUnsavedChangesStore } from "@/stores/useUnsavedChangesStore";
import { PoseIcon } from "./PoseIcon";
import {
  StudioViewControls,
  STUDIO_VIEW_DEFAULT,
  STUDIO_PAN_X_LIMIT,
  STUDIO_PAN_Y_LIMIT,
  type StudioViewState,
} from "./StudioViewControls";
import {
  avatarDragCursorClass,
  avatarDragPointerProps,
  useAvatarDragRotation,
} from "@/hooks/useAvatarDragRotation";

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
  const [view, setView] = useState<StudioViewState>(STUDIO_VIEW_DEFAULT);
  const rotation = useAvatarDragRotation("free");
  const panOrigin = useRef({ panX: 0, panY: 0 });
  const [flashing, setFlashing] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cropped, setCropped] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [error, setError] = useState("");
  const stageRef = useRef<StageCaptureHandle>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const clearUnsaved = useUnsavedChangesStore((s) => s.clear);

  const pointerProps = avatarDragPointerProps(rotation, {
    onPanStart: () => {
      panOrigin.current = { panX: view.panX, panY: view.panY };
    },
    onPanMove: (dx, dy) => {
      setView((prev) => ({
        ...prev,
        panX: Math.max(
          -STUDIO_PAN_X_LIMIT,
          Math.min(STUDIO_PAN_X_LIMIT, panOrigin.current.panX + dx * 0.004)
        ),
        panY: Math.max(
          -STUDIO_PAN_Y_LIMIT,
          Math.min(STUDIO_PAN_Y_LIMIT, panOrigin.current.panY - dy * 0.004)
        ),
      }));
    },
  });

  useRegisterUnsavedChanges(
    Boolean(captured || cropped),
    "You have an unsaved profile photo. Leave the photo booth anyway?"
  );

  const ownedBackgrounds = Object.values(STUDIO_BACKGROUNDS).filter(
    (bg) => bg.id === "default" || ownedIds.includes(bg.id)
  );

  const resetView = useCallback(() => {
    setView(STUDIO_VIEW_DEFAULT);
    rotation.resetRotation();
  }, [rotation]);

  // Trap wheel over the stage so the page doesn't scroll (React onWheel is passive).
  useEffect(() => {
    const el = stageContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

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
    clearUnsaved();
    router.refresh();
  }

  if (cropped) {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-4">
          <p className="section-label">Your new profile icon</p>
          <div className="overflow-hidden rounded-full ring-2 ring-red-500/40 ring-offset-2 ring-offset-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cropped}
              alt="Profile icon preview"
              width={128}
              height={128}
              className="h-32 w-32 object-cover"
            />
          </div>
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
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="relative min-w-0">
        <div
          ref={stageContainerRef}
          className={avatarDragCursorClass(rotation.isDragging) +
            " relative aspect-video w-full touch-none overflow-hidden overscroll-contain rounded-2xl border border-white/10 bg-black shadow-2xl"}
          style={{ touchAction: "none" }}
          {...pointerProps}
        >
          <AvatarStageCanvas
            ref={stageRef}
            config={appearance}
            equipped={equipped}
            pose={pose}
            backgroundId={backgroundId}
            view={view}
            rotation={{ yaw: rotation.yaw, pitch: rotation.pitch }}
          />

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-3 rounded-lg border border-white/20 md:inset-5" />
            <div className="absolute left-3 right-3 top-1/2 h-px bg-white/10 md:left-5 md:right-5" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-white/50 md:bottom-5 md:left-5 md:right-5">
              <span>HYPERANK STUDIO</span>
              <span>POSE: {pose.toUpperCase()}</span>
            </div>
            <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-red-500/60 md:left-5 md:top-5" />
            <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-red-500/60 md:right-5 md:top-5" />
            <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-red-500/60 md:bottom-5 md:left-5" />
            <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-red-500/60 md:right-5 md:bottom-5" />
          </div>

          <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/55 px-2.5 py-1.5 text-[10px] text-white/70 backdrop-blur-sm md:left-5 md:top-5">
            Drag to rotate · Shift+drag to pan · Zoom with controls below
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

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <StudioViewControls
            view={view}
            onChange={setView}
            onReset={resetView}
            className="pointer-events-auto"
          />
          <Button
            type="button"
            size="lg"
            className="gap-2"
            onClick={takePhoto}
            disabled={flashing}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h2l1-2h8l1 2h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            Take photo
          </Button>
        </div>

        {currentAvatarUrl && (
          <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>Current icon:</span>
            <ProfileAvatar
              avatarUrl={currentAvatarUrl}
              username={username}
              size="sm"
            />
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <div className="space-y-6">
        <div>
          <p className="section-label mb-2">Pose</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
            {PROFILE_POSES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPose(p.id)}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                  pose === p.id
                    ? "border-red-500/50 bg-red-500/10 text-white"
                    : "border-white/10 bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white"
                }`}
              >
                <PoseIcon pose={p.id} className="shrink-0" />
                <span className="text-sm font-medium">{p.label}</span>
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
