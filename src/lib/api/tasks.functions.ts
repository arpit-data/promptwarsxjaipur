/**
 * @module tasks.functions
 * @description Wellness task generation, completion, and XP awarding.
 */

import {
  doc, setDoc, getDoc, getDocs, updateDoc, collection,
  query, where, serverTimestamp, increment,
} from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import type { WellnessTask } from "@/types";

/** Static task templates generated daily */
const TASK_TEMPLATES: Omit<WellnessTask, "id" | "userId" | "completed" | "completedAt" | "date" | "createdAt">[] = [
  { label: "2-minute breathing", description: "Close your eyes and breathe deeply for 2 minutes", type: "breathing", icon: "Wind", xpReward: 15 },
  { label: "Quick journal entry", description: "Write a short reflection on your day", type: "journal", icon: "Sparkles", xpReward: 20 },
  { label: "10-min walk after study block", description: "Take a refreshing walk to reset your mind", type: "walk", icon: "Flame", xpReward: 15 },
  { label: "Drink water — stay hydrated", description: "Drink a full glass of water right now", type: "hydration", icon: "Droplets", xpReward: 10 },
  { label: "Sleep by 11:30 pm", description: "Get to bed on time for better focus tomorrow", type: "sleep", icon: "Moon", xpReward: 20 },
];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Generates daily tasks if none exist for today. Returns today's tasks. */
export async function generateDailyTasks(userId: string): Promise<WellnessTask[]> {
  const existing = await getTodayTasks(userId);
  if (existing.length > 0) return existing;

  const date = todayKey();
  const tasks: WellnessTask[] = [];

  for (const template of TASK_TEMPLATES) {
    const taskRef = doc(collection(db, COLLECTIONS.WELLNESS_TASKS));
    const task: any = {
      userId,
      ...template,
      completed: false,
      completedAt: null,
      date,
      createdAt: serverTimestamp(),
    };
    await setDoc(taskRef, task);
    tasks.push({ id: taskRef.id, ...task });
  }

  return tasks;
}

/** Marks a task complete and awards XP. */
export async function completeTask(
  taskId: string,
  userId: string
): Promise<{ xpAwarded: number }> {
  const taskRef = doc(db, COLLECTIONS.WELLNESS_TASKS, taskId);
  const taskSnap = await getDoc(taskRef);

  if (!taskSnap.exists()) throw new Error("Task not found");
  const task = taskSnap.data() as WellnessTask;
  if (task.completed) return { xpAwarded: 0 };

  // Mark complete
  await updateDoc(taskRef, {
    completed: true,
    completedAt: serverTimestamp(),
  });

  // Award XP
  const profileRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists()) {
    const currentXp = (profileSnap.data().xp || 0) + task.xpReward;
    const newLevel = Math.floor(currentXp / 100) + 1;
    await updateDoc(profileRef, {
      xp: currentXp,
      level: newLevel,
    });
  }

  // Update task streak
  const streaksRef = doc(db, COLLECTIONS.STREAKS, userId);
  const streaksSnap = await getDoc(streaksRef);
  if (streaksSnap.exists()) {
    const streaks = streaksSnap.data();
    const dateKey = todayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let newStreak = 1;
    if (streaks.lastTaskDate === yesterdayStr) {
      newStreak = (streaks.taskStreak || 0) + 1;
    } else if (streaks.lastTaskDate === dateKey) {
      newStreak = streaks.taskStreak || 1;
    }

    await updateDoc(streaksRef, {
      taskStreak: newStreak,
      longestTaskStreak: Math.max(streaks.longestTaskStreak || 0, newStreak),
      lastTaskDate: dateKey,
    });
  }

  return { xpAwarded: task.xpReward };
}

/** Fetches today's tasks for a user. */
export async function getTodayTasks(userId: string): Promise<WellnessTask[]> {
  const q = query(
    collection(db, COLLECTIONS.WELLNESS_TASKS),
    where("userId", "==", userId),
    where("date", "==", todayKey())
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WellnessTask);
}
