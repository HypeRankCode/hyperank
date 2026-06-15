// @ts-nocheck
"use client";

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import type { AvatarConfig, AvatarVisualExtras } from "@/lib/avatar/types";
import type { ProfilePose } from "@/lib/avatar/studio";
import type { PatternId } from "@/lib/avatar/patterns";
import {
  HYPE_BODY,
  headScaleForFace,
  earOffset,
  type HeadScale,
} from "@/lib/avatar/body-metrics";
import { getBodyPose } from "@/lib/avatar/poses";
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

function StylizedFace({
  headY,
  headR,
  headScale,
  skin,
  eye,
  isFemale,
}: {
  headY: number;
  headR: number;
  headScale: HeadScale;
  skin: string;
  eye: string;
  isFemale: boolean;
}) {
  const [sx, sy, sz] = headScale;
  const eyeY = headY + headR * sy * 0.1;
  const eyeX = headR * sx * 0.36;
  const faceZ = headR * sz + 0.015;
  const ears = earOffset(headR, headScale);

  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * eyeX, eyeY, faceZ]}>
          <mesh>
            <sphereGeometry args={[headR * 0.1 * sx, 14, 14]} />
            <meshStandardMaterial color="#f0ebe3" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, headR * sz * 0.035]}>
            <sphereGeometry args={[headR * 0.065, 14, 14]} />
            <meshStandardMaterial color={eye} roughness={0.35} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, headY - headR * sy * 0.1, faceZ + headR * sz * 0.04]}>
        <sphereGeometry args={[headR * 0.065 * sx, 12, 12]} />
        <meshStandardMaterial color={skin} roughness={0.65} />
      </mesh>
      {isFemale && (
        <group position={[0, headY - headR * sy * 0.24, faceZ + headR * sz * 0.02]}>
          <mesh position={[-headR * sx * 0.05, 0, 0]}>
            <sphereGeometry args={[headR * 0.045, 10, 10]} />
            <meshStandardMaterial color="#c96b7a" roughness={0.45} />
          </mesh>
          <mesh position={[headR * sx * 0.05, 0, 0]}>
            <sphereGeometry args={[headR * 0.045, 10, 10]} />
            <meshStandardMaterial color="#c96b7a" roughness={0.45} />
          </mesh>
        </group>
      )}
      {[-1, 1].map((side) => (
        <mesh
          key={`ear-${side}`}
          position={[side * ears.x, headY + ears.y, ears.z]}
        >
          <sphereGeometry args={[ears.radius, 10, 10]} />
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
  headScale,
}: {
  appearance: AvatarConfig & AvatarVisualExtras;
  headY: number;
  headR: number;
  headScale: HeadScale;
}) {
  const style = appearance.hairStyle ?? "short";
  const hair = appearance.hair ?? "#1a120b";
  const mat = useHairMaterial(hair);
  const [sx, sy, sz] = headScale;
  const capY = headY + headR * sy * 0.98;

  if (style === "bald") return null;

  if (style === "buzz") {
    return (
      <mesh position={[0, capY, 0]} scale={[sx, sy, sz]} material={mat} castShadow>
        <sphereGeometry args={[headR * 1.002, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2.15]} />
      </mesh>
    );
  }

  if (style === "long") {
    return (
      <group>
        <mesh
          position={[0, headY + headR * sy * 0.28, -headR * sz * 0.04]}
          scale={[sx, sy, sz]}
          material={mat}
          castShadow
        >
          <sphereGeometry args={[headR * 1.06, 16, 16]} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[
              side * headR * sx * 0.9,
              headY - headR * sy * 0.32,
              -headR * sz * 0.06,
            ]}
            material={mat}
            castShadow
          >
            <capsuleGeometry args={[headR * 0.16, headR * 0.85, 8, 12]} />
          </mesh>
        ))}
      </group>
    );
  }

  if (style === "ponytail") {
    const tailBaseZ = -headR * sz * 0.88;
    return (
      <group>
        <mesh position={[0, headY + headR * sy * 0.28, -headR * sz * 0.05]} scale={[sx, sy, sz]} material={mat} castShadow>
          <sphereGeometry args={[headR * 1.04, 16, 16]} />
        </mesh>
        <mesh
          position={[0, headY + headR * sy * 0.05, tailBaseZ]}
          rotation={[0.45, 0, 0]}
          material={mat}
          castShadow
        >
          <capsuleGeometry args={[headR * 0.12, headR * 0.72, 8, 12]} />
        </mesh>
      </group>
    );
  }

  // short
  return (
    <group>
      <mesh position={[0, headY + headR * sy * 0.38, -headR * sz * 0.04]} scale={[sx, sy, sz]} material={mat} castShadow>
        <sphereGeometry args={[headR * 1.05, 16, 16]} />
      </mesh>
      <mesh position={[0, headY + headR * sy * 0.12, -headR * sz * 0.82]} scale={[sx, sy * 0.9, sz]} material={mat} castShadow>
        <sphereGeometry args={[headR * 0.5, 12, 12]} />
      </mesh>
    </group>
  );
}

function SmoothArm({
  side,
  shoulderX,
  shoulderY,
  limbPose,
  shirtMat,
  skinMaterial,
  watchColor,
  watchDesign,
}: {
  side: "left" | "right";
  shoulderX: number;
  shoulderY: number;
  limbPose: { shoulder: [number, number, number]; elbow: [number, number, number] };
  shirtMat: THREE.MeshStandardMaterial;
  skinMaterial: THREE.MeshStandardMaterial;
  watchColor?: string;
  watchDesign?: string;
}) {
  const upper = HYPE_BODY.upperArmLen;
  const fore = HYPE_BODY.forearmLen;
  const inward = side === "left" ? 0.04 : -0.04;

  return (
    <group position={[shoulderX + inward, shoulderY, 0]}>
      <mesh material={shirtMat} castShadow>
        <sphereGeometry args={[0.068, 14, 14]} />
      </mesh>
      <group rotation={limbPose.shoulder}>
        <mesh position={[0, -upper / 2, 0]} material={shirtMat} castShadow>
          <capsuleGeometry args={[0.058, upper, 8, 14]} />
        </mesh>
        <group position={[0, -upper, 0]} rotation={limbPose.elbow}>
          <mesh position={[0, -fore / 2, 0]} material={shirtMat} castShadow>
            <capsuleGeometry args={[0.05, fore, 8, 14]} />
          </mesh>
          <mesh position={[0, -fore, 0.02]} material={skinMaterial} castShadow>
            <sphereGeometry args={[0.048, 12, 12]} />
          </mesh>
          {watchColor && side === "left" && (
            <WatchMesh color={watchColor} design={watchDesign ?? "silver"} />
          )}
        </group>
      </group>
    </group>
  );
}

function SmoothLeg({
  hipX,
  hipY,
  limbPose,
  pantsMat,
  shoeDesign,
  shoeColor,
  joggerCuff,
}: {
  hipX: number;
  hipY: number;
  limbPose: { hip: [number, number, number]; knee: [number, number, number] };
  pantsMat: THREE.MeshStandardMaterial;
  shoeDesign: string;
  shoeColor: string;
  joggerCuff?: boolean;
}) {
  const upper = HYPE_BODY.upperLegLen;
  const lower = HYPE_BODY.lowerLegLen;

  return (
    <group position={[hipX, hipY, 0]}>
      <group rotation={limbPose.hip}>
        <mesh position={[0, -upper / 2, 0]} material={pantsMat} castShadow>
          <capsuleGeometry args={[0.078, upper, 8, 14]} />
        </mesh>
        {joggerCuff && (
          <mesh position={[0, -upper + 0.04, 0]}>
            <torusGeometry args={[0.082, 0.016, 8, 16]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.9} />
          </mesh>
        )}
        <group position={[0, -upper, 0]} rotation={limbPose.knee}>
          <mesh position={[0, -lower / 2, 0]} material={pantsMat} castShadow>
            <capsuleGeometry args={[0.068, lower, 8, 14]} />
          </mesh>
          <group position={[0, -lower, 0]}>
            <ShoeMesh x={0} design={shoeDesign} color={shoeColor} />
          </group>
        </group>
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

  const hipX = isFemale ? HYPE_BODY.hipX * 1.04 : HYPE_BODY.hipX;
  const torsoR = isFemale ? HYPE_BODY.torsoRadius * 0.9 : HYPE_BODY.torsoRadius;
  const shoulderX = isFemale ? HYPE_BODY.shoulderX * 0.9 : HYPE_BODY.shoulderX;

  const face = appearance.faceType ?? "default";
  const headY = HYPE_BODY.headY;
  const headR = HYPE_BODY.headRadius;
  const headScale = headScaleForFace(face);
  const bodyPose = getBodyPose(pose);

  const skin = appearance.skin ?? "#c68642";
  const eye = appearance.eyeColor ?? "#4a3728";
  const hat = appearance.hatColor;
  const shirt = appearance.shirt ?? "#e82222";
  const pants = appearance.pants ?? "#141414";
  const shoeDesign = appearance.shoesDesign ?? "sneaker";
  const shoeColor = appearance.shoes ?? "#2a2a2a";

  const shirtMat = usePatternMaterial(shirtPattern(appearance.shirtDesign), shirt, {
    roughness: 0.78,
  });
  const pantsMat = usePatternMaterial(pantsPattern(appearance.pantsDesign), pants, {
    roughness: 0.82,
  });
  const skinMaterial = useSkinMaterial(skin);

  return (
    <group scale={bodyScale}>
      <group rotation={bodyPose.torso}>
        <SmoothLeg
          hipX={-hipX}
          hipY={HYPE_BODY.hipY}
          limbPose={bodyPose.leftLeg}
          pantsMat={pantsMat}
          shoeDesign={shoeDesign}
          shoeColor={shoeColor}
          joggerCuff={appearance.pantsDesign === "jogger"}
        />
        <SmoothLeg
          hipX={hipX}
          hipY={HYPE_BODY.hipY}
          limbPose={bodyPose.rightLeg}
          pantsMat={pantsMat}
          shoeDesign={shoeDesign}
          shoeColor={shoeColor}
          joggerCuff={appearance.pantsDesign === "jogger"}
        />

        <mesh position={[0, HYPE_BODY.torsoY, 0]} material={shirtMat} castShadow>
          <capsuleGeometry args={[torsoR, 0.44, 10, 18]} />
        </mesh>

        <mesh position={[0, 1.04, 0]} material={skinMaterial} castShadow>
          <capsuleGeometry args={[0.052, 0.09, 8, 12]} />
        </mesh>

        <SmoothArm
          side="left"
          shoulderX={-shoulderX}
          shoulderY={HYPE_BODY.shoulderY}
          limbPose={bodyPose.leftArm}
          shirtMat={shirtMat}
          skinMaterial={skinMaterial}
          watchColor={appearance.jewelryWatch}
          watchDesign={appearance.jewelryWatchDesign}
        />
        <SmoothArm
          side="right"
          shoulderX={shoulderX}
          shoulderY={HYPE_BODY.shoulderY}
          limbPose={bodyPose.rightArm}
          shirtMat={shirtMat}
          skinMaterial={skinMaterial}
        />

        <group rotation={bodyPose.head}>
          <mesh position={[0, headY, 0]} scale={headScale} material={skinMaterial} castShadow>
            <sphereGeometry args={[headR, 28, 28]} />
          </mesh>

          <StylizedFace
            headY={headY}
            headR={headR}
            headScale={headScale}
            skin={skin}
            eye={eye}
            isFemale={isFemale}
          />
          <SmoothHair
            appearance={appearance}
            headY={headY}
            headR={headR}
            headScale={headScale}
          />

          {appearance.jewelryEarrings && (
            <EarringsMesh
              color={appearance.jewelryEarrings}
              design={appearance.jewelryEarringsDesign ?? "studs"}
              headY={headY}
              earX={earOffset(headR, headScale).x}
            />
          )}

          {hat && (
            <HatMesh
              design={appearance.hatDesign ?? "beanie"}
              color={hat}
              headY={headY}
              headR={headR * headScale[1]}
            />
          )}
        </group>

        {appearance.jewelryChain && (
          <ChainMesh
            color={appearance.jewelryChain}
            design={appearance.jewelryChainDesign ?? "silver"}
            neckY={1.1}
          />
        )}

        {appearance.effect === "fire" && (
          <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.72, 0.03, 10, 32]} />
            <meshStandardMaterial color="#e82222" emissive="#e82222" emissiveIntensity={0.65} />
          </mesh>
        )}
        {appearance.effect === "glow" && (
          <mesh position={[0, headY, 0]} scale={headScale}>
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
    </group>
  );
}
