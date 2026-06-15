"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface PhotoCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

const PREVIEW_SIZE = 320;
const OUTPUT_SIZE = 512;

function coverScale(imgW: number, imgH: number, box: number) {
  return Math.max(box / imgW, box / imgH);
}

export function PhotoCropper({
  imageSrc,
  onCancel,
  onConfirm,
}: PhotoCropperProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setNatural({ w: img.width, h: img.height });
    img.src = imageSrc;
  }, [imageSrc]);

  const baseScale = natural
    ? coverScale(natural.w, natural.h, PREVIEW_SIZE)
    : 1;
  const displayW = natural ? natural.w * baseScale * zoom : PREVIEW_SIZE;
  const displayH = natural ? natural.h * baseScale * zoom : PREVIEW_SIZE;

  const crop = useCallback(() => {
    if (!natural) return;
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const outBase = coverScale(img.width, img.height, OUTPUT_SIZE);
      const scale = outBase * zoom;
      const dw = img.width * scale;
      const dh = img.height * scale;
      const ratio = OUTPUT_SIZE / PREVIEW_SIZE;
      const dx = (OUTPUT_SIZE - dw) / 2 + offset.x * ratio;
      const dy = (OUTPUT_SIZE - dh) / 2 + offset.y * ratio;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.drawImage(img, dx, dy, dw, dh);
      onConfirm(canvas.toDataURL("image/png"));
    };
    img.src = imageSrc;
  }, [imageSrc, zoom, offset, natural, onConfirm]);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)]">
        Drag to reposition. Zoom to frame face &amp; chest — this becomes your
        profile icon everywhere.
      </p>

      <div
        className="relative mx-auto overflow-hidden rounded-2xl border-2 border-red-500/40 bg-black"
        style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {natural && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageSrc}
            alt="Crop preview"
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              width: displayW,
              height: displayH,
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            }}
            draggable={false}
          />
        )}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-4 ring-inset ring-white/20" />
        <div className="pointer-events-none absolute left-3 top-3 rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-white/80">
          REC ●
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--text-secondary)]">Zoom</label>
        <input
          type="range"
          min={0.8}
          max={2.2}
          step={0.02}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="mt-1 w-full accent-red-500"
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Retake
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={crop}
          disabled={!natural}
        >
          Use this photo
        </Button>
      </div>
    </div>
  );
}
