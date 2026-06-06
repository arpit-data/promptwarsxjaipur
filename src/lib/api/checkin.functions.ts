/**
 * @module checkin.functions
 * @description Firestore CRUD operations for daily mood check-ins.
 * Handles submission, streak updates, and wellness score computation.
 */

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import { calculateFullWellness } from "@/lib/wellness-score";
import type { DailyCheckIn, CheckInFormData, UserStreaks } from "@/types";

/** Returns today's date as YYYY-MM-DD */
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns yesterday's date as YYYY-MM-DD */
function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Submits a daily check-in, updates streaks, and saves wellness score.
 * Idempotent for the same day — overwrites if already submitted.
 */
export async function submitCheckIn(
  userId: string,
  data: CheckInFormData
): Promise<{ score: number; category: string }> {
  const dateKey = todayKey();
  const checkinId = `${userId}_${dateKey}`;

  // 1. Save check-in
  const checkinDoc: Omit<DailyCheckIn, "id"> = {
    userId,
    mood: data.mood,
    stressScore: data.stressScore,
    energyScore: data.energyScore,
    sleepHours: data.sleepHours,
    studyHours: data.studyHours,
    confidenceLevel: data.confidenceLevel,
    reflectionNote: data.reflectionNote,
    timestamp: serverTimestamp() as any,
    dateKey,
  };

  await setDoc(doc(db, COLLECTIONS.DAILY_CHECKINS, checkinId), checkinDoc);

  // 2. Update streaks
  const streaksRef = doc(db, COLLECTIONS.STREAKS, userId);
  const streaksSnap = await getDoc(streaksRef);
  let currentStreak = 1;

  if (streaksSnap.exists()) {
    const streaks = streaksSnap.data() as UserStreaks;
    const lastDate = streaks.lastCheckinDate;

    if (lastDate === yesterdayKey()) {
      currentStreak = streaks.checkinStreak + 1;
    } else if (lastDate === dateKey) {
      currentStreak = streaks.checkinStreak; // same day re-submit
    }

    await updateDoc(streaksRef, {
      checkinStreak: currentStreak,
      longestCheckinStreak: Math.max(
        streaks.longestCheckinStreak,
        currentStreak
      ),
      lastCheckinDate: dateKey,
    });
  } else {
    await setDoc(streaksRef, {
      userId,
      checkinStreak: 1,
      journalStreak: 0,
      taskStreak: 0,
      longestCheckinStreak: 1,
      longestJournalStreak: 0,
      longestTaskStreak: 0,
      lastCheckinDate: dateKey,
      lastJournalDate: null,
      lastTaskDate: null,
    });
  }

  // 3. Compute and save wellness score
  const { score, category, breakdown } = calculateFullWellness(
    data,
    currentStreak
  );

  const scoreId = `${userId}_${dateKey}`;
  await setDoc(doc(db, COLLECTIONS.WELLNESS_SCORES, scoreId), {
    userId,
    score,
    category,
    breakdown,
    timestamp: serverTimestamp(),
    dateKey,
  });

  return { score, category };
}

/** Fetches today's check-in for a user, or null if not submitted. */
export async function getTodayCheckIn(
  userId: string
): Promise<DailyCheckIn | null> {
  const checkinId = `${userId}_${todayKey()}`;
  const snap = await getDoc(doc(db, COLLECTIONS.DAILY_CHECKINS, checkinId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as DailyCheckIn;
}

/** Fetches the last N days of check-ins, ordered newest first. */
export async function getRecentCheckIns(
  userId: string,
  days: number
): Promise<DailyCheckIn[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startKey = startDate.toISOString().slice(0, 10);

  const q = query(
    collection(db, COLLECTIONS.DAILY_CHECKINS),
    where("userId", "==", userId),
    where("dateKey", ">=", startKey),
    orderBy("dateKey", "desc"),
    limit(days)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DailyCheckIn);
}
