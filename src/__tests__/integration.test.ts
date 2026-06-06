/**
 * @module integration.test
 * @description Integration tests verifying the wellness pipeline end-to-end,
 * scoring algorithms work together, and data flow integrity.
 */

import { describe, it, expect } from "vitest";
import {
  calculateFullWellness,
  computeBreakdown,
  computeWellnessScore,
  categorizeScore,
} from "@/lib/wellness-score";
import { detectCrisis, getCrisisSystemPrompt, CRISIS_RESOURCES } from "@/lib/safety";
import { MOOD_OPTIONS, MOOD_SCORES, type CheckInFormData, type MoodOption } from "@/types";

describe("Integration: Full Wellness Pipeline", () => {
  // Generate test data for each mood
  const testScenarios: { mood: MoodOption; stress: number; sleep: number; study: number; streak: number; expectedCategory: string }[] = [
    { mood: "Happy", stress: 2, sleep: 8, study: 6, streak: 14, expectedCategory: "Healthy" },
    { mood: "Calm", stress: 3, sleep: 7, study: 5, streak: 7, expectedCategory: "Healthy" },
    { mood: "Okay", stress: 5, sleep: 6, study: 4, streak: 3, expectedCategory: "Moderate" },
    { mood: "Stressed", stress: 7, sleep: 5, study: 9, streak: 1, expectedCategory: "Elevated Stress" },
    { mood: "Overwhelmed", stress: 9, sleep: 3, study: 13, streak: 0, expectedCategory: "High Stress" },
  ];

  testScenarios.forEach(({ mood, stress, sleep, study, streak, expectedCategory }) => {
    it(`mood="${mood}" → category="${expectedCategory}"`, () => {
      const input: CheckInFormData = {
        mood,
        stressScore: stress,
        energyScore: 5,
        sleepHours: sleep,
        studyHours: study,
        confidenceLevel: 5,
        reflectionNote: "",
      };

      const result = calculateFullWellness(input, streak);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.category).toBe(expectedCategory);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.mood).toBe(MOOD_SCORES[mood]);
    });
  });
});

describe("Integration: Score Consistency", () => {
  it("higher mood + lower stress = higher score", () => {
    const goodDay: CheckInFormData = {
      mood: "Happy", stressScore: 2, energyScore: 8,
      sleepHours: 7.5, studyHours: 6, confidenceLevel: 8,
      reflectionNote: "",
    };
    const badDay: CheckInFormData = {
      mood: "Overwhelmed", stressScore: 9, energyScore: 2,
      sleepHours: 4, studyHours: 14, confidenceLevel: 2,
      reflectionNote: "",
    };

    const good = calculateFullWellness(goodDay, 7);
    const bad = calculateFullWellness(badDay, 0);

    expect(good.score).toBeGreaterThan(bad.score);
    expect(good.score - bad.score).toBeGreaterThan(30); // Significant difference
  });

  it("longer streak always produces equal or higher consistency score", () => {
    const input: CheckInFormData = {
      mood: "Okay", stressScore: 5, energyScore: 5,
      sleepHours: 7, studyHours: 5, confidenceLevel: 5,
      reflectionNote: "",
    };

    const short = calculateFullWellness(input, 1);
    const long = calculateFullWellness(input, 30);

    expect(long.score).toBeGreaterThanOrEqual(short.score);
  });
});

describe("Integration: Safety + Score Pipeline", () => {
  it("crisis detection does not interfere with scoring", () => {
    // Score should still work even if reflection note contains crisis words
    // (scoring should happen independently of safety checks)
    const input: CheckInFormData = {
      mood: "Stressed", stressScore: 7, energyScore: 3,
      sleepHours: 5, studyHours: 8, confidenceLevel: 3,
      reflectionNote: "Feeling hopeless about results",
    };

    // Safety system detects crisis
    const safetyCheck = detectCrisis(input.reflectionNote);
    expect(safetyCheck.isCrisis).toBe(true);

    // But scoring still produces valid results
    const result = calculateFullWellness(input, 2);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.category).toBeTruthy();
  });

  it("safety system provides valid crisis prompt for AI override", () => {
    const prompt = getCrisisSystemPrompt();
    expect(prompt).toContain("SAFETY OVERRIDE");
    expect(prompt.length).toBeGreaterThan(50);
    // Verify helpline numbers are in the prompt
    CRISIS_RESOURCES.helplines.forEach((h) => {
      expect(prompt).toContain(h.number);
    });
  });
});

describe("Integration: All Moods Score Correctly", () => {
  it("all mood options produce valid wellness results", () => {
    const baseInput = {
      stressScore: 5,
      energyScore: 5,
      sleepHours: 7,
      studyHours: 5,
      confidenceLevel: 5,
      reflectionNote: "Test",
    };

    MOOD_OPTIONS.forEach((mood) => {
      const result = calculateFullWellness({ ...baseInput, mood }, 5);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(["Healthy", "Moderate", "Elevated Stress", "High Stress"]).toContain(result.category);
      expect(result.breakdown.mood).toBe(MOOD_SCORES[mood]);
    });
  });

  it("mood scores are ordered: Happy > Calm > Okay > Stressed > Overwhelmed", () => {
    const baseInput = {
      stressScore: 5, energyScore: 5, sleepHours: 7,
      studyHours: 5, confidenceLevel: 5, reflectionNote: "",
    };

    const scores = MOOD_OPTIONS.map((mood) =>
      calculateFullWellness({ ...baseInput, mood }, 5).score
    );

    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
  });
});

describe("Integration: Boundary Conditions", () => {
  it("extreme positive input", () => {
    const result = calculateFullWellness({
      mood: "Happy", stressScore: 1, energyScore: 10,
      sleepHours: 7.5, studyHours: 6, confidenceLevel: 10,
      reflectionNote: "Best day ever",
    }, 30);

    expect(result.score).toBe(100);
    expect(result.category).toBe("Healthy");
  });

  it("extreme negative input", () => {
    const result = calculateFullWellness({
      mood: "Overwhelmed", stressScore: 10, energyScore: 1,
      sleepHours: 0, studyHours: 0, confidenceLevel: 1,
      reflectionNote: "",
    }, 0);

    expect(result.score).toBeLessThanOrEqual(25);
    expect(result.category).toBe("High Stress");
  });

  it("zero streak day one", () => {
    const result = calculateFullWellness({
      mood: "Okay", stressScore: 5, energyScore: 5,
      sleepHours: 7, studyHours: 5, confidenceLevel: 5,
      reflectionNote: "",
    }, 0);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.breakdown.consistency).toBe(20);
  });
});
