// @ts-nocheck
"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  resolveAvatarAppearance,
  type AvatarConfig,
  type AvatarVisualExtras,
} from "@/lib/avatar/types";
import type { ProfilePose } from "@/lib/avatar/studio";
import { STUDIO_BACKGROUNDS } from "@/lib/avatar/studio";
import { ProceduralBody } from "./ProceduralBody";
import { AvatarDragRig } from "./AvatarDragRig";
import { StudioStage } from "./StudioStage";
import {
  attachWebGLContextGuard,
  CANVAS_DPR,
  CANVAS_GL_PROPS,
} from "@/lib/avatar/webgl";
import type { StudioViewState } from "./StudioViewControls";

export interface StageCaptureHandle {
  capture: () => string | null;
}

export interface StudioRotationState {
  yaw: number;
  pitch: number;
}

interface StageSceneProps {
  appearance: AvatarConfig & AvatarVisualExtras;
  pose: ProfilePose;
  backgroundId: string;
  view: StudioViewState;
  rotation: StudioRotationState;
}

const BASE_CAMERA = { x: 0, y: 0.78, z: 5.65, lookY: 0.68, fov: 40 };

function StudioCamera({ view }: { view: StudioViewState }) {
  const { camera } = useThree();
  const smooth = useRef({ panX: 0, panY: 0, zoom: 1 });

  useFrame((_, delta) => {
    const t = 1 - Math.exp(-delta * 10);
    smooth.current.panX += (view.panX - smooth.current.panX) * t;
    smooth.current.panY += (view.panY - smooth.current.panY) * t;
    smooth.current.zoom += (view.zoom - smooth.current.zoom) * t;

    const z = BASE_CAMERA.z / smooth.current.zoom;
    const x = BASE_CAMERA.x + smooth.current.panX;
    const y = BASE_CAMERA.y + smooth.current.panY;
    const lookY = BASE_CAMERA.lookY + smooth.current.panY;

    camera.position.set(x, y, z);
    camera.lookAt(x, lookY, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

function StageContents({
  appearance,
  pose,
  backgroundId,
  view,
  rotation,
}: StageSceneProps) {
  const bg = STUDIO_BACKGROUNDS[backgroundId] ?? STUDIO_BACKGROUNDS.default;

  return (
    <>
      <StudioCamera view={view} />
      <color attach="background" args={[bg.wall]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 5, 4]} intensity={1.1} color="#ffffff" castShadow />
      <spotLight
        position={[0, 4.5, 2.5]}
        angle={0.42}
        penumbra={0.65}
        intensity={1.2}
        color={bg.spotColor}
        castShadow
      />
      <pointLight position={[-2.5, 2, 2]} intensity={0.3} color={bg.accent} />
      <pointLight position={[2.5, 2, 2]} intensity={0.25} color={bg.accent} />

      <StudioStage bg={bg} />

      <AvatarDragRig
        mode="free"
        yaw={rotation.yaw}
        pitch={rotation.pitch}
        position={[0, 0.02, 0.12]}
      >
        <ProceduralBody appearance={appearance} pose={pose} />
      </AvatarDragRig>
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
  view: StudioViewState;
  rotation: StudioRotationState;
}

export const AvatarStageCanvas = forwardRef<
  StageCaptureHandle,
  AvatarStageCanvasProps
>(function AvatarStageCanvas(
  { config, equipped = {}, pose, backgroundId, view, rotation },
  ref
) {
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const appearance = resolveAvatarAppearance(config, equipped);

  const handleGlReady = useCallback((gl: THREE.WebGLRenderer) => {
    glRef.current = gl;
    attachWebGLContextGuard(gl);
  }, []);

  useImperativeHandle(ref, () => ({
    capture: () => {
      const gl = glRef.current;
      if (!gl) return null;
      return gl.domElement.toDataURL("image/png");
    },
  }));

  return (
    <Canvas
      gl={{ ...CANVAS_GL_PROPS, preserveDrawingBuffer: true }}
      dpr={CANVAS_DPR}
      camera={{ position: [0, BASE_CAMERA.y, BASE_CAMERA.z], fov: BASE_CAMERA.fov, near: 0.1, far: 20 }}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
      shadows
    >
      <GlBridge onReady={handleGlReady} />
      <StageContents
        appearance={appearance}
        pose={pose}
        backgroundId={backgroundId}
        view={view}
        rotation={rotation}
      />
    </Canvas>
  );
});
