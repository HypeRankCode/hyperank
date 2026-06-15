// @ts-nocheck
"use client";

import * as THREE from "three";
import type { AvatarConfig, AvatarVisualExtras } from "@/lib/avatar/types";
import type { ProfilePose } from "@/lib/avatar/studio";
import type { PatternId } from "@/lib/avatar/patterns";
import {
  usePatternMaterial,
  HatMesh,
  ShoeMesh,
  WatchMesh,
  ChainMesh,
  EarringsMesh,
} from "./ProceduralCosmetics";

interface Props {
  appearance: AvatarConfig & AvatarVisualExtras;
  pose?: ProfilePose;
}

function armRotation(pose: ProfilePose, side: "left" | "right"): [number, number, number] {
  const s = side === "left" ? 1 : -1;
  switch (pose) {
    case "wave":
      return side === "left" ? [0.15, 0, 1.35] : [0, 0, -0.15];
    case "flex":
      return [0, 0, s * 1.45];
    case "peace":
      return [0, 0, s * 0.65];
    case "stance":
      return [0, 0, s * 0.4];
    default:
      return [0.08, 0, s * 0.12];
  }
}

function getHeadDims(face: string) {
  if (face === "sharp") return { w: 0.4, h: 0.5, d: 0.38, round: false };
  if (face === "soft") return { w: 0.46, h: 0.42, d: 0.44, round: false };
  if (face === "round") return { w: 0.46, h: 0.46, d: 0.46, round: true };
  return { w: 0.44, h: 0.44, d: 0.44, round: false };
}

function CuteEye({ x, y, z, irisColor }: { x: number; y: number; z: number; irisColor: string }) {
  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.018]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>
      <mesh position={[0, -0.008, 0.012]}>
        <boxGeometry args={[0.065, 0.065, 0.014]} />
        <meshStandardMaterial color={irisColor} />
      </mesh>
      <mesh position={[0.012, 0.012, 0.02]}>
        <boxGeometry args={[0.028, 0.028, 0.01]} />
        <meshStandardMaterial color="#1a1008" />
      </mesh>
      <mesh position={[-0.018, 0.02, 0.022]}>
        <boxGeometry args={[0.018, 0.018, 0.006]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.45}
        />
      </mesh>
    </group>
  );
}

function FaceFeatures({
  headY,
  dims,
  skin,
  eye,
}: {
  headY: number;
  dims: ReturnType<typeof getHeadDims>;
  skin: string;
  eye: string;
}) {
  const frontZ = dims.d / 2 + 0.012;
  const eyeY = headY + dims.h * 0.08;
  const noseY = headY - dims.h * 0.05;
  const mouthY = headY - dims.h * 0.2;
  const earX = dims.w / 2 + 0.03;

  return (
    <>
      <CuteEye x={-dims.w * 0.22} y={eyeY} z={frontZ} irisColor={eye} />
      <CuteEye x={dims.w * 0.22} y={eyeY} z={frontZ} irisColor={eye} />

      {/* Blush */}
      <mesh position={[-dims.w * 0.3, headY - 0.06, frontZ - 0.004]}>
        <boxGeometry args={[0.07, 0.045, 0.008]} />
        <meshStandardMaterial color="#ff8a8a" transparent opacity={0.32} />
      </mesh>
      <mesh position={[dims.w * 0.3, headY - 0.06, frontZ - 0.004]}>
        <boxGeometry args={[0.07, 0.045, 0.008]} />
        <meshStandardMaterial color="#ff8a8a" transparent opacity={0.32} />
      </mesh>

      <mesh position={[0, noseY, frontZ + 0.015]}>
        <boxGeometry args={[0.04, 0.05, 0.035]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      {/* Smile */}
      <mesh position={[-0.03, mouthY, frontZ]}>
        <boxGeometry args={[0.035, 0.025, 0.015]} />
        <meshStandardMaterial color="#c96b6b" />
      </mesh>
      <mesh position={[0.03, mouthY, frontZ]}>
        <boxGeometry args={[0.035, 0.025, 0.015]} />
        <meshStandardMaterial color="#c96b6b" />
      </mesh>
      <mesh position={[0, mouthY - 0.012, frontZ]}>
        <boxGeometry args={[0.05, 0.02, 0.015]} />
        <meshStandardMaterial color="#b85a5a" />
      </mesh>

      <mesh position={[-earX, headY, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.06]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[earX, headY, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.06]} />
        <meshStandardMaterial color={skin} />
      </mesh>
    </>
  );
}

function HairMesh({
  appearance,
  headY,
  dims,
}: {
  appearance: AvatarConfig & AvatarVisualExtras;
  headY: number;
  dims: ReturnType<typeof getHeadDims>;
}) {
  const style = appearance.hairStyle ?? "short";
  const hair = appearance.hair ?? "#1a120b";
  if (style === "bald") return null;

  const top = headY + dims.h / 2;
  const capW = dims.w + 0.08;
  const capD = dims.d + 0.06;

  if (style === "buzz") {
    return (
      <mesh position={[0, top + 0.02, -0.01]} castShadow>
        <boxGeometry args={[capW, 0.06, capD]} />
        <meshStandardMaterial color={hair} />
      </mesh>
    );
  }

  if (style === "long") {
    return (
      <group>
        <mesh position={[0, top + 0.05, -0.02]} castShadow>
          <boxGeometry args={[capW, 0.12, capD]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[0, top - 0.02, -dims.d * 0.15]} castShadow>
          <boxGeometry args={[capW * 0.95, 0.08, capD * 0.9]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[-dims.w / 2 - 0.04, headY - 0.05, -0.02]} castShadow>
          <boxGeometry args={[0.1, 0.38, 0.1]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[dims.w / 2 + 0.04, headY - 0.05, -0.02]} castShadow>
          <boxGeometry args={[0.1, 0.38, 0.1]} />
          <meshStandardMaterial color={hair} />
        </mesh>
      </group>
    );
  }

  if (style === "ponytail") {
    return (
      <group>
        <mesh position={[0, top + 0.05, -0.02]} castShadow>
          <boxGeometry args={[capW, 0.12, capD]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[0, headY, -dims.d / 2 - 0.22]} castShadow>
          <boxGeometry args={[0.12, 0.42, 0.12]} />
          <meshStandardMaterial color={hair} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, top + 0.06, -0.02]} castShadow>
        <boxGeometry args={[capW, 0.14, capD]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      <mesh position={[0, headY + dims.h * 0.15, -dims.d / 2 - 0.02]} castShadow>
        <boxGeometry args={[capW * 0.92, 0.1, 0.08]} />
        <meshStandardMaterial color={hair} />
      </mesh>
    </group>
  );
}

function Arm({
  side,
  shoulderX,
  shoulderY,
  pose,
  shirtMat,
  skin,
  watchColor,
  watchDesign,
}: {
  side: "left" | "right";
  shoulderX: number;
  shoulderY: number;
  pose: ProfilePose;
  shirtMat: THREE.MeshStandardMaterial;
  skin: string;
  watchColor?: string;
  watchDesign?: string;
}) {
  const rot = armRotation(pose, side);

  return (
    <group position={[shoulderX, shoulderY, 0]}>
      <mesh castShadow material={shirtMat}>
        <sphereGeometry args={[0.09, 10, 10]} />
      </mesh>
      <group rotation={rot}>
        <mesh position={[0, -0.2, 0]} castShadow material={shirtMat}>
          <boxGeometry args={[0.16, 0.36, 0.16]} />
        </mesh>
        <mesh position={[0, -0.48, 0]} castShadow material={shirtMat}>
          <boxGeometry args={[0.14, 0.32, 0.14]} />
        </mesh>
        <mesh position={[0, -0.68, 0.02]} castShadow>
          <boxGeometry args={[0.12, 0.12, 0.1]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        {watchColor && side === "left" && (
          <WatchMesh color={watchColor} design={watchDesign ?? "silver"} />
        )}
      </group>
    </group>
  );
}

function shirtPattern(design?: string): PatternId {
  if (design === "hyperank") return "hyperank";
  if (design === "fire") return "fire";
  return "solid";
}

function pantsPattern(design?: string): PatternId {
  if (design === "camo") return "camo";
  if (design === "jeans") return "denim";
  return "solid";
}

export function ProceduralBody({ appearance, pose = "default" }: Props) {
  const isFemale = appearance.gender === "female";
  const bodyScale =
    appearance.bodyType === "tall" ? 1.08 : appearance.bodyType === "stocky" ? 0.94 : 1;
  const shoulderW = isFemale ? 0.62 : 0.72;
  const hipW = isFemale ? 0.3 : 0.27;
  const torsoY = 0.95;
  const torsoH = isFemale ? 0.72 : 0.78;
  const shoulderY = torsoY + torsoH / 2 - 0.06;
  const shoulderX = shoulderW / 2 + 0.14;

  const legH = 0.5;
  const legY = 0.23;
  const legBottom = legY - legH / 2;

  const face = appearance.faceType ?? "default";
  const dims = getHeadDims(face);
  const headY = 1.58;
  const skin = appearance.skin ?? "#c68642";
  const eye = appearance.eyeColor ?? "#4a3728";
  const hat = appearance.hatColor;
  const shirt = appearance.shirt ?? "#e82222";
  const pants = appearance.pants ?? "#141414";

  const shirtMat = usePatternMaterial(shirtPattern(appearance.shirtDesign), shirt);
  const pantsMat = usePatternMaterial(pantsPattern(appearance.pantsDesign), pants);

  return (
    <group scale={bodyScale}>
      {/* Legs — bottom aligns with shoe top */}
      <mesh position={[-0.17, legY, 0]} castShadow material={pantsMat}>
        <boxGeometry args={[hipW, legH, hipW]} />
      </mesh>
      <mesh position={[0.17, legY, 0]} castShadow material={pantsMat}>
        <boxGeometry args={[hipW, legH, hipW]} />
      </mesh>

      <ShoeMesh x={-0.17} design={appearance.shoesDesign ?? "sneaker"} color={appearance.shoes ?? "#2a2a2a"} />
      <ShoeMesh x={0.17} design={appearance.shoesDesign ?? "sneaker"} color={appearance.shoes ?? "#2a2a2a"} />

      {/* Jogger cuff hem at ankle */}
      {appearance.pantsDesign === "jogger" && (
        <>
          <mesh position={[-0.17, legBottom + 0.03, 0]}>
            <boxGeometry args={[hipW + 0.02, 0.06, hipW + 0.02]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
          <mesh position={[0.17, legBottom + 0.03, 0]}>
            <boxGeometry args={[hipW + 0.02, 0.06, hipW + 0.02]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
        </>
      )}

      <mesh position={[0, torsoY, 0]} castShadow material={shirtMat}>
        <boxGeometry args={[shoulderW, torsoH, 0.38]} />
      </mesh>

      <Arm
        side="left"
        shoulderX={-shoulderX}
        shoulderY={shoulderY}
        pose={pose}
        shirtMat={shirtMat}
        skin={skin}
        watchColor={appearance.jewelryWatch}
        watchDesign={appearance.jewelryWatchDesign}
      />
      <Arm
        side="right"
        shoulderX={shoulderX}
        shoulderY={shoulderY}
        pose={pose}
        shirtMat={shirtMat}
        skin={skin}
      />

      {dims.round ? (
        <mesh position={[0, headY, 0]} castShadow>
          <sphereGeometry args={[dims.w / 2, 16, 16]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      ) : (
        <mesh position={[0, headY, 0]} castShadow>
          <boxGeometry args={[dims.w, dims.h, dims.d]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      )}

      <FaceFeatures headY={headY} dims={dims} skin={skin} eye={eye} />
      <HairMesh appearance={appearance} headY={headY} dims={dims} />

      {appearance.jewelryChain && (
        <ChainMesh
          color={appearance.jewelryChain}
          design={appearance.jewelryChainDesign ?? "silver"}
        />
      )}
      {appearance.jewelryEarrings && (
        <EarringsMesh
          color={appearance.jewelryEarrings}
          design={appearance.jewelryEarringsDesign ?? "studs"}
          headY={headY}
          earX={dims.w / 2 + 0.06}
        />
      )}

      {hat && (
        <HatMesh
          design={appearance.hatDesign ?? "beanie"}
          color={hat}
          headY={headY}
          dims={dims}
        />
      )}

      {appearance.effect === "fire" && (
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.035, 8, 32]} />
          <meshStandardMaterial color="#e82222" emissive="#e82222" emissiveIntensity={0.7} />
        </mesh>
      )}
      {appearance.effect === "glow" && (
        <mesh position={[0, headY, 0]}>
          <sphereGeometry args={[dims.w * 0.75, 16, 16]} />
          <meshStandardMaterial
            color="#ffc933"
            transparent
            opacity={0.15}
            emissive="#ffc933"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}
