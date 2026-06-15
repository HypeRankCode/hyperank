/** Sentinel stored in profiles.avatar_rpm_url for built-in avatars (legacy column name). */
export const PROCEDURAL_AVATAR_URL = "hyperank:procedural";

export type Gender = "male" | "female";
export type BodyType = "default" | "tall" | "stocky";
export type FaceType = "default" | "round" | "sharp" | "soft";
export type HairStyle = "short" | "buzz" | "long" | "ponytail" | "bald";

export interface AvatarConfig {
  skin?: string;
  hair?: string;
  shirt?: string;
  pants?: string;
  shoes?: string;
  eyeColor?: string;
  gender?: Gender;
  bodyType?: BodyType;
  faceType?: FaceType;
  hairStyle?: HairStyle;
}

export interface AvatarVisualExtras {
  hatColor?: string;
  effect?: string;
  jewelryWatch?: string;
  jewelryChain?: string;
  jewelryEarrings?: string;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skin: "#c68642",
  hair: "#1a120b",
  shirt: "#e82222",
  pants: "#141414",
  shoes: "#2a2a2a",
  eyeColor: "#2a1810",
  gender: "male",
  bodyType: "default",
  faceType: "default",
  hairStyle: "short",
};

/** Cosmetic id → visual overrides for procedural avatar */
export const COSMETIC_VISUALS: Record<
  string,
  Partial<AvatarConfig> & AvatarVisualExtras
> = {
  hat_default: { hatColor: "#2a2a2a" },
  hat_crown: { hatColor: "#ffc933" },
  hat_flame: { hatColor: "#e82222" },
  shirt_default: { shirt: "#f0f0f0" },
  shirt_hyperank: { shirt: "#e82222" },
  shirt_fire: { shirt: "#ff6b35" },
  pants_default: { pants: "#141414" },
  pants_jeans: { pants: "#2563eb" },
  pants_camo: { pants: "#3d4f2f" },
  shoes_default: { shoes: "#2a2a2a" },
  shoes_gold: { shoes: "#ffc933" },
  watch_silver: { jewelryWatch: "#c0c0c0" },
  watch_gold: { jewelryWatch: "#ffc933" },
  chain_silver: { jewelryChain: "#c0c0c0" },
  chain_gold: { jewelryChain: "#ffc933" },
  earrings_studs: { jewelryEarrings: "#ffc933" },
  earrings_hoops: { jewelryEarrings: "#e8e8e8" },
  earrings_diamond: { jewelryEarrings: "#b9f2ff" },
  bg_space: {},
  bg_neon_city: {},
  effect_fire_aura: { effect: "fire" },
  effect_crown_glow: { effect: "glow" },
};

export function resolveAvatarAppearance(
  config: AvatarConfig | null | undefined,
  equipped: Record<string, string> = {}
): AvatarConfig & AvatarVisualExtras {
  let merged: AvatarConfig & AvatarVisualExtras = {
    ...DEFAULT_AVATAR_CONFIG,
    ...config,
  };

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

export const EQUIP_SLOTS = [
  "hat",
  "shirt",
  "pants",
  "shoes",
  "watch",
  "chain",
  "earrings",
  "accessory",
  "background",
  "effect",
] as const;

export type EquipSlot = (typeof EQUIP_SLOTS)[number];

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

/** Strip preview slots that reference unowned cosmetic ids */
export function ownedEquippedOnly(
  equipped: Record<string, string>,
  ownedIds: string[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [slot, id] of Object.entries(equipped)) {
    if (ownedIds.includes(id)) out[slot] = id;
  }
  return out;
}

export function hasUnownedEquipped(
  equipped: Record<string, string>,
  ownedIds: string[]
): boolean {
  return Object.values(equipped).some((id) => !ownedIds.includes(id));
}
