"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

export function useRequireAuth() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const showAuthModal = useAuthModalStore((s) => s.show);

  return function requireAuth(message = "Sign in to vote and earn credits") {
    if (!user) {
      showAuthModal(message);
      return false;
    }
    if (!profile) {
      router.push("/onboarding");
      return false;
    }
    return true;
  };
}
