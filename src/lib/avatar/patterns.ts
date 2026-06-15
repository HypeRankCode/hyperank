import * as THREE from "three";

export type PatternId =
  | "solid"
  | "camo"
  | "denim"
  | "fire"
  | "hyperank"
  | "gold"
  | "silver"
  | "knit";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, a = 1) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export function createPatternTexture(
  pattern: PatternId,
  baseColor: string,
  size = 128
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  switch (pattern) {
    case "camo": {
      const blobs = [
        { c: "#4a5d3a", x: 0.2, y: 0.25, r: 0.22 },
        { c: "#2f3d24", x: 0.65, y: 0.2, r: 0.18 },
        { c: "#6b7c52", x: 0.45, y: 0.55, r: 0.2 },
        { c: "#1e2818", x: 0.15, y: 0.7, r: 0.16 },
        { c: "#5a6b42", x: 0.78, y: 0.65, r: 0.19 },
        { c: "#3a4a2e", x: 0.35, y: 0.85, r: 0.14 },
      ];
      for (const b of blobs) {
        ctx.fillStyle = b.c;
        ctx.beginPath();
        ctx.ellipse(b.x * size, b.y * size, b.r * size, b.r * size * 0.85, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "denim": {
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = rgba("#1e3a5f", 0.35);
      ctx.lineWidth = 1;
      for (let i = -size; i < size * 2; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + size, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i + size, 0);
        ctx.lineTo(i, size);
        ctx.stroke();
      }
      ctx.fillStyle = rgba("#ffffff", 0.06);
      for (let y = 0; y < size; y += 14) {
        ctx.fillRect(0, y, size, 2);
      }
      break;
    }
    case "fire": {
      const flames = ["#ff2b2b", "#ff6b35", "#ffc933", "#ff4500"];
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = flames[i % flames.length];
        const x = (i * 37) % size;
        const y = (i * 23) % size;
        ctx.beginPath();
        ctx.moveTo(x, y + 20);
        ctx.quadraticCurveTo(x + 8, y, x + 16, y + 20);
        ctx.quadraticCurveTo(x + 8, y + 12, x, y + 20);
        ctx.fill();
      }
      ctx.fillStyle = rgba("#000000", 0.15);
      ctx.fillRect(0, 0, size, size);
      break;
    }
    case "hyperank": {
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = rgba("#ffffff", 0.2);
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(0, size * 0.35);
      ctx.lineTo(size, size * 0.65);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${size * 0.28}px system-ui,sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("HR", size / 2, size / 2);
      break;
    }
    case "gold": {
      const grd = ctx.createLinearGradient(0, 0, size, size);
      grd.addColorStop(0, "#fff4c2");
      grd.addColorStop(0.35, "#ffc933");
      grd.addColorStop(0.65, "#d4a017");
      grd.addColorStop(1, "#fff8dc");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = rgba("#ffffff", 0.35);
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        ctx.strokeRect(i * 14, i * 10, size - i * 28, size - i * 20);
      }
      break;
    }
    case "silver": {
      const grd = ctx.createLinearGradient(0, 0, size, size);
      grd.addColorStop(0, "#f0f0f0");
      grd.addColorStop(0.5, "#b8b8b8");
      grd.addColorStop(1, "#e8e8e8");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size, size);
      break;
    }
    case "knit": {
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = rgba("#ffffff", 0.12);
      ctx.lineWidth = 1;
      for (let y = 0; y < size; y += 8) {
        for (let x = (y % 16) / 2; x < size; x += 8) {
          ctx.strokeRect(x, y, 6, 6);
        }
      }
      break;
    }
    default:
      break;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
