import type { ProfilePose } from "./studio";

export type Vec3 = [number, number, number];

export interface LimbPose {
  shoulder: Vec3;
  elbow: Vec3;
}

export interface LegPose {
  hip: Vec3;
  knee: Vec3;
}

export interface FullBodyPose {
  leftArm: LimbPose;
  rightArm: LimbPose;
  leftLeg: LegPose;
  rightLeg: LegPose;
  torso: Vec3;
  head: Vec3;
}

const chill: FullBodyPose = {
  leftArm: { shoulder: [0.08, 0, 0.12], elbow: [0, 0, 0.05] },
  rightArm: { shoulder: [0.08, 0, -0.12], elbow: [0, 0, -0.05] },
  leftLeg: { hip: [0, 0, 0.03], knee: [0, 0, 0] },
  rightLeg: { hip: [0, 0, -0.03], knee: [0, 0, 0] },
  torso: [0, 0, 0],
  head: [0, 0, 0],
};

export const BODY_POSES: Record<ProfilePose, FullBodyPose> = {
  default: chill,
  wave: {
    // Character's right arm waves
    rightArm: { shoulder: [-0.55, 0.1, -0.35], elbow: [0, 0, -1.75] },
    leftArm: { shoulder: [0.1, 0, 0.18], elbow: [0, 0, 0.08] },
    leftLeg: { hip: [0, 0, 0.05], knee: [0.08, 0, 0] },
    rightLeg: { hip: [0, 0, -0.1], knee: [0, 0, 0.04] },
    torso: [0, 0.04, 0.02],
    head: [0, 0.05, -0.08],
  },
  flex: {
    leftArm: { shoulder: [0.15, 0, 1.45], elbow: [0, 0, 1.85] },
    rightArm: { shoulder: [0.15, 0, -1.45], elbow: [0, 0, -1.85] },
    leftLeg: { hip: [0, 0, 0.14], knee: [0.12, 0, 0] },
    rightLeg: { hip: [0, 0, -0.14], knee: [0.12, 0, 0] },
    torso: [0.06, 0, 0],
    head: [0.04, 0, 0],
  },
  peace: {
    leftArm: { shoulder: [0.12, 0, 0.55], elbow: [0, 0, 0.95] },
    rightArm: { shoulder: [0.12, 0, -0.55], elbow: [0, 0, -0.95] },
    leftLeg: { hip: [0, 0, 0.06], knee: [0, 0, 0] },
    rightLeg: { hip: [0, 0, -0.06], knee: [0, 0, 0] },
    torso: [0, 0, 0],
    head: [0.03, 0.04, 0],
  },
  stance: {
    leftArm: { shoulder: [0.1, 0, 0.38], elbow: [0, 0, 0.15] },
    rightArm: { shoulder: [0.1, 0, -0.38], elbow: [0, 0, -0.15] },
    leftLeg: { hip: [0, 0, 0.12], knee: [0.06, 0, 0] },
    rightLeg: { hip: [0, 0, -0.08], knee: [0, 0, 0.02] },
    torso: [0, 0.02, 0],
    head: [0, 0.02, 0.04],
  },
};

export function getBodyPose(pose: ProfilePose): FullBodyPose {
  return BODY_POSES[pose] ?? chill;
}
