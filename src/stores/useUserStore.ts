import { create } from "zustand";
import type { Profile } from "@/lib/types/database";

interface UserStore {
  profile: Profile | null;
  userVoteIds: Record<string, "hype" | "dead">;
  setProfile: (p: Profile | null) => void;
  setUserVote: (trendId: string, vote: "hype" | "dead") => void;
  updateCredits: (credits: number) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  userVoteIds: {},
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
