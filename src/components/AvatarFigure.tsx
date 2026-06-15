// @ts-nocheck
"use client";

import { resolveAvatarAppearance } from "@/lib/avatar/types";
import {
  attachWebGLContextGuard,
  CANVAS_DPR,
  CANVAS_GL_PROPS,
} from "@/lib/avatar/webgl";
import { ProceduralBody } from "./avatar/ProceduralBody";
import { AvatarDragRig } from "./avatar/AvatarDragRig";
import {
  avatarDragCursorClass,
  avatarDragPointerProps,
  useAvatarDragRotation,
} from "@/hooks/useAvatarDragRotation";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";

interface AvatarFigureProps {
  config?: Parameters<typeof resolveAvatarAppearance>[0];
  equipped?: Record<string, string>;
  size?: "small" | "full";
  animate?: boolean;
  interactive?: boolean;
  /** When false, wrapper/canvas are transparent so a parent can show locker backgrounds */
  opaqueBackground?: boolean;
}

const AVATAR_LOOK_Y = 0.68;

function AvatarCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, AVATAR_LOOK_Y, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

function AvatarScene({
  appearance,
  drag,
}: {
  appearance: ReturnType<typeof resolveAvatarAppearance>;
  drag: ReturnType<typeof useAvatarDragRotation>;
}) {
  return (
    <>
      <AvatarCamera />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} />
      <pointLight position={[-2, 3, 2]} intensity={0.4} color="#e82222" />
      <AvatarDragRig
        mode="springSpin"
        yaw={drag.yaw}
        pitch={drag.pitch}
        isDragging={drag.isDragging}
        position={[0, 0.02, 0]}
        onDragEnd={() => {
          drag.setYaw(0);
          drag.setPitch(0);
        }}
      >
        <ProceduralBody appearance={appearance} pose="default" />
      </AvatarDragRig>
    </>
  );
}

export function AvatarFigure({
  config,
  equipped = {},
  size = "full",
  animate = true,
  interactive = true,
  opaqueBackground = true,
}: AvatarFigureProps) {
  const appearance = resolveAvatarAppearance(config, equipped);
  const isSmall = size === "small";
  const canInteract = interactive && !isSmall && animate;
  const drag = useAvatarDragRotation("springSpin");
  const pointerProps = canInteract ? avatarDragPointerProps(drag) : {};

  return (
    <div
      className={
        isSmall
          ? "h-20 w-20 overflow-hidden rounded-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]"
          : avatarDragCursorClass(canInteract && drag.isDragging) +
            " relative h-full min-h-[400px] w-full rounded-xl" +
            (opaqueBackground
              ? " bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]"
              : " bg-transparent")
      }
      {...pointerProps}
    >
      <Canvas
        camera={{ position: [0, AVATAR_LOOK_Y, 4.85], fov: 38 }}
        dpr={CANVAS_DPR}
        gl={{
          ...CANVAS_GL_PROPS,
          alpha: !opaqueBackground,
        }}
        onCreated={({ gl }) => {
          attachWebGLContextGuard(gl);
          if (!opaqueBackground) {
            gl.setClearColor(0x000000, 0);
          }
        }}
        style={{
          width: isSmall ? 80 : "100%",
          height: isSmall ? 80 : "100%",
          minHeight: isSmall ? 80 : 400,
          touchAction: "none",
        }}
      >
        <AvatarScene appearance={appearance} drag={drag} />
      </Canvas>
      {canInteract && (
        <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[10px] text-white/40">
          Drag to spin
        </p>
      )}
    </div>
  );
}
