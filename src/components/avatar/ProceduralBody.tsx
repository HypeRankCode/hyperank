// @ts-nocheck
"use client";

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import type { AvatarConfig, AvatarVisualExtras } from "@/lib/avatar/types";
import type { ProfilePose } from "@/lib/avatar/studio";
import type { PatternId } from "@/lib/avatar/patterns";
import { HYPE_BODY, headScaleForFace } from "@/lib/avatar/body-metrics";
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

function useSkinMaterial(color: string) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.62,
        metalness: 0.02,
      }),
    [color]
  );
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

function useHairMaterial(color: string) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.88,
      }),
    [color]
  );
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

function armRotation(pose: ProfilePose, side: "left" | "right"): [number, number, number] {
  const s = side === "left" ? 1 : -1;
  switch (pose) {
    case "wave":
      return side === "left" ? [0.15, 0, 1.25] : [0, 0, -0.12];
    case "flex":
      return [0, 0, s * 1.35];
    case "peace":
      return [0, 0, s * 0.58];
    case "stance":
      return [0, 0, s * 0.32];
    default:
      return [0.06, 0, s * 0.1];
  }
}

function StylizedFace({
  headY,
  headR,
  skin,
  eye,
}: {
  headY: number;
  headR: number;
  skin: string;
  eye: string;
}) {
  const eyeY = headY + headR * 0.12;
  const eyeX = headR * 0.38;
  const z = headR + 0.01;

  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * eyeX, eyeY, z]}>
          <mesh>
            <sphereGeometry args={[headR * 0.11, 14, 14]} />
            <meshStandardMaterial color="#f0ebe3" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, headR * 0.04]}>
            <sphereGeometry args={[headR * 0.07, 14, 14]} />
            <meshStandardMaterial color={eye} roughness={0.35} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, headY - headR * 0.08, z + headR * 0.05]}>
        <sphereGeometry args={[headR * 0.07, 12, 12]} />
        <meshStandardMaterial color={skin} roughness={0.65} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`ear-${side}`} position={[side * (headR + 0.03), headY, 0]}>
          <sphereGeometry args={[headR * 0.12, 10, 10]} />
          <meshStandardMaterial color={skin} roughness={0.62} />
        </mesh>
      ))}
    </>
  );
}

function SmoothHair({
  appearance,
  headY,
  headR,
}: {
  appearance: AvatarConfig & AvatarVisualExtras;
  headY: number;
  headR: number;
}) {
  const style = appearance.hairStyle ?? "short";
  const hair = appearance.hair ?? "#1a120b";
  const mat = useHairMaterial(hair);

  if (style === "bald") return null;

  if (style === "buzz") {
    return (
      <mesh position={[0, headY + headR * 0.55, -0.01]} material={mat} castShadow>
        <sphereGeometry args={[headR * 1.02, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    );
  }

  if (style === "long") {
    return (
      <group>
        <mesh position={[0, headY + headR * 0.35, -0.02]} material={mat} castShadow>
          <sphereGeometry args={[headR * 1.08, 16, 16]} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * headR * 0.95, headY - headR * 0.35, -0.03]}
            material={mat}
            castShadow
          >
            <capsuleGeometry args={[headR * 0.18, headR * 0.9, 8, 12]} />
          </mesh>
        ))}
      </group>
    );
  }

  if (style === "ponytail") {
    return (
      <group>
        <mesh position={[0, headY + headR * 0.35, -0.02]} material={mat} castShadow>
          <sphereGeometry args={[headR * 1.05, 16, 16]} />
        </mesh>
        <mesh position={[0, headY - headR * 0.1, -headR - 0.2]} material={mat} castShadow>
          <capsuleGeometry args={[headR * 0.14, headR * 0.75, 8, 12]} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, headY + headR * 0.42, -0.02]} material={mat} castShadow>
        <sphereGeometry args={[headR * 1.06, 16, 16]} />
      </mesh>
      <mesh position={[0, headY + headR * 0.15, -headR * 0.85]} material={mat} castShadow>
        <sphereGeometry args={[headR * 0.55, 12, 12]} />
      </mesh>
    </group>
  );
}

function SmoothArm({
  side,
  shoulderX,
  shoulderY,
  pose,
  shirtMat,
  skinMaterial,
  watchColor,
  watchDesign,
}: {
  side: "left" | "right";
  shoulderX: number;
  shoulderY: number;
  pose: ProfilePose;
  shirtMat: THREE.MeshStandardMaterial;
  skinMaterial: THREE.MeshStandardMaterial;
  watchColor?: string;
  watchDesign?: string;
}) {
  const rot = armRotation(pose, side);

  return (
    <group position={[shoulderX, shoulderY, 0]}>
      <mesh material={shirtMat} castShadow>
        <sphereGeometry args={[0.075, 14, 14]} />
      </mesh>
      <group rotation={rot}>
        <mesh position={[0, -0.22, 0]} material={shirtMat} castShadow>
          <capsuleGeometry args={[0.062, 0.3, 8, 14]} />
        </mesh>
        <mesh position={[0, -0.5, 0]} material={shirtMat} castShadow>
          <capsuleGeometry args={[0.052, 0.26, 8, 14]} />
        </mesh>
        <mesh position={[0, -0.68, 0.02]} material={skinMaterial} castShadow>
          <sphereGeometry args={[0.052, 12, 12]} />
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
    appearance.bodyType === "tall" ? 1.06 : appearance.bodyType === "stocky" ? 0.96 : 1;

  const hipX = isFemale ? HYPE_BODY.hipX * 1.05 : HYPE_BODY.hipX;
  const torsoR = isFemale ? HYPE_BODY.torsoRadius * 0.92 : HYPE_BODY.torsoRadius;
  const shoulderX = isFemale ? HYPE_BODY.shoulderX * 0.92 : HYPE_BODY.shoulderX;

  const face = appearance.faceType ?? "default";
  const headY = HYPE_BODY.headY;
  const headR = HYPE_BODY.headRadius;
  const headScale = headScaleForFace(face);
  const skin = appearance.skin ?? "#c68642";
  const eye = appearance.eyeColor ?? "#4a3728";
  const hat = appearance.hatColor;
  const shirt = appearance.shirt ?? "#e82222";
  const pants = appearance.pants ?? "#141414";

  const shirtMat = usePatternMaterial(shirtPattern(appearance.shirtDesign), shirt, {
    roughness: 0.78,
  });
  const pantsMat = usePatternMaterial(pantsPattern(appearance.pantsDesign), pants, {
    roughness: 0.82,
  });
  const skinMaterial = useSkinMaterial(skin);

  return (
    <group scale={bodyScale}>
      <mesh position={[-hipX, 0.27, 0]} material={pantsMat} castShadow>
        <capsuleGeometry args={[0.08, 0.4, 8, 14]} />
      </mesh>
      <mesh position={[hipX, 0.27, 0]} material={pantsMat} castShadow>
        <capsuleGeometry args={[0.08, 0.4, 8, 14]} />
      </mesh>

      <ShoeMesh x={-hipX} design={appearance.shoesDesign ?? "sneaker"} color={appearance.shoes ?? "#2a2a2a"} />
      <ShoeMesh x={hipX} design={appearance.shoesDesign ?? "sneaker"} color={appearance.shoes ?? "#2a2a2a"} />

      {appearance.pantsDesign === "jogger" && (
        <>
          <mesh position={[-hipX, 0.1, 0]}>
            <torusGeometry args={[0.085, 0.018, 8, 16]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.9} />
          </mesh>
          <mesh position={[hipX, 0.1, 0]}>
            <torusGeometry args={[0.085, 0.018, 8, 16]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.9} />
          </mesh>
        </>
      )}

      <mesh position={[0, HYPE_BODY.torsoY, 0]} material={shirtMat} castShadow>
        <capsuleGeometry args={[torsoR, 0.46, 10, 18]} />
      </mesh>

      <mesh position={[0, 1.06, 0]} material={skinMaterial} castShadow>
        <capsuleGeometry args={[0.055, 0.1, 8, 12]} />
      </mesh>

      <SmoothArm
        side="left"
        shoulderX={-shoulderX}
        shoulderY={HYPE_BODY.shoulderY}
        pose={pose}
        shirtMat={shirtMat}
        skinMaterial={skinMaterial}
        watchColor={appearance.jewelryWatch}
        watchDesign={appearance.jewelryWatchDesign}
      />
      <SmoothArm
        side="right"
        shoulderX={shoulderX}
        shoulderY={HYPE_BODY.shoulderY}
        pose={pose}
        shirtMat={shirtMat}
        skinMaterial={skinMaterial}
      />

      <mesh position={[0, headY, 0]} scale={headScale} material={skinMaterial} castShadow>
        <sphereGeometry args={[headR, 28, 28]} />
      </mesh>

      <StylizedFace headY={headY} headR={headR * headScale[1]} skin={skin} eye={eye} />
      <SmoothHair appearance={appearance} headY={headY} headR={headR} />

      {appearance.jewelryChain && (
        <ChainMesh
          color={appearance.jewelryChain}
          design={appearance.jewelryChainDesign ?? "silver"}
          neckY={1.12}
        />
      )}
      {appearance.jewelryEarrings && (
        <EarringsMesh
          color={appearance.jewelryEarrings}
          design={appearance.jewelryEarringsDesign ?? "studs"}
          headY={headY}
          earX={headR * headScale[0] + 0.04}
        />
      )}

      {hat && (
        <HatMesh
          design={appearance.hatDesign ?? "beanie"}
          color={hat}
          headY={headY}
          headR={headR}
        />
      )}

      {appearance.effect === "fire" && (
        <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.03, 10, 32]} />
          <meshStandardMaterial color="#e82222" emissive="#e82222" emissiveIntensity={0.65} />
        </mesh>
      )}
      {appearance.effect === "glow" && (
        <mesh position={[0, headY, 0]}>
          <sphereGeometry args={[headR * 1.35, 20, 20]} />
          <meshStandardMaterial
            color="#ffc933"
            transparent
            opacity={0.12}
            emissive="#ffc933"
            emissiveIntensity={0.45}
          />
        </mesh>
      )}
    </group>
  );
}
