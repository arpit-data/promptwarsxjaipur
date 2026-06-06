/**
 * @module insights.functions
 * @description AI insight storage and retrieval from Firestore.
 */

import {
  doc, setDoc, getDoc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import type { WellnessInsight } from "@/types";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Fetches today's AI-generated insights, or null if none generated yet. */
export async function getLatestInsights(userId: string): Promise<WellnessInsight | null> {
  const insightId = `${userId}_${todayKey()}`;
  const snap = await getDoc(doc(db, COLLECTIONS.WELLNESS_INSIGHTS, insightId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WellnessInsight;
}

/** Saves AI-generated insights for today. */
export async function saveInsights(
  userId: string,
  insights: string[],
  type: "daily" | "weekly" = "daily"
): Promise<void> {
  const insightId = `${userId}_${todayKey()}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (type === "weekly" ? 7 : 1));

  await setDoc(doc(db, COLLECTIONS.WELLNESS_INSIGHTS, insightId), {
    userId,
    insights,
    type,
    generatedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  });
}
