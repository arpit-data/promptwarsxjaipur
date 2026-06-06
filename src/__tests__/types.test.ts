/**
 * @module types.test
 * @description Tests verifying type system integrity, constant definitions,
 * and data mapping completeness.
 */

import { describe, it, expect } from "vitest";
import {
  EXAM_TYPES, MOOD_OPTIONS, MOOD_SCORES, MOOD_EMOJIS,
  JOURNAL_TAGS,
} from "@/types";

describe("EXAM_TYPES", () => {
  it("contains all target exams", () => {
    expect(EXAM_TYPES).toContain("JEE");
    expect(EXAM_TYPES).toContain("NEET");
    expect(EXAM_TYPES).toContain("UPSC");
    expect(EXAM_TYPES).toContain("GATE");
    expect(EXAM_TYPES).toContain("CAT");
    expect(EXAM_TYPES).toContain("CUET");
    expect(EXAM_TYPES).toContain("Class 10");
    expect(EXAM_TYPES).toContain("Class 12");
  });

  it("has at least 5 exam types", () => {
    expect(EXAM_TYPES.length).toBeGreaterThanOrEqual(5);
  });
});

describe("MOOD_OPTIONS", () => {
  it("has exactly 5 mood options", () => {
    expect(MOOD_OPTIONS.length).toBe(5);
  });

  it("ranges from positive to negative", () => {
    expect(MOOD_OPTIONS[0]).toBe("Happy");
    expect(MOOD_OPTIONS[4]).toBe("Overwhelmed");
  });
});

describe("MOOD_SCORES", () => {
  it("maps every mood option to a score", () => {
    MOOD_OPTIONS.forEach((mood) => {
      expect(MOOD_SCORES[mood]).toBeDefined();
      expect(typeof MOOD_SCORES[mood]).toBe("number");
    });
  });

  it("scores are in descending order from Happy to Overwhelmed", () => {
    expect(MOOD_SCORES.Happy).toBeGreaterThan(MOOD_SCORES.Calm);
    expect(MOOD_SCORES.Calm).toBeGreaterThan(MOOD_SCORES.Okay);
    expect(MOOD_SCORES.Okay).toBeGreaterThan(MOOD_SCORES.Stressed);
    expect(MOOD_SCORES.Stressed).toBeGreaterThan(MOOD_SCORES.Overwhelmed);
  });

  it("all scores are between 0 and 100", () => {
    Object.values(MOOD_SCORES).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});

describe("MOOD_EMOJIS", () => {
  it("maps every mood option to an emoji", () => {
    MOOD_OPTIONS.forEach((mood) => {
      expect(MOOD_EMOJIS[mood]).toBeDefined();
      expect(typeof MOOD_EMOJIS[mood]).toBe("string");
      expect(MOOD_EMOJIS[mood].length).toBeGreaterThan(0);
    });
  });
});

describe("JOURNAL_TAGS", () => {
  it("has at least 4 tags", () => {
    expect(JOURNAL_TAGS.length).toBeGreaterThanOrEqual(4);
  });

  it("includes expected tags", () => {
    expect(JOURNAL_TAGS).toContain("Anxiety");
    expect(JOURNAL_TAGS).toContain("Motivation");
    expect(JOURNAL_TAGS).toContain("Gratitude");
  });
});
