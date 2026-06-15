export type ProfilePose =
  | "default"
  | "wave"
  | "flex"
  | "peace"
  | "stance";

export const PROFILE_POSES: { id: ProfilePose; label: string }[] = [
  { id: "default", label: "Chill" },
  { id: "wave", label: "Wave" },
  { id: "flex", label: "Flex" },
  { id: "peace", label: "Peace" },
  { id: "stance", label: "Stance" },
];

export interface StudioBackground {
  id: string;
  label: string;
  floor: string;
  wall: string;
  accent: string;
  spotColor: string;
}

export const STUDIO_BACKGROUNDS: Record<string, StudioBackground> = {
  default: {
    id: "default",
    label: "Hype Stage",
    floor: "#2a2a32",
    wall: "#1e1e28",
    accent: "#e82222",
    spotColor: "#ff5555",
  },
  bg_space: {
    id: "bg_space",
    label: "Deep Space",
    floor: "#0a0a18",
    wall: "#050510",
    accent: "#6b4c9a",
    spotColor: "#8b7cf6",
  },
  bg_neon_city: {
    id: "bg_neon_city",
    label: "Neon City",
    floor: "#120818",
    wall: "#0a0510",
    accent: "#ff2d95",
    spotColor: "#00e5ff",
  },
};

export interface ProfilePhotoMeta {
  pose?: ProfilePose;
  background?: string;
}

export function getProfilePhotoMeta(
  config: Record<string, unknown> | null | undefined
): ProfilePhotoMeta {
  const raw = config?.profile_photo;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as ProfilePhotoMeta;
  }
  return {};
}
