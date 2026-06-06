/** @module useGamification — XP, badges, streaks hooks with seed fallback */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { SEED_STREAKS, SEED_BADGES, SEED_XP, SEED_LEVEL } from "@/lib/seed-data";
import type { UserStreaks } from "@/types";

export function useXP() {
  const { profile } = useAuth();
  const xp = profile?.xp ?? SEED_XP;
  const level = profile?.level ?? SEED_LEVEL;
  const xpForNextLevel = 100;
  const xpInLevel = xp % xpForNextLevel;
  return { xp, level, xpInLevel, xpForNextLevel };
}

export function useBadges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["badges", user?.uid],
    queryFn: async () => {
      try {
        const { getBadges } = await import("@/lib/api/gamification.functions");
        const badges = await getBadges(user!.uid);
        return badges.length > 0 ? badges : SEED_BADGES;
      } catch (e) {
        console.warn("[useBadges] Firestore unavailable, using seed data");
        return SEED_BADGES;
      }
    },
    enabled: !!user,
    staleTime: 120_000,
  });
}

export function useStreaks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["streaks", user?.uid],
    queryFn: async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db, COLLECTIONS } = await import("@/lib/firebase");
        const snap = await getDoc(doc(db, COLLECTIONS.STREAKS, user!.uid));
        if (snap.exists()) return snap.data() as UserStreaks;
        return SEED_STREAKS;
      } catch (e) {
        console.warn("[useStreaks] Firestore unavailable, using seed data");
        return SEED_STREAKS;
      }
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}
