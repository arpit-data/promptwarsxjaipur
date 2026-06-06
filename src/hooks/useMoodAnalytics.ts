/** @module useMoodAnalytics — Analytics data hooks with seed fallback */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useRecentCheckIns } from "./useCheckIn";
import { SEED_MOOD_TRENDS, SEED_STUDY_STRESS, SEED_SLEEP_MOOD } from "@/lib/seed-data";
import { MOOD_SCORES } from "@/types";

export function useMoodTrends(period: "week" | "month" = "week") {
  const days = period === "week" ? 7 : 30;
  const { data: checkIns } = useRecentCheckIns(days);

  const trends = (checkIns && checkIns.length > 0)
    ? checkIns.map((c) => ({
        date: c.dateKey,
        mood: c.mood,
        moodScore: MOOD_SCORES[c.mood],
        energy: c.energyScore * 10,
        stressScore: c.stressScore,
      })).reverse()
    : SEED_MOOD_TRENDS;

  return { data: trends, isLoading: false };
}

export function useStudyStressCorrelation() {
  const { data: checkIns } = useRecentCheckIns(14);

  const correlation = (checkIns && checkIns.length > 3)
    ? checkIns.map((c) => ({
        studyHours: c.studyHours,
        stressScore: c.stressScore,
      }))
    : SEED_STUDY_STRESS;

  return { data: correlation, isLoading: false };
}

export function useSleepMoodCorrelation() {
  const { data: checkIns } = useRecentCheckIns(7);

  const correlation = (checkIns && checkIns.length > 0)
    ? checkIns.map((c) => ({
        date: c.dateKey,
        sleepHours: c.sleepHours,
        moodScore: MOOD_SCORES[c.mood],
      })).reverse()
    : SEED_SLEEP_MOOD;

  return { data: correlation, isLoading: false };
}

export function useBurnoutIndicators() {
  const { data: checkIns } = useRecentCheckIns(7);

  if (!checkIns || checkIns.length < 3) {
    return { data: { isAtRisk: false, message: null }, isLoading: false };
  }

  const avgStress = checkIns.reduce((sum, c) => sum + c.stressScore, 0) / checkIns.length;
  const avgSleep = checkIns.reduce((sum, c) => sum + c.sleepHours, 0) / checkIns.length;
  const highStressDays = checkIns.filter((c) => c.stressScore >= 7).length;

  const isAtRisk = avgStress >= 7 || avgSleep < 5 || highStressDays >= 3;
  const message = isAtRisk
    ? `Your average stress is ${avgStress.toFixed(1)}/10 with ${avgSleep.toFixed(1)}h average sleep. Consider taking breaks and prioritizing rest.`
    : null;

  return { data: { isAtRisk, message }, isLoading: false };
}
