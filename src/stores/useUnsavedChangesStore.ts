import { create } from "zustand";

interface UnsavedChangesStore {
  dirty: boolean;
  message: string;
  setDirty: (dirty: boolean, message?: string) => void;
  clear: () => void;
}

export const useUnsavedChangesStore = create<UnsavedChangesStore>((set) => ({
  dirty: false,
  message: "You have unsaved changes. Leave anyway?",
  setDirty: (dirty, message) =>
    set((s) => ({
      dirty,
      message: message ?? s.message,
    })),
  clear: () => set({ dirty: false }),
}));
