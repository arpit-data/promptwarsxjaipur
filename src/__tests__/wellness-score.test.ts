/**
 * @module wellness-score.test
 * @description Comprehensive unit tests for the wellness score computation engine.
 * Tests all individual scorers, the weighted computation, category classification,
 * and the end-to-end pipeline. Validates boundary conditions and edge cases.
 */

import { describe, it, expect } from "vitest";
import {
  scoreMood,
  scoreSleep,
  scoreStress,
  scoreStudy,
  scoreConsistency,
  computeBreakdown,
  computeWellnessScore,
  categorizeScore,
  calculateFullWellness,
} from "@/lib/wellness-score";
import type { CheckInFormData } from "@/types";

// ─── scoreMood ────────────────────────────────────────────────────────────────

describe("scoreMood", () => {
  it("returns 100 for Happy", () => {
    expect(scoreMood("Happy")).toBe(100);
  });

  it("returns 85 for Calm", () => {
    expect(scoreMood("Calm")).toBe(85);
  });

  it("returns 60 for Okay", () => {
    expect(scoreMood("Okay")).toBe(60);
  });

  it("returns 35 for Stressed", () => {
    expect(scoreMood("Stressed")).toBe(35);
  });

  it("returns 15 for Overwhelmed", () => {
    expect(scoreMood("Overwhelmed")).toBe(15);
  });
});

// ─── scoreSleep ───────────────────────────────────────────────────────────────

describe("scoreSleep", () => {
  it("returns 100 for optimal sleep (7-8.5 hours)", () => {
    expect(scoreSleep(7)).toBe(100);
    expect(scoreSleep(7.5)).toBe(100);
    expect(scoreSleep(8)).toBe(100);
    expect(scoreSleep(8.5)).toBe(100);
  });

  it("returns 75 for 6-7 hours", () => {
    expect(scoreSleep(6)).toBe(75);
    expect(scoreSleep(6.5)).toBe(75);
  });

  it("returns 50 for 5-6 hours", () => {
    expect(scoreSleep(5)).toBe(50);
    expect(scoreSleep(5.5)).toBe(50);
  });

  it("returns 30 for 4-5 hours", () => {
    expect(scoreSleep(4)).toBe(30);
    expect(scoreSleep(4.5)).toBe(30);
  });

  it("returns low score for extreme values", () => {
    expect(scoreSleep(0)).toBe(15);
    expect(scoreSleep(2)).toBe(15);
    expect(scoreSleep(14)).toBe(15);
  });

  it("handles oversleep correctly", () => {
    expect(scoreSleep(9)).toBe(80);
    expect(scoreSleep(10)).toBe(60);
  });

  it("clamps negative values", () => {
    expect(scoreSleep(-1)).toBe(15);
  });

  it("clamps values over 24", () => {
    expect(scoreSleep(25)).toBe(15);
  });
});

// ─── scoreStress ──────────────────────────────────────────────────────────────

describe("scoreStress", () => {
  it("returns highest score for lowest stress (1)", () => {
    expect(scoreStress(1)).toBe(100);
  });

  it("returns lowest score for highest stress (10)", () => {
    expect(scoreStress(10)).toBe(10);
  });

  it("returns mid-range score for mid stress (5)", () => {
    const score = scoreStress(5);
    expect(score).toBeGreaterThan(40);
    expect(score).toBeLessThan(70);
  });

  it("is inversely proportional to stress level", () => {
    expect(scoreStress(3)).toBeGreaterThan(scoreStress(7));
  });

  it("clamps values below 1", () => {
    expect(scoreStress(0)).toBe(scoreStress(1));
  });

  it("clamps values above 10", () => {
    expect(scoreStress(11)).toBe(scoreStress(10));
  });
});

// ─── scoreStudy ───────────────────────────────────────────────────────────────

describe("scoreStudy", () => {
  it("returns 100 for balanced study (4-8 hours)", () => {
    expect(scoreStudy(4)).toBe(100);
    expect(scoreStudy(6)).toBe(100);
    expect(scoreStudy(8)).toBe(100);
  });

  it("returns lower score for under-study", () => {
    expect(scoreStudy(1)).toBe(40);
    expect(scoreStudy(2)).toBe(60);
    expect(scoreStudy(3)).toBe(85);
  });

  it("returns lower score for over-study (burnout risk)", () => {
    expect(scoreStudy(9)).toBe(80);
    expect(scoreStudy(11)).toBe(55);
    expect(scoreStudy(13)).toBe(30);
  });

  it("handles zero study", () => {
    expect(scoreStudy(0)).toBe(40);
  });

  it("clamps negative values", () => {
    expect(scoreStudy(-1)).toBe(40);
  });
});

// ─── scoreConsistency ─────────────────────────────────────────────────────────

describe("scoreConsistency", () => {
  it("returns 20 for zero streak (first day)", () => {
    expect(scoreConsistency(0)).toBe(20);
  });

  it("returns 40 for 1-2 day streak", () => {
    expect(scoreConsistency(1)).toBe(40);
    expect(scoreConsistency(2)).toBe(40);
  });

  it("returns 60 for 3-6 day streak", () => {
    expect(scoreConsistency(3)).toBe(60);
    expect(scoreConsistency(5)).toBe(60);
  });

  it("returns 80 for 7-13 day streak", () => {
    expect(scoreConsistency(7)).toBe(80);
    expect(scoreConsistency(10)).toBe(80);
  });

  it("returns 90 for 14-29 day streak", () => {
    expect(scoreConsistency(14)).toBe(90);
    expect(scoreConsistency(20)).toBe(90);
  });

  it("returns 100 for 30+ day streak", () => {
    expect(scoreConsistency(30)).toBe(100);
    expect(scoreConsistency(100)).toBe(100);
  });

  it("monotonically increases with streak length", () => {
    const scores = [0, 1, 3, 7, 14, 30].map(scoreConsistency);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
    }
  });
});

// ─── computeBreakdown ─────────────────────────────────────────────────────────

describe("computeBreakdown", () => {
  const sampleCheckIn: CheckInFormData = {
    mood: "Happy",
    stressScore: 3,
    energyScore: 7,
    sleepHours: 7.5,
    studyHours: 6,
    confidenceLevel: 8,
    reflectionNote: "Feeling good today",
  };

  it("returns all five component scores", () => {
    const breakdown = computeBreakdown(sampleCheckIn, 5);
    expect(breakdown).toHaveProperty("mood");
    expect(breakdown).toHaveProperty("sleep");
    expect(breakdown).toHaveProperty("stress");
    expect(breakdown).toHaveProperty("study");
    expect(breakdown).toHaveProperty("consistency");
  });

  it("computes correct mood score", () => {
    const breakdown = computeBreakdown(sampleCheckIn, 5);
    expect(breakdown.mood).toBe(100); // Happy = 100
  });

  it("computes correct sleep score", () => {
    const breakdown = computeBreakdown(sampleCheckIn, 5);
    expect(breakdown.sleep).toBe(100); // 7.5 hours = optimal
  });

  it("computes correct study score", () => {
    const breakdown = computeBreakdown(sampleCheckIn, 5);
    expect(breakdown.study).toBe(100); // 6 hours = optimal
  });

  it("computes correct consistency score", () => {
    const breakdown = computeBreakdown(sampleCheckIn, 5);
    expect(breakdown.consistency).toBe(60); // 5-day streak
  });
});

// ─── computeWellnessScore ─────────────────────────────────────────────────────

describe("computeWellnessScore", () => {
  it("returns 100 for all perfect scores", () => {
    expect(computeWellnessScore({
      mood: 100, sleep: 100, stress: 100, study: 100, consistency: 100,
    })).toBe(100);
  });

  it("returns a value between 0 and 100", () => {
    const score = computeWellnessScore({
      mood: 50, sleep: 60, stress: 40, study: 70, consistency: 30,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("returns an integer", () => {
    const score = computeWellnessScore({
      mood: 73, sleep: 55, stress: 42, study: 88, consistency: 61,
    });
    expect(Number.isInteger(score)).toBe(true);
  });

  it("weights are applied correctly", () => {
    // Mood has weight 0.25, highest weight shared with stress
    const highMood = computeWellnessScore({ mood: 100, sleep: 50, stress: 50, study: 50, consistency: 50 });
    const lowMood = computeWellnessScore({ mood: 0, sleep: 50, stress: 50, study: 50, consistency: 50 });
    expect(highMood - lowMood).toBe(25); // 0.25 * 100
  });
});

// ─── categorizeScore ──────────────────────────────────────────────────────────

describe("categorizeScore", () => {
  it("classifies 80-100 as Healthy", () => {
    expect(categorizeScore(80)).toBe("Healthy");
    expect(categorizeScore(90)).toBe("Healthy");
    expect(categorizeScore(100)).toBe("Healthy");
  });

  it("classifies 60-79 as Moderate", () => {
    expect(categorizeScore(60)).toBe("Moderate");
    expect(categorizeScore(70)).toBe("Moderate");
    expect(categorizeScore(79)).toBe("Moderate");
  });

  it("classifies 40-59 as Elevated Stress", () => {
    expect(categorizeScore(40)).toBe("Elevated Stress");
    expect(categorizeScore(50)).toBe("Elevated Stress");
    expect(categorizeScore(59)).toBe("Elevated Stress");
  });

  it("classifies 0-39 as High Stress", () => {
    expect(categorizeScore(0)).toBe("High Stress");
    expect(categorizeScore(20)).toBe("High Stress");
    expect(categorizeScore(39)).toBe("High Stress");
  });
});

// ─── calculateFullWellness (end-to-end) ───────────────────────────────────────

describe("calculateFullWellness", () => {
  it("returns score, category, and breakdown", () => {
    const result = calculateFullWellness({
      mood: "Calm", stressScore: 4, energyScore: 6,
      sleepHours: 7, studyHours: 5, confidenceLevel: 7,
      reflectionNote: "Solid day",
    }, 10);

    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("category");
    expect(result).toHaveProperty("breakdown");
    expect(typeof result.score).toBe("number");
    expect(typeof result.category).toBe("string");
  });

  it("Happy + good sleep + low stress = Healthy category", () => {
    const result = calculateFullWellness({
      mood: "Happy", stressScore: 2, energyScore: 8,
      sleepHours: 7.5, studyHours: 6, confidenceLevel: 8,
      reflectionNote: "Great day",
    }, 14);

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.category).toBe("Healthy");
  });

  it("Overwhelmed + poor sleep + high stress = High Stress category", () => {
    const result = calculateFullWellness({
      mood: "Overwhelmed", stressScore: 9, energyScore: 2,
      sleepHours: 3, studyHours: 14, confidenceLevel: 2,
      reflectionNote: "Terrible day",
    }, 0);

    expect(result.score).toBeLessThan(40);
    expect(result.category).toBe("High Stress");
  });

  it("score is consistent across identical inputs", () => {
    const input: CheckInFormData = {
      mood: "Okay", stressScore: 5, energyScore: 5,
      sleepHours: 6, studyHours: 4, confidenceLevel: 5,
      reflectionNote: "",
    };
    const a = calculateFullWellness(input, 3);
    const b = calculateFullWellness(input, 3);
    expect(a.score).toBe(b.score);
    expect(a.category).toBe(b.category);
  });
});
