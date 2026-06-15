import type { WebGLRenderer } from "three";

/** Allows the browser to restore WebGL after tab switch / GPU pressure. */
export function attachWebGLContextGuard(gl: WebGLRenderer): () => void {
  const canvas = gl.domElement;
  const onLost = (e: Event) => e.preventDefault();
  canvas.addEventListener("webglcontextlost", onLost, false);
  return () => canvas.removeEventListener("webglcontextlost", onLost, false);
}

export const CANVAS_GL_PROPS = {
  preserveDrawingBuffer: false,
  antialias: true,
  powerPreference: "high-performance" as const,
};

export const CANVAS_DPR: [number, number] = [1, 1.5];
