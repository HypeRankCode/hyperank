import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/database";

interface UserStore {
  user: User | null;
  profile: Profile | null;
  userVoteIds: Record<string, "hype" | "dead">;
  setUser: (u: User | null) => void;
  setProfile: (p: Profile | null) => void;
  setUserVote: (trendId: string, vote: "hype" | "dead") => void;
  updateCredits: (credits: number) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  profile: null,
  userVoteIds: {},
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setUserVote: (trendId, vote) =>
    set((s) => ({
      userVoteIds: { ...s.userVoteIds, [trendId]: vote },
    })),
  updateCredits: (credits) =>
    set((s) =>
      s.profile ? { profile: { ...s.profile, credits } } : s
    ),
}));
