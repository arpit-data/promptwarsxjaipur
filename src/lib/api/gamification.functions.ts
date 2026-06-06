/**
 * @module gamification.functions
 * @description XP system, leveling, badge/achievement management, and streaks.
 */

import {
  doc, setDoc, getDoc, getDocs, collection,
  query, where, serverTimestamp,
} from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import type { Achievement, UserStreaks, BadgeDefinition } from "@/types";

/** Badge definitions with automatic check conditions */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
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

/** Gets the user's streak document. */
export async function getStreaks(userId: string): Promise<UserStreaks> {
  const snap = await getDoc(doc(db, COLLECTIONS.STREAKS, userId));
  if (!snap.exists()) {
    return {
      userId, checkinStreak: 0, journalStreak: 0, taskStreak: 0,
      longestCheckinStreak: 0, longestJournalStreak: 0, longestTaskStreak: 0,
      lastCheckinDate: null, lastJournalDate: null, lastTaskDate: null,
    };
  }
  return snap.data() as UserStreaks;
}

/** Gets all earned badges for a user. */
export async function getBadges(userId: string): Promise<Achievement[]> {
  const q = query(
    collection(db, COLLECTIONS.ACHIEVEMENTS),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Achievement);
}

/** Checks badge eligibility and awards any newly earned badges. Returns newly awarded badges. */
export async function checkAndAwardBadges(userId: string): Promise<Achievement[]> {
  const streaks = await getStreaks(userId);
  const existingBadges = await getBadges(userId);
  const earnedIds = new Set(existingBadges.map((b) => b.badgeId));
  const newBadges: Achievement[] = [];

  for (const def of BADGE_DEFINITIONS) {
    if (earnedIds.has(def.id)) continue;

    const stats = { totalCheckIns: streaks.longestCheckinStreak, totalJournals: streaks.longestJournalStreak };
    if (def.check(streaks, stats)) {
      const badgeRef = doc(collection(db, COLLECTIONS.ACHIEVEMENTS));
      const badge: Omit<Achievement, "id"> = {
        userId,
        badgeId: def.id,
        badgeName: def.name,
        description: def.description,
        icon: def.icon,
        earnedAt: serverTimestamp() as any,
      };
      await setDoc(badgeRef, badge);
      newBadges.push({ id: badgeRef.id, ...badge });
    }
  }

  return newBadges;
}
