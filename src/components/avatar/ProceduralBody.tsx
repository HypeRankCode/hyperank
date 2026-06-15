// @ts-nocheck
"use client";

import type { AvatarConfig, AvatarVisualExtras } from "@/lib/avatar/types";
import type { ProfilePose } from "@/lib/avatar/studio";

interface Props {
  appearance: AvatarConfig & AvatarVisualExtras;
  pose?: ProfilePose;
  animate?: boolean;
}

function armPose(pose: ProfilePose, side: "left" | "right") {
  const isLeft = side === "left";
  switch (pose) {
    case "wave":
      return isLeft
        ? { pos: [-0.62, 1.35, 0.1] as const, rot: [0, 0, 0.8] as const }
        : { pos: [0.62, 1.05, 0] as const, rot: [0, 0, 0] as const };
    case "flex":
      return isLeft
        ? { pos: [-0.68, 1.28, 0] as const, rot: [0, 0, 1.1] as const }
        : { pos: [0.68, 1.28, 0] as const, rot: [0, 0, -1.1] as const };
    case "peace":
      return isLeft
        ? { pos: [-0.58, 1.22, 0.08] as const, rot: [0, 0, 0.5] as const }
        : { pos: [0.58, 1.22, 0.08] as const, rot: [0, 0, -0.5] as const };
    case "stance":
      return isLeft
        ? { pos: [-0.58, 1.02, 0.12] as const, rot: [0, 0, 0.35] as const }
        : { pos: [0.58, 1.02, 0.12] as const, rot: [0, 0, -0.35] as const };
    default:
      return isLeft
        ? { pos: [-0.58, 1.05, 0] as const, rot: [0, 0, 0] as const }
        : { pos: [0.58, 1.05, 0] as const, rot: [0, 0, 0] as const };
  }
}

export function ProceduralBody({
  appearance,
  pose = "default",
}: Props) {
  const isFemale = appearance.gender === "female";
  const bodyScale =
    appearance.bodyType === "tall" ? 1.08 : appearance.bodyType === "stocky" ? 0.94 : 1;
  const shoulderW = isFemale ? 0.62 : 0.72;
  const hipW = isFemale ? 0.3 : 0.27;
  const headY = 1.55;
  const face = appearance.faceType ?? "default";
  const skin = appearance.skin ?? "#c68642";
  const eye = appearance.eyeColor ?? "#2a1810";
  const hat = appearance.hatColor;
  const leftArm = armPose(pose, "left");
  const rightArm = armPose(pose, "right");

  const headArgs: [number, number, number] =
    face === "sharp"
      ? [0.38, 0.48, 0.36]
      : face === "soft"
        ? [0.44, 0.4, 0.42]
        : face === "round"
          ? [0.42, 0.42, 0.42]
          : [0.42, 0.42, 0.42];

  return (
    <group scale={bodyScale}>
      <mesh position={[-0.17, 0.28, 0]} castShadow>
        <boxGeometry args={[hipW, 0.68, hipW]} />
        <meshStandardMaterial color={appearance.pants} />
      </mesh>
      <mesh position={[0.17, 0.28, 0]} castShadow>
        <boxGeometry args={[hipW, 0.68, hipW]} />
        <meshStandardMaterial color={appearance.pants} />
      </mesh>
      <mesh position={[-0.17, 0.02, 0.04]} castShadow>
        <boxGeometry args={[0.28, 0.1, 0.32]} />
        <meshStandardMaterial color={appearance.shoes} />
      </mesh>
      <mesh position={[0.17, 0.02, 0.04]} castShadow>
        <boxGeometry args={[0.28, 0.1, 0.32]} />
        <meshStandardMaterial color={appearance.shoes} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[shoulderW, isFemale ? 0.72 : 0.78, 0.38]} />
        <meshStandardMaterial color={appearance.shirt} />
      </mesh>

      <group position={leftArm.pos} rotation={leftArm.rot}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.68, 0.2]} />
          <meshStandardMaterial color={appearance.shirt} />
        </mesh>
      </group>
      <group position={rightArm.pos} rotation={rightArm.rot}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.68, 0.2]} />
          <meshStandardMaterial color={appearance.shirt} />
        </mesh>
      </group>

      {appearance.jewelryWatch && (
        <mesh position={[-0.58, 0.62, 0.1]} castShadow>
          <boxGeometry args={[0.09, 0.05, 0.1]} />
          <meshStandardMaterial
            color={appearance.jewelryWatch}
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
      )}

      {face === "round" ? (
        <mesh position={[0, headY, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      ) : (
        <mesh position={[0, headY, 0]} castShadow>
          <boxGeometry args={headArgs} />
          <meshStandardMaterial color={skin} />
        </mesh>
      )}
      <mesh position={[-0.09, headY + 0.02, headArgs[2] / 2 + 0.01]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshStandardMaterial color={eye} />
      </mesh>
      <mesh position={[0.09, headY + 0.02, headArgs[2] / 2 + 0.01]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshStandardMaterial color={eye} />
      </mesh>

      {appearance.hairStyle !== "bald" && (
        <HairMesh appearance={appearance} headY={headY} />
      )}

      {appearance.jewelryChain && (
        <mesh position={[0, 1.28, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.022, 8, 24]} />
          <meshStandardMaterial color={appearance.jewelryChain} metalness={0.9} />
        </mesh>
      )}
      {appearance.jewelryEarrings && (
        <>
          <mesh position={[-0.24, headY, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={appearance.jewelryEarrings} metalness={0.9} />
          </mesh>
          <mesh position={[0.24, headY, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={appearance.jewelryEarrings} metalness={0.9} />
          </mesh>
        </>
      )}

      {hat && (
        <mesh position={[0, headY + 0.28, 0]} castShadow>
          <boxGeometry args={[0.5, 0.12, 0.5]} />
          <meshStandardMaterial color={hat} />
        </mesh>
      )}

      {appearance.effect === "fire" && (
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.035, 8, 32]} />
          <meshStandardMaterial color="#e82222" emissive="#e82222" emissiveIntensity={0.7} />
        </mesh>
      )}
    </group>
  );
}

function HairMesh({
  appearance,
  headY,
}: {
  appearance: AvatarConfig & AvatarVisualExtras;
  headY: number;
}) {
  const style = appearance.hairStyle ?? "short";
  const hair = appearance.hair ?? "#1a120b";
  if (style === "buzz") {
    return (
      <mesh position={[0, headY + 0.14, 0]}>
        <boxGeometry args={[0.44, 0.07, 0.44]} />
        <meshStandardMaterial color={hair} />
      </mesh>
    );
  }
  if (style === "long") {
    return (
      <group>
        <mesh position={[0, headY + 0.16, 0]}>
          <boxGeometry args={[0.46, 0.16, 0.46]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[-0.26, headY - 0.12, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[0.26, headY - 0.12, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color={hair} />
        </mesh>
      </group>
    );
  }
  if (style === "ponytail") {
    return (
      <group>
        <mesh position={[0, headY + 0.16, 0]}>
          <boxGeometry args={[0.44, 0.16, 0.44]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[0, headY + 0.02, -0.32]}>
          <boxGeometry args={[0.12, 0.45, 0.12]} />
          <meshStandardMaterial color={hair} />
        </mesh>
      </group>
    );
  }
  return (
    <mesh position={[0, headY + 0.16, 0]}>
      <boxGeometry args={[0.44, 0.16, 0.44]} />
      <meshStandardMaterial color={hair} />
    </mesh>
  );
}
