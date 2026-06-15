"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
          >
            <h2 className="font-display text-lg font-bold">{title}</h2>
            {description && (
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {description}
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                className={`flex-1 ${
                  variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Please wait…" : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
