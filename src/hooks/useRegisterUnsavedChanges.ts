"use client";

import { useEffect } from "react";
import { useUnsavedChangesStore } from "@/stores/useUnsavedChangesStore";

export function useRegisterUnsavedChanges(
  dirty: boolean,
  message = "You have unsaved changes. Leave this page?"
) {
  const setDirty = useUnsavedChangesStore((s) => s.setDirty);
  const clear = useUnsavedChangesStore((s) => s.clear);

  useEffect(() => {
    setDirty(dirty, message);
    return () => clear();
  }, [dirty, message, setDirty, clear]);
}
