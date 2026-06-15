// @ts-nocheck
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type AvatarDragMode = "springSpin" | "free";

interface AvatarDragRigProps {
  mode: AvatarDragMode;
  yaw: number;
  pitch: number;
  isDragging?: boolean;
  position?: [number, number, number];
  onDragEnd?: () => void;
  children: React.ReactNode;
}

export function AvatarDragRig({
  mode,
  yaw,
  pitch,
  isDragging = false,
  position = [0, 0, 0],
  onDragEnd,
  children,
}: AvatarDragRigProps) {
  const rig = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const smoothOffset = useRef({ yaw: 0, pitch: 0 });
  const wasDragging = useRef(false);

  useFrame((_, delta) => {
    if (!rig.current) return;

    if (mode === "free") {
      rig.current.rotation.y = yaw;
      rig.current.rotation.x = pitch;
      return;
    }

    if (wasDragging.current && !isDragging) {
      spin.current += yaw;
      smoothOffset.current.yaw = 0;
      smoothOffset.current.pitch = 0;
      onDragEnd?.();
    }
    wasDragging.current = isDragging;

    spin.current += delta * 0.4;

    if (isDragging) {
      smoothOffset.current.yaw = yaw;
      smoothOffset.current.pitch = pitch;
    } else {
      const t = 1 - Math.exp(-delta * 6);
      smoothOffset.current.yaw += (0 - smoothOffset.current.yaw) * t;
      smoothOffset.current.pitch += (0 - smoothOffset.current.pitch) * t;
    }

    rig.current.rotation.y = spin.current + smoothOffset.current.yaw;
    rig.current.rotation.x = smoothOffset.current.pitch;
  });

  return (
    <group ref={rig} position={position}>
      {children}
    </group>
  );
}
