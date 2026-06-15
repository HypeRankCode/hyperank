"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarFigure } from "./AvatarFigure";
import { Button } from "./ui/button";
import {
  DEFAULT_AVATAR_CONFIG,
  PROCEDURAL_AVATAR_URL,
  type AvatarConfig,
} from "@/lib/avatar/types";

const SKIN_TONES = ["#f5d0b0", "#c68642", "#8d5524", "#5c3d2e", "#3d2314"];
const HAIR_COLORS = ["#1a120b", "#4a3728", "#c9a227", "#e82222", "#f0f0f0"];
const SHIRT_COLORS = ["#e82222", "#141414", "#f0f0f0", "#2563eb", "#00e676"];

interface AvatarBuilderProps {
  initialConfig?: AvatarConfig | null;
  onSaved?: () => void;
}

export function AvatarBuilder({ initialConfig, onSaved }: AvatarBuilderProps) {
  const router = useRouter();
  const [config, setConfig] = useState<AvatarConfig>({
    ...DEFAULT_AVATAR_CONFIG,
    ...initialConfig,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function patch(partial: Partial<AvatarConfig>) {
    setConfig((c) => ({ ...c, ...partial }));
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
      return;
    }
    onSaved?.();
    router.refresh();
    setSaving(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="surface-card overflow-hidden p-4">
        <AvatarFigure config={config} />
      </div>

      <div className="space-y-5">
        <div>
          <p className="section-label mb-2">Body type</p>
          <div className="flex gap-2">
            {(["default", "tall", "stocky"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => patch({ bodyType: t })}
                className={`rounded-lg px-4 py-2 text-sm capitalize ${
                  config.bodyType === t
                    ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40"
                    : "bg-white/5 text-[var(--text-secondary)]"
                }`}
              >
                {t}
              </button>
            ))}
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
          label="Shirt"
          colors={SHIRT_COLORS}
          value={config.shirt ?? DEFAULT_AVATAR_CONFIG.shirt!}
          onChange={(shirt) => patch({ shirt })}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button className="w-full" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save character"}
        </Button>

        <p className="text-xs text-[var(--text-secondary)]">
          HypeRank uses a built-in avatar system. Ready Player Me shut down in
          Jan 2026 — your character lives on our servers now.
        </p>
      </div>
    </div>
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
      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-[#0c0c0c] ${
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
