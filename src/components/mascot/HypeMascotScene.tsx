// @ts-nocheck
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ProceduralBody } from "@/components/avatar/ProceduralBody";
import {
  attachWebGLContextGuard,
  CANVAS_DPR,
  CANVAS_GL_PROPS,
} from "@/lib/avatar/webgl";

const MASCOT = {
  skin: "#d4a574",
  hair: "#ff4500",
  hairStyle: "short",
  shirt: "#e82222",
  pants: "#111111",
  shoes: "#ff2b2b",
  eyeColor: "#ffc933",
  gender: "male",
  bodyType: "default",
  faceType: "round",
};

function MascotWithBadge() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.35;
      group.current.position.y = Math.sin(Date.now() * 0.0018) * 0.03;
    }
  });

  return (
    <group ref={group} position={[0, -0.62, 0]} scale={0.86}>
      <ProceduralBody appearance={MASCOT} pose="stance" />
      <mesh position={[0, 1.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.028, 8, 32]} />
        <meshStandardMaterial
          color="#ff4500"
          emissive="#ff4500"
          emissiveIntensity={0.9}
        />
      </mesh>
      <mesh position={[0, 0.95, 0.21]}>
        <boxGeometry args={[0.14, 0.14, 0.02]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  );
}

export function HypeMascotScene({
  size = "hero",
}: {
  size?: "hero" | "md" | "sm";
}) {
  const camera =
    size === "hero"
      ? { position: [0, 0.68, 5.8] as const, fov: 42 }
      : { position: [0, 0.7, 4.5] as const, fov: 38 };

  return (
    <Canvas
      camera={camera}
      dpr={CANVAS_DPR}
      gl={CANVAS_GL_PROPS}
      onCreated={({ gl }) => attachWebGLContextGuard(gl)}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <pointLight position={[-2, 2, 2]} intensity={0.5} color="#e82222" />
      <pointLight position={[2, 3, -1]} intensity={0.35} color="#ff4500" />
      <MascotWithBadge />
    </Canvas>
  );
}
