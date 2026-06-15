// @ts-nocheck
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { resolveAvatarAppearance } from "@/lib/avatar/types";
import {
  attachWebGLContextGuard,
  CANVAS_DPR,
  CANVAS_GL_PROPS,
} from "@/lib/avatar/webgl";
import { ProceduralBody } from "./avatar/ProceduralBody";

function RotatingAvatar({
  appearance,
  animate,
}: {
  appearance: ReturnType<typeof resolveAvatarAppearance>;
  animate: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current && animate) {
      group.current.rotation.y += delta * 0.4;
    }
  });
  return (
    <group ref={group}>
      <ProceduralBody appearance={appearance} pose="default" />
    </group>
  );
}

interface AvatarFigureProps {
  config?: Parameters<typeof resolveAvatarAppearance>[0];
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
        dpr={CANVAS_DPR}
        gl={CANVAS_GL_PROPS}
        onCreated={({ gl }) => attachWebGLContextGuard(gl)}
        style={{
          width: isSmall ? 80 : "100%",
          height: isSmall ? 80 : 400,
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} />
        <pointLight position={[-2, 3, 2]} intensity={0.4} color="#e82222" />
        <RotatingAvatar appearance={appearance} animate={animate && !isSmall} />
        {!isSmall && (
          <OrbitControls enableZoom={false} enablePan={false} target={[0, 1, 0]} />
        )}
      </Canvas>
    </div>
  );
}
