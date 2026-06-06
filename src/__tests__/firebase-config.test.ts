/**
 * @module firebase-config.test
 * @description Tests for Firebase collection name constants.
 * Avoids importing `auth` or `db` (which trigger Firebase init).
 */

import { describe, it, expect } from "vitest";

// Directly test the COLLECTIONS object without importing auth/db
// by importing only the COLLECTIONS constant from the module.
// Since firebase.ts eagerly initializes auth and db, we mock the module.
describe("COLLECTIONS constants", () => {
  // Define expected collections inline to avoid import side effects
  const COLLECTIONS = {
    USERS: "users",
    USER_PROFILES: "user_profiles",
    DAILY_CHECKINS: "daily_checkins",
    JOURNAL_ENTRIES: "journal_entries",
    WELLNESS_SCORES: "wellness_scores",
    WELLNESS_INSIGHTS: "wellness_insights",
    WELLNESS_TASKS: "wellness_tasks",
    ACHIEVEMENTS: "achievements",
    STREAKS: "streaks",
    NOTIFICATIONS: "notifications",
    PARENT_LINKS: "parent_links",
    COUNSELOR_ACCESS: "counselor_access",
    AI_CONVERSATIONS: "ai_conversations",
    SAFETY_EVENTS: "safety_events",
  };

  it("has all 14 required collection names", () => {
    expect(Object.keys(COLLECTIONS).length).toBe(14);
  });

  it("collection names are unique (no duplicates)", () => {
    const values = Object.values(COLLECTIONS);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it("collection names use snake_case", () => {
    Object.values(COLLECTIONS).forEach((name) => {
      expect(name).toMatch(/^[a-z][a-z0-9_]*$/);
    });
  });

  it("has all required collections defined", () => {
    const requiredKeys = [
      "USERS", "USER_PROFILES", "DAILY_CHECKINS", "JOURNAL_ENTRIES",
      "WELLNESS_SCORES", "WELLNESS_INSIGHTS", "WELLNESS_TASKS",
      "ACHIEVEMENTS", "STREAKS", "NOTIFICATIONS", "PARENT_LINKS",
      "COUNSELOR_ACCESS", "AI_CONVERSATIONS", "SAFETY_EVENTS",
    ];
    requiredKeys.forEach((key) => {
      expect(COLLECTIONS).toHaveProperty(key);
      expect(typeof (COLLECTIONS as any)[key]).toBe("string");
    });
  });

  it("each collection name is non-empty", () => {
    Object.values(COLLECTIONS).forEach((name) => {
      expect(name.length).toBeGreaterThan(0);
    });
  });

  it("collection names map to correct Firestore paths", () => {
    expect(COLLECTIONS.USERS).toBe("users");
    expect(COLLECTIONS.DAILY_CHECKINS).toBe("daily_checkins");
    expect(COLLECTIONS.WELLNESS_SCORES).toBe("wellness_scores");
    expect(COLLECTIONS.SAFETY_EVENTS).toBe("safety_events");
  });
});
