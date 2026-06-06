/**
 * @module journal.functions
 * @description Firestore CRUD for the reflection journal.
 * Supports create, update, soft-delete, filtered queries, and streak tracking.
 */

import {
  doc, setDoc, getDoc, getDocs, updateDoc, collection,
  query, where, orderBy, limit as firestoreLimit,
  serverTimestamp,
} from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import type { JournalEntry, JournalTag } from "@/types";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Creates a new journal entry and updates the journal streak. */
export async function createJournalEntry(
  userId: string,
  data: { title: string; content: string; tags: JournalTag[] }
): Promise<string> {
  const entryRef = doc(collection(db, COLLECTIONS.JOURNAL_ENTRIES));

  await setDoc(entryRef, {
    userId,
    title: data.title,
    content: data.content,
    tags: data.tags,
    aiSummary: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDeleted: false,
  });

  // Update journal streak
  const streaksRef = doc(db, COLLECTIONS.STREAKS, userId);
  const streaksSnap = await getDoc(streaksRef);
  if (streaksSnap.exists()) {
    const streaks = streaksSnap.data();
    const lastDate = streaks.lastJournalDate;
    let newStreak = 1;
    if (lastDate === yesterdayKey()) {
      newStreak = (streaks.journalStreak || 0) + 1;
    } else if (lastDate === todayKey()) {
      newStreak = streaks.journalStreak || 1;
    }
    await updateDoc(streaksRef, {
      journalStreak: newStreak,
      longestJournalStreak: Math.max(streaks.longestJournalStreak || 0, newStreak),
      lastJournalDate: todayKey(),
    });
  }

  return entryRef.id;
}

/** Updates an existing journal entry. */
export async function updateJournalEntry(
  entryId: string,
  data: { title?: string; content?: string; tags?: JournalTag[]; aiSummary?: string }
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.JOURNAL_ENTRIES, entryId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Soft-deletes a journal entry (sets isDeleted flag). */
export async function deleteJournalEntry(entryId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.JOURNAL_ENTRIES, entryId), {
    isDeleted: true,
    updatedAt: serverTimestamp(),
  });
}

/** Queries journal entries with optional tag and search filters. */
export async function getJournalEntries(
  userId: string,
  opts?: { tag?: JournalTag; search?: string; maxResults?: number }
): Promise<JournalEntry[]> {
  const constraints: any[] = [
    where("userId", "==", userId),
    where("isDeleted", "==", false),
    orderBy("createdAt", "desc"),
  ];

  if (opts?.tag) {
    constraints.push(where("tags", "array-contains", opts.tag));
  }
  if (opts?.maxResults) {
    constraints.push(firestoreLimit(opts.maxResults));
  }

  const q = query(collection(db, COLLECTIONS.JOURNAL_ENTRIES), ...constraints);
  const snap = await getDocs(q);
  let entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as JournalEntry);

  // Client-side text search (Firestore doesn't support full-text)
  if (opts?.search) {
    const term = opts.search.toLowerCase();
    entries = entries.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        e.content.toLowerCase().includes(term)
    );
  }

  return entries;
}

/** Fetches a single journal entry by ID. */
export async function getJournalEntry(entryId: string): Promise<JournalEntry | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.JOURNAL_ENTRIES, entryId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as JournalEntry;
}
