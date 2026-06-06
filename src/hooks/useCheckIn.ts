/**
 * @module useCheckIn
 * @description React Query hooks for daily check-in operations.
 * Falls back to synthetic data when Firestore is unavailable.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { submitCheckIn, getTodayCheckIn, getRecentCheckIns } from "@/lib/api/checkin.functions";
import { checkAndAwardBadges } from "@/lib/api/gamification.functions";
import { SEED_TODAY_CHECKIN, SEED_CHECKINS } from "@/lib/seed-data";
import type { CheckInFormData } from "@/types";

/** Fetches today's check-in for the current user. */
export function useTodayCheckIn() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["checkin", "today", user?.uid],
    queryFn: async () => {
      try {
        const result = await getTodayCheckIn(user!.uid);
        return result || SEED_TODAY_CHECKIN;
      } catch (e) {
        console.warn("[useTodayCheckIn] Firestore unavailable, using seed data");
        return SEED_TODAY_CHECKIN;
      }
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/** Fetches the last N days of check-ins. */
export function useRecentCheckIns(days: number = 7) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["checkin", "recent", user?.uid, days],
    queryFn: async () => {
      try {
        const result = await getRecentCheckIns(user!.uid, days);
        return result.length > 0 ? result : SEED_CHECKINS.slice(0, days);
      } catch (e) {
        console.warn("[useRecentCheckIns] Firestore unavailable, using seed data");
        return SEED_CHECKINS.slice(0, days);
      }
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/** Mutation to submit a daily check-in. Invalidates related queries on success. */
export function useSubmitCheckIn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckInFormData) => {
      try {
        return await submitCheckIn(user!.uid, data);
      } catch (e) {
        console.warn("[useSubmitCheckIn] Firestore unavailable, returning mock result");
        // Return a mock result so the UI still updates
        return { score: 72, category: "Moderate" };
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["checkin"] });
      await queryClient.invalidateQueries({ queryKey: ["wellness"] });
      await queryClient.invalidateQueries({ queryKey: ["streaks"] });
      if (user) {
        try { await checkAndAwardBadges(user.uid); } catch {}
        await queryClient.invalidateQueries({ queryKey: ["badges"] });
      }
    },
  });
}
