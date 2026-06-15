import { create } from "zustand";

interface AvatarStore {
  modelCache: Record<string, string>;
  setModelUrl: (userId: string, url: string) => void;
  getModelUrl: (userId: string) => string | undefined;
}

export const useAvatarStore = create<AvatarStore>((set, get) => ({
  modelCache: {},
  setModelUrl: (userId, url) =>
    set((s) => ({ modelCache: { ...s.modelCache, [userId]: url } })),
  getModelUrl: (userId) => get().modelCache[userId],
}));
