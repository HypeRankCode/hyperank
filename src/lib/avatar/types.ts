/** Sentinel stored in profiles.avatar_rpm_url for built-in avatars (legacy column name). */
export const PROCEDURAL_AVATAR_URL = "hyperank:procedural";

export interface AvatarConfig {
  skin?: string;
  hair?: string;
  shirt?: string;
  pants?: string;
  shoes?: string;
  bodyType?: "default" | "tall" | "stocky";
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skin: "#c68642",
  hair: "#1a120b",
  shirt: "#e82222",
  pants: "#141414",
  shoes: "#2a2a2a",
  bodyType: "default",
};

/** Cosmetic id → visual overrides for procedural avatar */
export const COSMETIC_VISUALS: Record<
  string,
  Partial<AvatarConfig> & { hatColor?: string; effect?: string }
> = {
  hat_default: { hatColor: "#2a2a2a" },
  hat_crown: { hatColor: "#ffc933" },
  hat_flame: { hatColor: "#e82222" },
  shirt_default: { shirt: "#f0f0f0" },
  shirt_hyperank: { shirt: "#e82222" },
  shirt_fire: { shirt: "#ff6b35" },
  shoes_default: { shoes: "#2a2a2a" },
  shoes_gold: { shoes: "#ffc933" },
  bg_space: {},
  bg_neon_city: {},
  effect_fire_aura: { effect: "fire" },
  effect_crown_glow: { effect: "glow" },
};

export function resolveAvatarAppearance(
  config: AvatarConfig | null | undefined,
  equipped: Record<string, string> = {}
): AvatarConfig & { hatColor?: string; effect?: string } {
  let merged = { ...DEFAULT_AVATAR_CONFIG, ...config };

  for (const cosmeticId of Object.values(equipped)) {
    const visual = COSMETIC_VISUALS[cosmeticId];
    if (visual) merged = { ...merged, ...visual };
  }

  return merged;
}

export function isProceduralAvatar(modelUrl: string | null | undefined): boolean {
  if (!modelUrl) return true;
  if (modelUrl === PROCEDURAL_AVATAR_URL) return true;
  if (modelUrl.includes("readyplayer.me")) return true;
  return false;
}

const EQUIP_SLOTS = [
  "hat",
  "shirt",
  "pants",
  "shoes",
  "accessory",
  "background",
  "effect",
] as const;

export function getEquippedFromConfig(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const equipped: Record<string, string> = {};
  if (!config) return equipped;
  for (const slot of EQUIP_SLOTS) {
    const v = config[slot];
    if (typeof v === "string") equipped[slot] = v;
  }
  return equipped;
}

export function getAppearanceFromConfig(
  config: Record<string, unknown> | null | undefined
): AvatarConfig {
  const raw = config?.appearance;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return { ...DEFAULT_AVATAR_CONFIG, ...(raw as AvatarConfig) };
  }
  return { ...DEFAULT_AVATAR_CONFIG };
}

export function hasBuiltAvatar(
  modelUrl: string | null | undefined,
  config: Record<string, unknown> | null | undefined
): boolean {
  if (modelUrl === PROCEDURAL_AVATAR_URL) return true;
  if (modelUrl && !modelUrl.includes("readyplayer.me")) return true;
  const appearance = config?.appearance;
  return Boolean(
    appearance && typeof appearance === "object" && !Array.isArray(appearance)
  );
}
