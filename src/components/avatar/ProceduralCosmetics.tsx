// @ts-nocheck
"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createPatternTexture, type PatternId } from "@/lib/avatar/patterns";

export function usePatternMaterial(
  pattern: PatternId,
  color: string,
  opts?: { metalness?: number; roughness?: number; emissive?: string; emissiveIntensity?: number }
) {
  const texture = useMemo(
    () => (pattern === "solid" ? null : createPatternTexture(pattern, color)),
    [pattern, color]
  );

  useEffect(() => {
    return () => texture?.dispose();
  }, [texture]);

  const metalness = opts?.metalness ?? 0.05;
  const roughness = opts?.roughness ?? 0.85;
  const emissive = opts?.emissive ?? "#000000";
  const emissiveIntensity = opts?.emissiveIntensity ?? 0;

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: pattern === "solid" ? color : "#ffffff",
      metalness,
      roughness,
      emissive,
      emissiveIntensity,
    });
    if (texture) {
      mat.map = texture;
    }
    return mat;
  }, [pattern, color, texture, metalness, roughness, emissive, emissiveIntensity]);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  return material;
}

export function HatMesh({
  design,
  color,
  headY,
  headR,
}: {
  design: string;
  color: string;
  headY: number;
  headR: number;
}) {
  const knitMat = usePatternMaterial("knit", color);
  const goldMat = usePatternMaterial("gold", color, { metalness: 0.85, roughness: 0.2 });
  const top = headY + headR;

  if (design === "crown") {
    return (
      <group>
        <mesh position={[0, top + 0.02, 0]} material={goldMat} castShadow>
          <cylinderGeometry args={[headR * 0.95, headR * 1.05, 0.08, 20]} />
        </mesh>
        {[-0.12, -0.06, 0, 0.06, 0.12].map((x, i) => (
          <mesh key={i} position={[x, top + 0.14, 0]} material={goldMat} castShadow>
            <coneGeometry args={[0.035, 0.14, 8]} />
          </mesh>
        ))}
        <mesh position={[0, top + 0.22, 0]} material={goldMat}>
          <sphereGeometry args={[0.045, 10, 10]} />
        </mesh>
      </group>
    );
  }

  if (design === "flame") {
    return (
      <group>
        <mesh position={[0, top + 0.04, -0.02]} material={knitMat} castShadow>
          <sphereGeometry args={[headR * 1.05, 14, 14]} />
        </mesh>
        {[-0.08, 0, 0.08].map((x, i) => (
          <mesh
            key={i}
            position={[x, top + 0.18, -0.03]}
            rotation={[0.25, 0, 0]}
            castShadow
          >
            <coneGeometry args={[0.055, 0.16, 10]} />
            <meshStandardMaterial
              color={i === 1 ? "#ffc933" : "#ff4500"}
              emissive={i === 1 ? "#ffc933" : "#ff4500"}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, top + 0.04, -0.01]} material={knitMat} castShadow>
        <sphereGeometry args={[headR * 1.08, 16, 16]} />
      </mesh>
      <mesh position={[0, top - headR * 0.15, headR * 0.35]} material={knitMat} castShadow>
        <torusGeometry args={[headR * 0.95, headR * 0.06, 10, 20]} />
      </mesh>
      <mesh position={[0, top + 0.12, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function ShoeMesh({
  x,
  design,
  color,
}: {
  x: number;
  design: string;
  color: string;
}) {
  const sneakerMat = usePatternMaterial("solid", color, { roughness: 0.7 });
  const goldMat = usePatternMaterial("gold", color, { metalness: 0.9, roughness: 0.15 });
  const mat = design === "gold" ? goldMat : sneakerMat;
  const soleColor = design === "gold" ? "#c9a227" : "#111111";

  return (
    <group position={[x, 0.04, 0.04]}>
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.22, 8, 14]} />
        <meshStandardMaterial color={soleColor} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.04, -0.01]} material={mat} castShadow>
        <sphereGeometry args={[0.1, 14, 14]} />
      </mesh>
      <mesh position={[0, 0.03, 0.08]} material={mat} castShadow>
        <sphereGeometry args={[0.08, 12, 12]} />
      </mesh>
      {design === "sneaker" && (
        <mesh position={[0, 0.06, 0.02]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}

export function WatchMesh({ color, design }: { color: string; design: string }) {
  const mat = usePatternMaterial(design === "gold" ? "gold" : "silver", color, {
    metalness: 0.9,
    roughness: 0.15,
  });

  return (
    <group position={[0, 0, 0.05]}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={mat}>
        <torusGeometry args={[0.055, 0.018, 8, 16]} />
      </mesh>
      <mesh position={[0, 0, 0.04]} material={mat}>
        <cylinderGeometry args={[0.055, 0.055, 0.025, 16]} />
      </mesh>
      <mesh position={[0, 0, 0.055]}>
        <cylinderGeometry args={[0.04, 0.04, 0.01, 16]} />
        <meshStandardMaterial color="#111111" metalness={0.5} />
      </mesh>
      <mesh position={[0.02, 0.02, 0.06]}>
        <boxGeometry args={[0.012, 0.012, 0.005]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export function ChainMesh({
  color,
  design,
  neckY = 1.12,
}: {
  color: string;
  design: string;
  neckY?: number;
}) {
  const mat = usePatternMaterial(design === "gold" ? "gold" : "silver", color, {
    metalness: 0.92,
    roughness: 0.12,
  });

  return (
    <group position={[0, neckY, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh material={mat}>
        <torusGeometry args={[0.18, 0.022, 10, 24]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[Math.sin((i / 5) * Math.PI * 2) * 0.18, Math.cos((i / 5) * Math.PI * 2) * 0.18, 0]}
          material={mat}
        >
          <sphereGeometry args={[0.022, 8, 8]} />
        </mesh>
      ))}
      <mesh position={[0, -0.2, 0]} material={mat}>
        <sphereGeometry args={[0.04, 10, 10]} />
      </mesh>
    </group>
  );
}

export function EarringsMesh({
  color,
  design,
  headY,
  earX,
}: {
  color: string;
  design: string;
  headY: number;
  earX: number;
}) {
  const goldMat = usePatternMaterial("gold", color, { metalness: 0.9, roughness: 0.15 });
  const silverMat = usePatternMaterial("silver", color, { metalness: 0.85, roughness: 0.2 });

  const renderOne = (side: number) => {
    const x = side * earX;
    if (design === "hoops") {
      return (
        <mesh key={side} position={[x, headY - 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} material={silverMat}>
          <torusGeometry args={[0.05, 0.008, 8, 20]} />
        </mesh>
      );
    }
    if (design === "diamond") {
      return (
        <group key={side} position={[x, headY - 0.02, 0.02]}>
          <mesh material={silverMat}>
            <octahedronGeometry args={[0.045, 0]} />
          </mesh>
          <mesh position={[0.01, 0.01, 0.02]}>
            <boxGeometry args={[0.012, 0.012, 0.005]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
          </mesh>
        </group>
      );
    }
    return (
      <group key={side} position={[x, headY - 0.02, 0.01]}>
        <mesh material={goldMat}>
          <sphereGeometry args={[0.032, 10, 10]} />
        </mesh>
        <mesh position={[0.008, 0.008, 0.015]}>
          <boxGeometry args={[0.01, 0.01, 0.004]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.35} />
        </mesh>
      </group>
    );
  };

  return (
    <>
      {renderOne(-1)}
      {renderOne(1)}
    </>
  );
}
