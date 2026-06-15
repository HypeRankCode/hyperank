// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  resolveAvatarAppearance,
  type AvatarConfig,
  type AvatarVisualExtras,
} from "@/lib/avatar/types";
import type { ProfilePose } from "@/lib/avatar/studio";
import { STUDIO_BACKGROUNDS } from "@/lib/avatar/studio";
import { ProceduralBody } from "./ProceduralBody";

export interface StageCaptureHandle {
  capture: () => string | null;
}

interface StageSceneProps {
  appearance: AvatarConfig & AvatarVisualExtras;
  pose: ProfilePose;
  backgroundId: string;
}

function StageContents({ appearance, pose, backgroundId }: StageSceneProps) {
  const bg = STUDIO_BACKGROUNDS[backgroundId] ?? STUDIO_BACKGROUNDS.default;

  return (
    <>
      <color attach="background" args={[bg.wall]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[2, 4, 3]} intensity={1.1} color="#ffffff" />
      <spotLight
        position={[0, 4, 2]}
        angle={0.45}
        penumbra={0.6}
        intensity={1.4}
        color={bg.spotColor}
        castShadow
      />
      <pointLight position={[-2, 2, 1]} intensity={0.35} color={bg.accent} />

      {/* Back wall */}
      <mesh position={[0, 2.2, -2.2]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color={bg.wall} />
      </mesh>
      {/* Floor / stage */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial color={bg.floor} metalness={0.2} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.35, 48]} />
        <meshStandardMaterial
          color={bg.accent}
          emissive={bg.accent}
          emissiveIntensity={0.25}
        />
      </mesh>

      <group position={[0, -0.22, 0]} rotation={[0, 0.15, 0]}>
        <ProceduralBody appearance={appearance} pose={pose} />
      </group>
    </>
  );
}

function GlBridge({
  onReady,
}: {
  onReady: (gl: THREE.WebGLRenderer) => void;
}) {
  const { gl } = useThree();
  useEffect(() => {
    onReady(gl);
  }, [gl, onReady]);
  return null;
}

interface AvatarStageCanvasProps {
  config?: AvatarConfig | null;
  equipped?: Record<string, string>;
  pose: ProfilePose;
  backgroundId: string;
  onGlReady?: (gl: THREE.WebGLRenderer) => void;
}

export const AvatarStageCanvas = forwardRef<
  StageCaptureHandle,
  AvatarStageCanvasProps
>(function AvatarStageCanvas(
  { config, equipped = {}, pose, backgroundId, onGlReady },
  ref
) {
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const appearance = resolveAvatarAppearance(config, equipped);

  useImperativeHandle(ref, () => ({
    capture: () => {
      const gl = glRef.current;
      if (!gl) return null;
      return gl.domElement.toDataURL("image/png");
    },
  }));

  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: [0, 0.95, 3.35], fov: 32, near: 0.1, far: 20 }}
      style={{ width: "100%", height: "100%" }}
      shadows
    >
      <GlBridge onReady={(gl) => { glRef.current = gl; onGlReady?.(gl); }} />
      <StageContents
        appearance={appearance}
        pose={pose}
        backgroundId={backgroundId}
      />
    </Canvas>
  );
});
