// @ts-nocheck
/// <reference types="@react-three/fiber" />
"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface AvatarModelProps {
  modelUrl: string;
  animate?: boolean;
}

function AvatarModel({ modelUrl, animate = true }: AvatarModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (animate && actions) {
      const idle = Object.values(actions)[0];
      idle?.reset().fadeIn(0.2).play();
    }
  }, [actions, animate]);

  useFrame((_, delta) => {
    if (group.current && animate) {
      group.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene.clone()} scale={1.8} position={[0, -1, 0]} />
    </group>
  );
}

interface Avatar3DProps {
  modelUrl: string;
  size?: "small" | "full";
  animate?: boolean;
}

export function Avatar3D({
  modelUrl,
  size = "full",
  animate = true,
}: Avatar3DProps) {
  if (!modelUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-[var(--bg-elevated)] ${
          size === "small" ? "h-20 w-20" : "h-full min-h-[300px] w-full"
        }`}
      >
        <span className="text-2xl opacity-30">?</span>
      </div>
    );
  }

  const isSmall = size === "small";

  return (
    <div
      className={
        isSmall
          ? "h-20 w-20 overflow-hidden rounded-full"
          : "h-full min-h-[400px] w-full"
      }
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{
          width: isSmall ? 80 : "100%",
          height: isSmall ? 80 : 400,
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 2]} intensity={1.2} />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <AvatarModel modelUrl={modelUrl} animate={animate} />
        </Suspense>
        {!isSmall && <OrbitControls enableZoom={false} enablePan={false} />}
      </Canvas>
    </div>
  );
}
