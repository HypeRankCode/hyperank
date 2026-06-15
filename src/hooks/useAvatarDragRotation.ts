// @ts-nocheck
"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function useAvatarDragRotation(mode: "springSpin" | "free") {
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0, yaw: 0, pitch: 0 });
  const panMode = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    pointerId.current = e.pointerId;
    panMode.current = e.shiftKey;
    origin.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: mode === "free" ? yaw : 0,
      pitch: mode === "free" ? pitch : 0,
    };
    if (!panMode.current) setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [yaw, pitch, mode]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    setIsDragging(false);
    if (mode === "springSpin") {
      setYaw(0);
      setPitch(0);
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, [mode]);

  const resetRotation = useCallback(() => {
    setYaw(0);
    setPitch(0);
  }, []);

  return {
    yaw,
    pitch,
    isDragging,
    panMode,
    setYaw,
    setPitch,
    resetRotation,
    onPointerDown,
    onPointerUp,
    origin,
    pointerId,
  };
}

export function avatarDragPointerProps(
  drag: ReturnType<typeof useAvatarDragRotation>,
  options?: {
    onPanStart?: () => void;
    onPanMove?: (dx: number, dy: number) => void;
  }
) {
  return {
    onPointerDown: (e: React.PointerEvent) => {
      options?.onPanStart?.();
      drag.onPointerDown(e);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (drag.pointerId.current !== e.pointerId) return;
      const dx = e.clientX - drag.origin.current.x;
      const dy = e.clientY - drag.origin.current.y;

      if (drag.panMode.current || e.shiftKey) {
        options?.onPanMove?.(dx, dy);
        return;
      }

      drag.setYaw(drag.origin.current.yaw + dx * 0.012);
      drag.setPitch(
        Math.max(-0.3, Math.min(0.3, drag.origin.current.pitch + dy * 0.006))
      );
    },
    onPointerUp: drag.onPointerUp,
    onPointerLeave: drag.onPointerUp,
  };
}

export function avatarDragCursorClass(isDragging: boolean) {
  return cn(
    "touch-none select-none",
    isDragging ? "cursor-grabbing" : "cursor-grab"
  );
}
