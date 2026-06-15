// @ts-nocheck
"use client";

import type { AvatarConfig, AvatarVisualExtras } from "@/lib/avatar/types";
import type { ProfilePose } from "@/lib/avatar/studio";

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
  if (face === "sharp") return { w: 0.38, h: 0.48, d: 0.36, round: false };
  if (face === "soft") return { w: 0.44, h: 0.4, d: 0.42, round: false };
  if (face === "round") return { w: 0.44, h: 0.44, d: 0.44, round: true };
  return { w: 0.42, h: 0.42, d: 0.42, round: false };
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
  const eyeY = headY + dims.h * 0.1;
  const noseY = headY - dims.h * 0.06;
  const mouthY = headY - dims.h * 0.22;
  const earX = dims.w / 2 + 0.03;

  return (
    <>
      <mesh position={[-dims.w * 0.22, eyeY, frontZ]}>
        <boxGeometry args={[0.055, 0.055, 0.02]} />
        <meshStandardMaterial color={eye} />
      </mesh>
      <mesh position={[dims.w * 0.22, eyeY, frontZ]}>
        <boxGeometry args={[0.055, 0.055, 0.02]} />
        <meshStandardMaterial color={eye} />
      </mesh>
      <mesh position={[0, noseY, frontZ + 0.02]}>
        <boxGeometry args={[0.05, 0.06, 0.04]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[0, mouthY, frontZ]}>
        <boxGeometry args={[0.08, 0.03, 0.02]} />
        <meshStandardMaterial color="#8b4545" />
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

  // short — full cap on top + slight back, clear of face
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
  shirt,
  skin,
  watchColor,
}: {
  side: "left" | "right";
  shoulderX: number;
  shoulderY: number;
  pose: ProfilePose;
  shirt: string;
  skin: string;
  watchColor?: string;
}) {
  const rot = armRotation(pose, side);

  return (
    <group position={[shoulderX, shoulderY, 0]}>
      {/* Shoulder cap — connects arm to torso */}
      <mesh castShadow>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <group rotation={rot}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.17, 0.36, 0.17]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, -0.48, 0]} castShadow>
          <boxGeometry args={[0.15, 0.32, 0.15]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, -0.68, 0.02]} castShadow>
          <boxGeometry args={[0.13, 0.13, 0.1]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        {watchColor && side === "left" && (
          <mesh position={[0, -0.68, 0.08]}>
            <boxGeometry args={[0.1, 0.05, 0.06]} />
            <meshStandardMaterial color={watchColor} metalness={0.85} roughness={0.15} />
          </mesh>
        )}
      </group>
    </group>
  );
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
  const shoulderX = shoulderW / 2 + 0.04;

  const face = appearance.faceType ?? "default";
  const dims = getHeadDims(face);
  const headY = 1.58;
  const skin = appearance.skin ?? "#c68642";
  const eye = appearance.eyeColor ?? "#2a1810";
  const hat = appearance.hatColor;
  const shirt = appearance.shirt ?? "#e82222";

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

      <mesh position={[0, torsoY, 0]} castShadow>
        <boxGeometry args={[shoulderW, torsoH, 0.38]} />
        <meshStandardMaterial color={shirt} />
      </mesh>

      {/* Shoulder bridges on torso */}
      <mesh position={[-shoulderW / 2, shoulderY, 0]} castShadow>
        <boxGeometry args={[0.14, 0.14, 0.22]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <mesh position={[shoulderW / 2, shoulderY, 0]} castShadow>
        <boxGeometry args={[0.14, 0.14, 0.22]} />
        <meshStandardMaterial color={shirt} />
      </mesh>

      <Arm
        side="left"
        shoulderX={-shoulderX}
        shoulderY={shoulderY}
        pose={pose}
        shirt={shirt}
        skin={skin}
        watchColor={appearance.jewelryWatch}
      />
      <Arm
        side="right"
        shoulderX={shoulderX}
        shoulderY={shoulderY}
        pose={pose}
        shirt={shirt}
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
        <mesh position={[0, 1.32, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.022, 8, 24]} />
          <meshStandardMaterial color={appearance.jewelryChain} metalness={0.9} />
        </mesh>
      )}
      {appearance.jewelryEarrings && (
        <>
          <mesh position={[-dims.w / 2 - 0.06, headY - 0.02, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={appearance.jewelryEarrings} metalness={0.9} />
          </mesh>
          <mesh position={[dims.w / 2 + 0.06, headY - 0.02, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={appearance.jewelryEarrings} metalness={0.9} />
          </mesh>
        </>
      )}

      {hat && (
        <mesh position={[0, headY + dims.h / 2 + 0.1, 0]} castShadow>
          <boxGeometry args={[dims.w + 0.12, 0.12, dims.d + 0.12]} />
          <meshStandardMaterial
            color={hat}
            emissive={hat === "#ffc933" ? "#ffc933" : "#000000"}
            emissiveIntensity={hat === "#ffc933" ? 0.3 : 0}
          />
        </mesh>
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
