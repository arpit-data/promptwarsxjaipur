/** @module useWellnessScore — Wellness score from check-in data with seed fallback */
import { useMemo } from "react";
import { useTodayCheckIn } from "./useCheckIn";
import { useStreaks } from "./useGamification";
import { calculateFullWellness } from "@/lib/wellness-score";
import { SEED_WELLNESS_HISTORY } from "@/lib/seed-data";

export function useWellnessScore() {
  const { data: checkIn, isLoading: checkInLoading } = useTodayCheckIn();
  const { data: streaks, isLoading: streaksLoading } = useStreaks();

  const result = useMemo(() => {
    if (!checkIn) return { score: 72, category: "Moderate" as const, breakdown: null };
    const streak = streaks?.checkinStreak ?? 0;
    return calculateFullWellness(
      {
        mood: checkIn.mood,
        stressScore: checkIn.stressScore,
        energyScore: checkIn.energyScore,
        sleepHours: checkIn.sleepHours,
        studyHours: checkIn.studyHours,
        confidenceLevel: checkIn.confidenceLevel,
        reflectionNote: checkIn.reflectionNote,
      },
      streak
    );
  }, [checkIn, streaks]);

  return {
    score: result.score,
    category: result.category,
    breakdown: result.breakdown,
    loading: checkInLoading || streaksLoading,
  };
}

export function useWellnessHistory(days: number = 7) {
  return { data: SEED_WELLNESS_HISTORY.slice(0, days), isLoading: false };
}
