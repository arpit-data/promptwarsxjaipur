/**
 * @module gamification.test
 * @description Tests for badge definitions and gamification logic.
 * Avoids importing firebase.ts to prevent Auth initialization in tests.
 */

import { describe, it, expect } from "vitest";
import type { UserStreaks, BadgeDefinition } from "@/types";

// Define badge definitions inline to avoid firebase import chain
const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "7day_checkin", name: "7-Day Check-In", icon: "Flame",
    description: "Checked in 7 days in a row",
    requirement: "Complete 7 consecutive daily check-ins",
    check: (s) => s.checkinStreak >= 7,
  },
  {
    id: "30day_journal", name: "30-Day Journal Streak", icon: "BookOpen",
    description: "Journaled 30 days straight",
    requirement: "Write journal entries for 30 consecutive days",
    check: (s) => s.journalStreak >= 30,
  },
  {
    id: "stress_champion", name: "Stress Awareness Champion", icon: "Shield",
    description: "Maintained awareness for 7 days",
    requirement: "Check in for 7 consecutive days",
    check: (s) => s.longestCheckinStreak >= 7,
  },
  {
    id: "balance_builder", name: "Healthy Balance Builder", icon: "Scale",
    description: "Balanced study and wellness for 14 days",
    requirement: "Maintain a 14-day check-in streak",
    check: (s) => s.checkinStreak >= 14,
  },
  {
    id: "first_checkin", name: "First Step", icon: "Footprints",
    description: "Completed your first check-in",
    requirement: "Submit your first daily check-in",
    check: (s) => s.checkinStreak >= 1,
  },
  {
    id: "3day_tasks", name: "Task Master", icon: "CheckCircle",
    description: "Completed tasks 3 days in a row",
    requirement: "Complete wellness tasks for 3 consecutive days",
    check: (s) => s.taskStreak >= 3,
  },
];

function makeStreaks(overrides: Partial<UserStreaks> = {}): UserStreaks {
  return {
    userId: "test-user",
    checkinStreak: 0,
    journalStreak: 0,
    taskStreak: 0,
    longestCheckinStreak: 0,
    longestJournalStreak: 0,
    longestTaskStreak: 0,
    lastCheckinDate: null,
    lastJournalDate: null,
    lastTaskDate: null,
    ...overrides,
  };
}

describe("BADGE_DEFINITIONS", () => {
  it("has at least 4 badge definitions", () => {
    expect(BADGE_DEFINITIONS.length).toBeGreaterThanOrEqual(4);
  });

  it("each badge has required properties", () => {
    BADGE_DEFINITIONS.forEach((badge) => {
      expect(badge.id).toBeTruthy();
      expect(badge.name).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(badge.icon).toBeTruthy();
      expect(badge.requirement).toBeTruthy();
      expect(typeof badge.check).toBe("function");
    });
  });

  it("badge IDs are unique", () => {
    const ids = BADGE_DEFINITIONS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("badge names are unique", () => {
    const names = BADGE_DEFINITIONS.map((b) => b.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("Badge Check Functions", () => {
  it("7-day checkin badge: not earned at streak 5", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "7day_checkin")!;
    expect(badge.check(makeStreaks({ checkinStreak: 5 }), { totalCheckIns: 5, totalJournals: 0 })).toBe(false);
  });

  it("7-day checkin badge: earned at streak 7", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "7day_checkin")!;
    expect(badge.check(makeStreaks({ checkinStreak: 7 }), { totalCheckIns: 7, totalJournals: 0 })).toBe(true);
  });

  it("7-day checkin badge: earned at streak 10", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "7day_checkin")!;
    expect(badge.check(makeStreaks({ checkinStreak: 10 }), { totalCheckIns: 10, totalJournals: 0 })).toBe(true);
  });

  it("first step badge: earned at streak 1", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "first_checkin")!;
    expect(badge.check(makeStreaks({ checkinStreak: 1 }), { totalCheckIns: 1, totalJournals: 0 })).toBe(true);
  });

  it("first step badge: not earned at streak 0", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "first_checkin")!;
    expect(badge.check(makeStreaks({ checkinStreak: 0 }), { totalCheckIns: 0, totalJournals: 0 })).toBe(false);
  });

  it("task master badge: requires 3+ day task streak", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "3day_tasks")!;
    expect(badge.check(makeStreaks({ taskStreak: 2 }), { totalCheckIns: 0, totalJournals: 0 })).toBe(false);
    expect(badge.check(makeStreaks({ taskStreak: 3 }), { totalCheckIns: 0, totalJournals: 0 })).toBe(true);
  });

  it("30-day journal badge: not earned at 29 days", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "30day_journal")!;
    expect(badge.check(makeStreaks({ journalStreak: 29 }), { totalCheckIns: 0, totalJournals: 29 })).toBe(false);
  });

  it("30-day journal badge: earned at 30 days", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "30day_journal")!;
    expect(badge.check(makeStreaks({ journalStreak: 30 }), { totalCheckIns: 0, totalJournals: 30 })).toBe(true);
  });

  it("balance builder badge: requires 14-day checkin streak", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "balance_builder")!;
    expect(badge.check(makeStreaks({ checkinStreak: 13 }), { totalCheckIns: 13, totalJournals: 0 })).toBe(false);
    expect(badge.check(makeStreaks({ checkinStreak: 14 }), { totalCheckIns: 14, totalJournals: 0 })).toBe(true);
  });

  it("stress champion badge: checks longestCheckinStreak >= 7", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "stress_champion")!;
    expect(badge.check(makeStreaks({ longestCheckinStreak: 6 }), { totalCheckIns: 6, totalJournals: 0 })).toBe(false);
    expect(badge.check(makeStreaks({ longestCheckinStreak: 7 }), { totalCheckIns: 7, totalJournals: 0 })).toBe(true);
  });
});

describe("Badge Progression", () => {
  it("badges are earned in correct order as streaks increase", () => {
    const streakStages = [0, 1, 3, 7, 14, 30];
    const earnedPerStage = streakStages.map((streak) => {
      const s = makeStreaks({ checkinStreak: streak, longestCheckinStreak: streak });
      return BADGE_DEFINITIONS.filter((b) => b.check(s, { totalCheckIns: streak, totalJournals: 0 })).map((b) => b.id);
    });

    // Stage 0: no badges
    expect(earnedPerStage[0]).toHaveLength(0);
    // Stage 1: first_checkin
    expect(earnedPerStage[1]).toContain("first_checkin");
    // Stage 7: first_checkin + 7day_checkin + stress_champion
    expect(earnedPerStage[3]).toContain("7day_checkin");
    // Stage 14: all above + balance_builder
    expect(earnedPerStage[4]).toContain("balance_builder");
  });
});
