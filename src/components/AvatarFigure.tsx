// @ts-nocheck
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  resolveAvatarAppearance,
  type AvatarConfig,
} from "@/lib/avatar/types";

interface FigureProps {
  appearance: AvatarConfig & { hatColor?: string; effect?: string };
  animate?: boolean;
}

function ProceduralFigure({ appearance, animate = true }: FigureProps) {
  const group = useRef<THREE.Group>(null);
  const scale =
    appearance.bodyType === "tall" ? 1.1 : appearance.bodyType === "stocky" ? 0.95 : 1;

  useFrame((_, delta) => {
    if (group.current && animate) {
      group.current.rotation.y += delta * 0.4;
    }
  });

  const hat = appearance.hatColor;

  return (
    <group ref={group} scale={scale}>
      {/* Legs */}
      <mesh position={[-0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[0.28, 0.7, 0.28]} />
        <meshStandardMaterial color={appearance.pants} />
      </mesh>
      <mesh position={[0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[0.28, 0.7, 0.28]} />
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
        <boxGeometry args={[0.75, 0.85, 0.4]} />
        <meshStandardMaterial color={appearance.shirt} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.52, 1.05, 0]} castShadow>
        <boxGeometry args={[0.22, 0.75, 0.22]} />
        <meshStandardMaterial color={appearance.shirt} />
      </mesh>
      <mesh position={[0.52, 1.05, 0]} castShadow>
        <boxGeometry args={[0.22, 0.75, 0.22]} />
        <meshStandardMaterial color={appearance.shirt} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color={appearance.skin} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.82, 0]} castShadow>
        <boxGeometry args={[0.48, 0.2, 0.48]} />
        <meshStandardMaterial color={appearance.hair} />
      </mesh>
      {/* Hat */}
      {hat && (
        <mesh position={[0, 1.95, 0]} castShadow>
          <boxGeometry args={[0.55, 0.15, 0.55]} />
          <meshStandardMaterial
            color={hat}
            emissive={hat === "#ffc933" ? "#ffc933" : "#000000"}
            emissiveIntensity={hat === "#ffc933" ? 0.3 : 0}
          />
        </mesh>
      )}
      {/* Effect ring */}
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
        <mesh position={[0, 1.65, 0]}>
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
        {!isSmall && <OrbitControls enableZoom={false} enablePan={false} target={[0, 1, 0]} />}
      </Canvas>
    </div>
  );
}
