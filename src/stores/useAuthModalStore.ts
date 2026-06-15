import { create } from "zustand";

interface AuthModalStore {
  open: boolean;
  message: string;
  show: (message?: string) => void;
  hide: () => void;
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  open: false,
  message: "Sign in to continue",
  show: (message = "Sign in to continue") => set({ open: true, message }),
  hide: () => set({ open: false }),
}));
