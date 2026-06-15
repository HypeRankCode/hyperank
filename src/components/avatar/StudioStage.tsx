// @ts-nocheck
"use client";

import type { StudioBackground } from "@/lib/avatar/studio";

export function StudioStage({ bg }: { bg: StudioBackground }) {
  return (
    <group>
      <mesh position={[0, 1.35, -2.4]}>
        <planeGeometry args={[9, 5.5]} />
        <meshStandardMaterial color={bg.wall} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.45, -2.38]}>
        <planeGeometry args={[7, 2.8]} />
        <meshStandardMaterial
          color={bg.accent}
          transparent
          opacity={0.07}
          emissive={bg.accent}
          emissiveIntensity={0.12}
        />
      </mesh>

      <mesh position={[0, -0.04, 0.12]} receiveShadow castShadow>
        <boxGeometry args={[2.6, 0.1, 1.6]} />
        <meshStandardMaterial color={bg.floor} metalness={0.15} roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.005, 0.12]} receiveShadow>
        <boxGeometry args={[2.45, 0.02, 1.45]} />
        <meshStandardMaterial color={bg.floor} metalness={0.35} roughness={0.55} />
      </mesh>

      <mesh position={[0, 0.01, 0.9]}>
        <boxGeometry args={[2.5, 0.03, 0.04]} />
        <meshStandardMaterial
          color={bg.accent}
          emissive={bg.accent}
          emissiveIntensity={0.45}
          metalness={0.4}
        />
      </mesh>

      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 0.03, 0.76]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.14, 0.05, 0.1]} />
          <meshStandardMaterial
            color={bg.spotColor}
            emissive={bg.spotColor}
            emissiveIntensity={0.65}
          />
        </mesh>
      ))}

      <mesh position={[0, 2.55, 0.45]}>
        <boxGeometry args={[1.2, 0.06, 0.35]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.6} roughness={0.4} />
      </mesh>
      {[-0.35, 0, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 2.48, 0.45]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
          <meshStandardMaterial
            color={bg.spotColor}
            emissive={bg.spotColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
