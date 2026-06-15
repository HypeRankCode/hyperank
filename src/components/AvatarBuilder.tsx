"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarFigure } from "./AvatarFigure";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  DEFAULT_AVATAR_CONFIG,
  PROCEDURAL_AVATAR_URL,
  type AvatarConfig,
  type BodyType,
  type FaceType,
  type Gender,
  type HairStyle,
} from "@/lib/avatar/types";

const SKIN_TONES = ["#f5d0b0", "#c68642", "#8d5524", "#5c3d2e", "#3d2314"];
const HAIR_COLORS = ["#1a120b", "#4a3728", "#c9a227", "#e82222", "#f0f0f0", "#6b4c9a"];
const SHIRT_COLORS = ["#e82222", "#141414", "#f0f0f0", "#2563eb", "#00e676", "#ff6b35"];
const PANTS_COLORS = ["#141414", "#2563eb", "#3d4f2f", "#4a3728", "#f0f0f0"];
const EYE_COLORS = ["#2a1810", "#4a6741", "#2563eb", "#6b4c9a", "#8d5524"];

interface AvatarBuilderProps {
  initialConfig?: AvatarConfig | null;
  /** Controlled mode — parent owns state */
  value?: AvatarConfig;
  onChange?: (config: AvatarConfig) => void;
  compact?: boolean;
  showSaveButton?: boolean;
  saveLabel?: string;
  onSaved?: () => void;
}

export function AvatarBuilder({
  initialConfig,
  value,
  onChange,
  compact = false,
  showSaveButton = true,
  saveLabel = "Save character",
  onSaved,
}: AvatarBuilderProps) {
  const router = useRouter();
  const [internal, setInternal] = useState<AvatarConfig>({
    ...DEFAULT_AVATAR_CONFIG,
    ...initialConfig,
  });
  const config = value ?? internal;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmSave, setConfirmSave] = useState(false);

  function patch(partial: Partial<AvatarConfig>) {
    const next = { ...config, ...partial };
    if (onChange) onChange(next);
    else setInternal(next);
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/avatar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatar_rpm_url: PROCEDURAL_AVATAR_URL,
        appearance: config,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      setSaving(false);
      setConfirmSave(false);
      return;
    }
    setConfirmSave(false);
    onSaved?.();
    router.refresh();
    setSaving(false);
  }

  return (
    <div className={`grid gap-6 ${compact ? "" : "lg:grid-cols-2"}`}>
      <div className={`surface-card overflow-hidden p-4 ${compact ? "min-h-[280px]" : ""}`}>
        <AvatarFigure config={config} />
      </div>

      <div className="space-y-4">
        <div>
          <p className="section-label mb-2">Gender</p>
          <div className="flex gap-2">
            {(["male", "female"] as Gender[]).map((g) => (
              <OptionBtn
                key={g}
                active={config.gender === g}
                onClick={() => patch({ gender: g })}
                label={g}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-2">Body type</p>
          <div className="flex flex-wrap gap-2">
            {(["default", "tall", "stocky"] as BodyType[]).map((t) => (
              <OptionBtn
                key={t}
                active={config.bodyType === t}
                onClick={() => patch({ bodyType: t })}
                label={t}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-2">Face</p>
          <div className="flex flex-wrap gap-2">
            {(["default", "round", "sharp", "soft"] as FaceType[]).map((f) => (
              <OptionBtn
                key={f}
                active={config.faceType === f}
                onClick={() => patch({ faceType: f })}
                label={f}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-2">Hair style</p>
          <div className="flex flex-wrap gap-2">
            {(["short", "buzz", "long", "ponytail", "bald"] as HairStyle[]).map(
              (h) => (
                <OptionBtn
                  key={h}
                  active={config.hairStyle === h}
                  onClick={() => patch({ hairStyle: h })}
                  label={h}
                />
              )
            )}
          </div>
        </div>

        <ColorRow
          label="Skin"
          colors={SKIN_TONES}
          value={config.skin ?? DEFAULT_AVATAR_CONFIG.skin!}
          onChange={(skin) => patch({ skin })}
        />
        <ColorRow
          label="Hair"
          colors={HAIR_COLORS}
          value={config.hair ?? DEFAULT_AVATAR_CONFIG.hair!}
          onChange={(hair) => patch({ hair })}
        />
        <ColorRow
          label="Eyes"
          colors={EYE_COLORS}
          value={config.eyeColor ?? DEFAULT_AVATAR_CONFIG.eyeColor!}
          onChange={(eyeColor) => patch({ eyeColor })}
        />
        <ColorRow
          label="Shirt"
          colors={SHIRT_COLORS}
          value={config.shirt ?? DEFAULT_AVATAR_CONFIG.shirt!}
          onChange={(shirt) => patch({ shirt })}
        />
        {!compact && (
          <ColorRow
            label="Pants"
            colors={PANTS_COLORS}
            value={config.pants ?? DEFAULT_AVATAR_CONFIG.pants!}
            onChange={(pants) => patch({ pants })}
          />
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {showSaveButton && (
          <Button
            type="button"
            className="w-full"
            onClick={() => setConfirmSave(true)}
            disabled={saving}
          >
            {saving ? "Saving…" : saveLabel}
          </Button>
        )}

        {!compact && (
          <p className="text-xs text-[var(--text-secondary)]">
            Customize your look — gender, face, hair, colors, and more. Equip
            jewelry and outfits in the locker.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmSave}
        title="Save character?"
        description="This updates your avatar everywhere on HypeRank — profile, leaderboard, and battles."
        confirmLabel="Save"
        loading={saving}
        onConfirm={save}
        onCancel={() => setConfirmSave(false)}
      />
    </div>
  );
}

function OptionBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm capitalize ${
        active
          ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40"
          : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function ColorRow({
  label,
  colors,
  value,
  onChange,
}: {
  label: string;
  colors: string[];
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-[var(--text-secondary)]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-[#0c0c0c] ${
              value === c ? "ring-red-400" : "ring-transparent"
            }`}
            style={{ backgroundColor: c }}
            aria-label={c}
          />
        ))}
      </div>
    </div>
  );
}
