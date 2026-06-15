"use client";

import { cn } from "@/lib/utils";

export interface StudioViewState {
  zoom: number;
  panX: number;
  panY: number;
}

export const STUDIO_VIEW_DEFAULT: StudioViewState = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

export const STUDIO_ZOOM_MIN = 0.72;
export const STUDIO_ZOOM_MAX = 1.28;
export const STUDIO_PAN_X_LIMIT = 0.4;
export const STUDIO_PAN_Y_LIMIT = 0.28;

interface StudioViewControlsProps {
  view: StudioViewState;
  onChange: (view: StudioViewState) => void;
  onReset: () => void;
  className?: string;
}

function ControlButton({
  label,
  onClick,
  children,
  active,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border transition",
        active
          ? "border-red-500/40 bg-red-500/15 text-red-300"
          : "border-white/10 bg-black/50 text-white/80 hover:border-white/20 hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}

export function StudioViewControls({
  view,
  onChange,
  onReset,
  className,
}: StudioViewControlsProps) {
  const clampPan = (panX: number, panY: number) => ({
    panX: Math.max(-STUDIO_PAN_X_LIMIT, Math.min(STUDIO_PAN_X_LIMIT, panX)),
    panY: Math.max(-STUDIO_PAN_Y_LIMIT, Math.min(STUDIO_PAN_Y_LIMIT, panY)),
  });

  const setZoom = (zoom: number) =>
    onChange({
      ...view,
      zoom: Math.max(STUDIO_ZOOM_MIN, Math.min(STUDIO_ZOOM_MAX, zoom)),
    });

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <ControlButton label="Zoom out" onClick={() => setZoom(view.zoom - 0.08)}>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path d="M8 11h6M21 21l-4.35-4.35" />
        </svg>
      </ControlButton>
      <ControlButton label="Zoom in" onClick={() => setZoom(view.zoom + 0.08)}>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path d="M11 8v6M8 11h6M21 21l-4.35-4.35" />
        </svg>
      </ControlButton>

      <ControlButton
        label="Pan left"
        onClick={() => onChange({ ...view, ...clampPan(view.panX - 0.08, view.panY) })}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </ControlButton>
      <ControlButton
        label="Pan right"
        onClick={() => onChange({ ...view, ...clampPan(view.panX + 0.08, view.panY) })}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      </ControlButton>
      <ControlButton
        label="Pan up"
        onClick={() => onChange({ ...view, ...clampPan(view.panX, view.panY + 0.06) })}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 15l6-6 6 6" />
        </svg>
      </ControlButton>
      <ControlButton
        label="Pan down"
        onClick={() => onChange({ ...view, ...clampPan(view.panX, view.panY - 0.06) })}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </ControlButton>

      <ControlButton label="Reset view" onClick={onReset}>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 12a9 9 0 109-9 9 9 0 00-2.5 6.2M3 4v5h5" />
        </svg>
      </ControlButton>

      <div className="ml-1 hidden min-w-[5rem] text-center font-mono text-[10px] text-white/50 sm:block">
        {Math.round(view.zoom * 100)}%
      </div>
    </div>
  );
}
