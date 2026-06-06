/**
 * @module safety.test
 * @description Comprehensive tests for the crisis detection and safety system.
 * Tests phrase detection, case insensitivity, false positive/negative rates,
 * and helpline resource integrity.
 */

import { describe, it, expect } from "vitest";
import {
  detectCrisis,
  getCrisisSystemPrompt,
  CRISIS_RESOURCES,
} from "@/lib/safety";

// ─── Detection: Positive Cases ────────────────────────────────────────────────

describe("detectCrisis - crisis phrase detection", () => {
  const POSITIVE_CASES = [
    "I want to kill myself",
    "I've been thinking about self-harm",
    "I feel suicidal today",
    "I want to die",
    "I feel like ending my life",
    "end it all please",
    "I don't want to live anymore",
    "life is not worth living",
    "I'm better off dead",
    "there's no reason to live",
    "I feel hopeless about everything",
    "I've been hurting myself",
    "I can't go on like this",
    "nothing to live for",
    "I wanna die",
  ];

  POSITIVE_CASES.forEach((phrase) => {
    it(`detects: "${phrase}"`, () => {
      const result = detectCrisis(phrase);
      expect(result.isCrisis).toBe(true);
      expect(result.triggerPhrase).not.toBeNull();
      expect(result.responseMessage).not.toBeNull();
    });
  });
});

// ─── Detection: Case Insensitivity ────────────────────────────────────────────

describe("detectCrisis - case insensitivity", () => {
  it("detects uppercase input", () => {
    expect(detectCrisis("I WANT TO KILL MYSELF").isCrisis).toBe(true);
  });

  it("detects mixed case input", () => {
    expect(detectCrisis("I Feel Hopeless").isCrisis).toBe(true);
  });

  it("handles extra whitespace", () => {
    expect(detectCrisis("  self harm  ").isCrisis).toBe(true);
  });
});

// ─── Detection: Negative Cases (No False Positives) ──────────────────────────

describe("detectCrisis - safe messages (no false positives)", () => {
  const SAFE_MESSAGES = [
    "I'm feeling stressed about my JEE exam",
    "I had a bad day today",
    "My mock test scores are dropping",
    "I'm so tired of studying physics",
    "I feel anxious about my results",
    "Can you help me with a breathing exercise?",
    "I slept 4 hours last night",
    "I'm worried about my NEET preparation",
    "My parents are pressuring me",
    "I don't feel motivated today",
    "Help me manage my study schedule",
    "I need someone to talk to",
    "I'm overwhelmed with revision",
    "The syllabus feels endless",
    "",
    "hello",
  ];

  SAFE_MESSAGES.forEach((msg) => {
    it(`does NOT flag: "${msg}"`, () => {
      const result = detectCrisis(msg);
      expect(result.isCrisis).toBe(false);
      expect(result.triggerPhrase).toBeNull();
      expect(result.responseMessage).toBeNull();
    });
  });
});

// ─── Result Shape ─────────────────────────────────────────────────────────────

describe("detectCrisis - result shape", () => {
  it("returns correct shape for crisis", () => {
    const result = detectCrisis("I want to die");
    expect(result).toEqual({
      isCrisis: true,
      triggerPhrase: expect.any(String),
      responseMessage: expect.any(String),
    });
  });

  it("returns correct shape for safe message", () => {
    const result = detectCrisis("I'm doing well");
    expect(result).toEqual({
      isCrisis: false,
      triggerPhrase: null,
      responseMessage: null,
    });
  });
});

// ─── Crisis Resources ─────────────────────────────────────────────────────────

describe("CRISIS_RESOURCES", () => {
  it("has helpline entries", () => {
    expect(CRISIS_RESOURCES.helplines.length).toBeGreaterThan(0);
  });

  it("each helpline has name and number", () => {
    CRISIS_RESOURCES.helplines.forEach((h) => {
      expect(h.name).toBeTruthy();
      expect(h.number).toBeTruthy();
      expect(h.description).toBeTruthy();
    });
  });

  it("includes iCall helpline", () => {
    const iCall = CRISIS_RESOURCES.helplines.find((h) =>
      h.name.toLowerCase().includes("icall")
    );
    expect(iCall).toBeDefined();
  });

  it("includes Vandrevala Foundation helpline", () => {
    const vf = CRISIS_RESOURCES.helplines.find((h) =>
      h.name.toLowerCase().includes("vandrevala")
    );
    expect(vf).toBeDefined();
  });

  it("has a response message", () => {
    expect(CRISIS_RESOURCES.message).toBeTruthy();
    expect(typeof CRISIS_RESOURCES.message).toBe("string");
    expect(CRISIS_RESOURCES.message.length).toBeGreaterThan(50);
  });
});

// ─── getCrisisSystemPrompt ────────────────────────────────────────────────────

describe("getCrisisSystemPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = getCrisisSystemPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("contains helpline numbers", () => {
    const prompt = getCrisisSystemPrompt();
    expect(prompt).toContain("9152987821"); // iCall
    expect(prompt).toContain("1860-2662-345"); // Vandrevala
  });

  it("contains safety override instruction", () => {
    const prompt = getCrisisSystemPrompt();
    expect(prompt.toLowerCase()).toContain("safety override");
  });
});
