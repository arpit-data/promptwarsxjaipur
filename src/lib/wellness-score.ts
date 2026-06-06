/**
 * @module wellness-score
 * @description Wellness score computation engine.
 * Generates a 0–100 score based on mood, sleep, stress, study balance,
 * and consistency. Pure functions with no side effects for easy testing.
 *
 * Categories:
 *   80–100 → Healthy
 *   60–79  → Moderate
 *   40–59  → Elevated Stress
 *    0–39  → High Stress
 */

import type {
  WellnessBreakdown,
  WellnessCategory,
  MoodOption,
  CheckInFormData,
} from "@/types";
import { MOOD_SCORES } from "@/types";

// ─── Weight Constants ─────────────────────────────────────────────────────────

/** Individual weights must sum to 1.0 */
const WEIGHTS = {
  mood: 0.25,
  sleep: 0.2,
  stress: 0.25,
  study: 0.15,
  consistency: 0.15,
} as const;

// ─── Component Scorers ────────────────────────────────────────────────────────

/**
 * Maps mood to a 0–100 score using the predefined MOOD_SCORES.
 * @param mood - The selected mood option
 * @returns A value between 0 and 100
 */
export function scoreMood(mood: MoodOption): number {
  return MOOD_SCORES[mood] ?? 50;
}

/**
 * Scores sleep quality based on hours slept.
 * Optimal range: 7–8 hours. Both under- and over-sleeping reduce score.
 * @param hours - Hours slept (0–24)
 * @returns A value between 0 and 100
 */
export function scoreSleep(hours: number): number {
  const clamped = Math.max(0, Math.min(24, hours));
  if (clamped >= 7 && clamped <= 8.5) return 100;
  if (clamped >= 6 && clamped < 7) return 75;
  if (clamped >= 8.5 && clamped <= 9.5) return 80;
  if (clamped >= 5 && clamped < 6) return 50;
  if (clamped >= 9.5 && clamped <= 10) return 60;
  if (clamped >= 4 && clamped < 5) return 30;
  return 15; // extreme values
}

/**
 * Scores stress inversely — lower stress yields higher score.
 * @param stressLevel - Self-reported stress, 1 (low) to 10 (high)
 * @returns A value between 0 and 100
 */
export function scoreStress(stressLevel: number): number {
  const clamped = Math.max(1, Math.min(10, stressLevel));
  // Linear inverse: 1 → 100, 10 → 10
  return Math.round(((10 - clamped) / 9) * 90 + 10);
}

/**
 * Scores study balance. Rewards moderate study; penalises both
 * under-studying (< 2h) and over-studying (> 12h burnout risk).
 * @param hours - Hours studied today (0–24)
 * @returns A value between 0 and 100
 */
export function scoreStudy(hours: number): number {
  const clamped = Math.max(0, Math.min(24, hours));
  if (clamped >= 4 && clamped <= 8) return 100;
  if (clamped >= 3 && clamped < 4) return 85;
  if (clamped > 8 && clamped <= 10) return 80;
  if (clamped >= 2 && clamped < 3) return 60;
  if (clamped > 10 && clamped <= 12) return 55;
  if (clamped < 2) return 40;
  return 30; // > 12 h → burnout territory
}

/**
 * Scores consistency based on the current check-in streak.
 * @param streakDays - Consecutive days with a check-in
 * @returns A value between 0 and 100
 */
export function scoreConsistency(streakDays: number): number {
  if (streakDays >= 30) return 100;
  if (streakDays >= 14) return 90;
  if (streakDays >= 7) return 80;
  if (streakDays >= 3) return 60;
  if (streakDays >= 1) return 40;
  return 20; // first day or broken streak
}

// ─── Main Computation ─────────────────────────────────────────────────────────

/**
 * Computes the individual score breakdown.
 * @param checkIn - Today's check-in form data
 * @param streakDays - Current check-in streak length
 * @returns Breakdown with individual component scores (0–100 each)
 */
export function computeBreakdown(
  checkIn: CheckInFormData,
  streakDays: number
): WellnessBreakdown {
  return {
    mood: scoreMood(checkIn.mood),
    sleep: scoreSleep(checkIn.sleepHours),
    stress: scoreStress(checkIn.stressScore),
    study: scoreStudy(checkIn.studyHours),
    consistency: scoreConsistency(streakDays),
  };
}

/**
 * Computes the final weighted wellness score from a breakdown.
 * @param breakdown - The individual component scores
 * @returns An integer between 0 and 100
 */
export function computeWellnessScore(breakdown: WellnessBreakdown): number {
  const raw =
    breakdown.mood * WEIGHTS.mood +
    breakdown.sleep * WEIGHTS.sleep +
    breakdown.stress * WEIGHTS.stress +
    breakdown.study * WEIGHTS.study +
    breakdown.consistency * WEIGHTS.consistency;

  return Math.round(Math.max(0, Math.min(100, raw)));
}

/**
 * Classifies a wellness score into a category.
 * @param score - Wellness score, 0–100
 * @returns The category label
 */
export function categorizeScore(score: number): WellnessCategory {
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "Elevated Stress";
  return "High Stress";
}

/**
 * Full pipeline: check-in data → breakdown → score → category.
 * @param checkIn - Today's check-in
 * @param streakDays - Current streak
 * @returns Object with score, category, and detailed breakdown
 */
export function calculateFullWellness(
  checkIn: CheckInFormData,
  streakDays: number
): { score: number; category: WellnessCategory; breakdown: WellnessBreakdown } {
  const breakdown = computeBreakdown(checkIn, streakDays);
  const score = computeWellnessScore(breakdown);
  const category = categorizeScore(score);
  return { score, category, breakdown };
}
