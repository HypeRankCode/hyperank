/** Shared proportions for the HypeRank smooth avatar silhouette */
export const HYPE_BODY = {
  headY: 1.28,
  headRadius: 0.26,
  hipX: 0.14,
  hipY: 0.62,
  torsoY: 0.78,
  torsoRadius: 0.21,
  shoulderY: 1.0,
  shoulderX: 0.34,
  upperArmLen: 0.28,
  forearmLen: 0.24,
  upperLegLen: 0.3,
  lowerLegLen: 0.28,
} as const;

export type HeadScale = [number, number, number];

/** Face-type morph — distinct silhouettes, not all spheres */
export function headScaleForFace(face: string): HeadScale {
  switch (face) {
    case "sharp":
      // Narrow oval
      return [0.86, 1.1, 0.9];
    case "soft":
      // Wide, soft square-ish
      return [1.1, 0.94, 1.06];
    case "round":
      return [1.08, 1.06, 1.04];
    default:
      // Balanced oval
      return [0.96, 1.04, 0.94];
  }
}

export function earOffset(headR: number, headScale: HeadScale) {
  return {
    x: headR * headScale[0] + 0.02,
    y: headR * headScale[1] * 0.02,
    z: 0,
    radius: headR * 0.11 * headScale[0],
  };
}
