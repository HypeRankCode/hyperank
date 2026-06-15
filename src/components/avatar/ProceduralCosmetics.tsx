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

  return useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: pattern === "solid" ? color : "#ffffff",
      map: texture ?? undefined,
      metalness: opts?.metalness ?? 0.05,
      roughness: opts?.roughness ?? 0.85,
      emissive: opts?.emissive ?? "#000000",
      emissiveIntensity: opts?.emissiveIntensity ?? 0,
    });
    return mat;
  }, [pattern, color, texture, opts?.metalness, opts?.roughness, opts?.emissive, opts?.emissiveIntensity]);
}

export function HatMesh({
  design,
  color,
  headY,
  dims,
}: {
  design: string;
  color: string;
  headY: number;
  dims: { w: number; h: number; d: number };
}) {
  const knitMat = usePatternMaterial("knit", color);
  const goldMat = usePatternMaterial("gold", color, { metalness: 0.85, roughness: 0.2 });
  const top = headY + dims.h / 2;

  if (design === "crown") {
    return (
      <group>
        <mesh position={[0, top + 0.04, 0]} material={goldMat} castShadow>
          <cylinderGeometry args={[dims.w * 0.55, dims.w * 0.62, 0.1, 16]} />
        </mesh>
        {[-0.14, -0.07, 0, 0.07, 0.14].map((x, i) => (
          <mesh key={i} position={[x, top + 0.16, 0]} material={goldMat} castShadow>
            <boxGeometry args={[0.06, 0.18, 0.06]} />
          </mesh>
        ))}
        <mesh position={[0, top + 0.26, 0]} material={goldMat}>
          <sphereGeometry args={[0.05, 8, 8]} />
        </mesh>
      </group>
    );
  }

  if (design === "flame") {
    return (
      <group>
        <mesh position={[0, top + 0.06, -0.02]} material={knitMat} castShadow>
          <boxGeometry args={[dims.w + 0.1, 0.14, dims.d + 0.08]} />
        </mesh>
        {[-0.1, 0, 0.1].map((x, i) => (
          <mesh
            key={i}
            position={[x, top + 0.22, -0.04]}
            rotation={[0.2, 0, 0]}
            castShadow
          >
            <coneGeometry args={[0.07, 0.2, 6]} />
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

  // beanie
  return (
    <group>
      <mesh position={[0, top + 0.05, -0.02]} material={knitMat} castShadow>
        <boxGeometry args={[dims.w + 0.1, 0.16, dims.d + 0.08]} />
      </mesh>
      <mesh position={[0, top - 0.02, dims.d * 0.1]} material={knitMat} castShadow>
        <boxGeometry args={[dims.w + 0.14, 0.06, 0.08]} />
      </mesh>
      <mesh position={[0, top + 0.14, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
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
  const shoeY = -0.12;
  const shoeH = 0.13;

  return (
    <group position={[x, shoeY, 0.05]}>
      {/* Sole */}
      <mesh position={[0, -shoeH / 2 + 0.02, 0.02]} castShadow>
        <boxGeometry args={[0.3, 0.05, 0.36]} />
        <meshStandardMaterial color={soleColor} roughness={0.9} />
      </mesh>
      {/* Upper */}
      <mesh position={[0, 0.02, 0]} material={mat} castShadow>
        <boxGeometry args={[0.27, shoeH, 0.3]} />
      </mesh>
      {/* Toe cap */}
      <mesh position={[0, 0.02, 0.14]} material={mat} castShadow>
        <boxGeometry args={[0.25, shoeH * 0.85, 0.08]} />
      </mesh>
      {design === "sneaker" && (
        <>
          <mesh position={[0, 0.06, 0.05]}>
            <boxGeometry args={[0.22, 0.04, 0.18]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, -0.02, -0.1]}>
            <boxGeometry args={[0.08, 0.06, 0.04]} />
            <meshStandardMaterial color="#e82222" />
          </mesh>
        </>
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
    <group position={[0, -0.68, 0.06]}>
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

export function ChainMesh({ color, design }: { color: string; design: string }) {
  const mat = usePatternMaterial(design === "gold" ? "gold" : "silver", color, {
    metalness: 0.92,
    roughness: 0.12,
  });

  return (
    <group position={[0, 1.32, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh material={mat}>
        <torusGeometry args={[0.2, 0.028, 8, 24]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[Math.sin((i / 5) * Math.PI * 2) * 0.2, Math.cos((i / 5) * Math.PI * 2) * 0.2, 0]}
          material={mat}
        >
          <boxGeometry args={[0.04, 0.06, 0.02]} />
        </mesh>
      ))}
      <mesh position={[0, -0.22, 0]} material={mat}>
        <boxGeometry args={[0.08, 0.1, 0.04]} />
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
