// @ts-nocheck
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  resolveAvatarAppearance,
  type AvatarConfig,
  type AvatarVisualExtras,
} from "@/lib/avatar/types";

interface FigureProps {
  appearance: AvatarConfig & AvatarVisualExtras;
  animate?: boolean;
}

function HeadMesh({
  appearance,
  pos,
}: {
  appearance: AvatarConfig & AvatarVisualExtras;
  pos: [number, number, number];
}) {
  const face = appearance.faceType ?? "default";
  const skin = appearance.skin ?? "#c68642";
  const eye = appearance.eyeColor ?? "#2a1810";

  if (face === "round") {
    return (
      <group position={pos}>
        <mesh castShadow>
          <sphereGeometry args={[0.24, 16, 16]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh position={[-0.1, 0.02, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={eye} />
        </mesh>
        <mesh position={[0.1, 0.02, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={eye} />
        </mesh>
      </group>
    );
  }

  const headArgs: [number, number, number] =
    face === "sharp"
      ? [0.4, 0.5, 0.38]
      : face === "soft"
        ? [0.46, 0.42, 0.44]
        : [0.45, 0.45, 0.45];

  return (
    <group position={pos}>
      <mesh castShadow>
        <boxGeometry args={headArgs} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[-0.1, 0.02, headArgs[2] / 2 + 0.01]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color={eye} />
      </mesh>
      <mesh position={[0.1, 0.02, headArgs[2] / 2 + 0.01]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color={eye} />
      </mesh>
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
  if (style === "bald") return null;

  if (style === "buzz") {
    return (
      <mesh position={[0, headY + 0.08, 0]} castShadow>
        <boxGeometry args={[0.46, 0.08, 0.46]} />
        <meshStandardMaterial color={hair} />
      </mesh>
    );
  }

  if (style === "long") {
    return (
      <group>
        <mesh position={[0, headY + 0.1, 0]} castShadow>
          <boxGeometry args={[0.5, 0.18, 0.5]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[-0.28, headY - 0.15, 0]} castShadow>
          <boxGeometry args={[0.12, 0.45, 0.12]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[0.28, headY - 0.15, 0]} castShadow>
          <boxGeometry args={[0.12, 0.45, 0.12]} />
          <meshStandardMaterial color={hair} />
        </mesh>
      </group>
    );
  }

  if (style === "ponytail") {
    return (
      <group>
        <mesh position={[0, headY + 0.1, 0]} castShadow>
          <boxGeometry args={[0.48, 0.18, 0.48]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[0, headY, -0.35]} castShadow>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshStandardMaterial color={hair} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh position={[0, headY + 0.1, 0]} castShadow>
      <boxGeometry args={[0.48, 0.2, 0.48]} />
      <meshStandardMaterial color={hair} />
    </mesh>
  );
}

function ProceduralFigure({ appearance, animate = true }: FigureProps) {
  const group = useRef<THREE.Group>(null);
  const isFemale = appearance.gender === "female";
  const bodyScale =
    appearance.bodyType === "tall" ? 1.1 : appearance.bodyType === "stocky" ? 0.95 : 1;
  const shoulderW = isFemale ? 0.65 : 0.75;
  const hipW = isFemale ? 0.32 : 0.28;
  const headY = 1.65;

  useFrame((_, delta) => {
    if (group.current && animate) {
      group.current.rotation.y += delta * 0.4;
    }
  });

  const hat = appearance.hatColor;

  return (
    <group ref={group} scale={bodyScale}>
      {/* Legs */}
      <mesh position={[-0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[hipW, 0.7, hipW]} />
        <meshStandardMaterial color={appearance.pants} />
      </mesh>
      <mesh position={[0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[hipW, 0.7, hipW]} />
        <meshStandardMaterial color={appearance.pants} />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.18, 0.05, 0.05]} castShadow>
        <boxGeometry args={[0.3, 0.12, 0.35]} />
        <meshStandardMaterial color={appearance.shoes} />
      </mesh>
      <mesh position={[0.18, 0.05, 0.05]} castShadow>
        <boxGeometry args={[0.3, 0.12, 0.35]} />
        <meshStandardMaterial color={appearance.shoes} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[shoulderW, isFemale ? 0.78 : 0.85, 0.4]} />
        <meshStandardMaterial color={appearance.shirt} />
      </mesh>
      {/* Arms */}
      <mesh position={[-(shoulderW / 2 + 0.15), 1.05, 0]} castShadow>
        <boxGeometry args={[0.2, 0.72, 0.2]} />
        <meshStandardMaterial color={appearance.shirt} />
      </mesh>
      <mesh position={[shoulderW / 2 + 0.15, 1.05, 0]} castShadow>
        <boxGeometry args={[0.2, 0.72, 0.2]} />
        <meshStandardMaterial color={appearance.shirt} />
      </mesh>
      {/* Watch on left wrist */}
      {appearance.jewelryWatch && (
        <mesh position={[-(shoulderW / 2 + 0.15), 0.72, 0.12]} castShadow>
          <boxGeometry args={[0.1, 0.06, 0.12]} />
          <meshStandardMaterial
            color={appearance.jewelryWatch}
            metalness={0.8}
            roughness={0.2}
            emissive={appearance.jewelryWatch}
            emissiveIntensity={0.15}
          />
        </mesh>
      )}
      {/* Head + face */}
      <HeadMesh appearance={appearance} pos={[0, headY, 0]} />
      <HairMesh appearance={appearance} headY={headY} />
      {/* Chain */}
      {appearance.jewelryChain && (
        <mesh position={[0, 1.38, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.025, 8, 24]} />
          <meshStandardMaterial
            color={appearance.jewelryChain}
            metalness={0.9}
            roughness={0.15}
            emissive={appearance.jewelryChain}
            emissiveIntensity={0.1}
          />
        </mesh>
      )}
      {/* Earrings */}
      {appearance.jewelryEarrings && (
        <>
          <mesh position={[-0.26, headY, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color={appearance.jewelryEarrings}
              metalness={0.9}
              emissive={appearance.jewelryEarrings}
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0.26, headY, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color={appearance.jewelryEarrings}
              metalness={0.9}
              emissive={appearance.jewelryEarrings}
              emissiveIntensity={0.2}
            />
          </mesh>
        </>
      )}
      {/* Hat */}
      {hat && (
        <mesh position={[0, headY + 0.3, 0]} castShadow>
          <boxGeometry args={[0.55, 0.15, 0.55]} />
          <meshStandardMaterial
            color={hat}
            emissive={hat === "#ffc933" ? "#ffc933" : "#000000"}
            emissiveIntensity={hat === "#ffc933" ? 0.3 : 0}
          />
        </mesh>
      )}
      {/* Effects */}
      {appearance.effect === "fire" && (
        <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.9, 0.04, 8, 32]} />
          <meshStandardMaterial
            color="#e82222"
            emissive="#e82222"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
      {appearance.effect === "glow" && (
        <mesh position={[0, headY, 0]}>
          <sphereGeometry args={[0.55, 16, 16]} />
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

interface AvatarFigureProps {
  config?: AvatarConfig | null;
  equipped?: Record<string, string>;
  size?: "small" | "full";
  animate?: boolean;
}

export function AvatarFigure({
  config,
  equipped = {},
  size = "full",
  animate = true,
}: AvatarFigureProps) {
  const appearance = resolveAvatarAppearance(config, equipped);
  const isSmall = size === "small";

  return (
    <div
      className={
        isSmall
          ? "h-20 w-20 overflow-hidden rounded-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]"
          : "h-full min-h-[400px] w-full rounded-xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]"
      }
    >
      <Canvas
        camera={{ position: [0, 1.2, isSmall ? 4 : 3.2], fov: 45 }}
        style={{
          width: isSmall ? 80 : "100%",
          height: isSmall ? 80 : 400,
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} />
        <pointLight position={[-2, 3, 2]} intensity={0.4} color="#e82222" />
        <ProceduralFigure appearance={appearance} animate={animate} />
        {!isSmall && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            target={[0, 1, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}
