/** Shared proportions for the HypeRank smooth avatar silhouette */
export const HYPE_BODY = {
  headY: 1.3,
  headRadius: 0.26,
  hipX: 0.13,
  torsoY: 0.76,
  torsoRadius: 0.21,
  shoulderY: 1.02,
  shoulderX: 0.36,
} as const;

export function headScaleForFace(face: string): [number, number, number] {
  if (face === "sharp") return [0.9, 1.06, 0.88];
  if (face === "soft") return [1.04, 0.94, 1.04];
  if (face === "round") return [1.06, 1.06, 1.06];
  return [1, 1, 1];
}
