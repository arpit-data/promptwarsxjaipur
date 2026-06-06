/**
 * @module seed-data
 * @description Synthetic data for demonstration and development.
 * Provides realistic fallback data when Firestore is empty or unavailable.
 */

import type {
  DailyCheckIn, WellnessTask, JournalEntry, UserStreaks,
  WellnessInsight, Achievement, MoodOption,
} from "@/types";
import { MOOD_OPTIONS, MOOD_SCORES } from "@/types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Check-ins (last 14 days) ─────────────────────────────────────────────

const CHECKIN_MOODS: MoodOption[] = [
  "Happy", "Calm", "Okay", "Stressed", "Calm", "Happy", "Okay",
  "Calm", "Happy", "Stressed", "Okay", "Calm", "Happy", "Okay",
];

export const SEED_CHECKINS: DailyCheckIn[] = CHECKIN_MOODS.map((mood, i) => ({
  id: `seed_checkin_${i}`,
  userId: "seed_user",
  mood,
  stressScore: mood === "Stressed" ? 7 : mood === "Overwhelmed" ? 9 : mood === "Happy" ? 2 : 4,
  energyScore: mood === "Happy" ? 8 : mood === "Stressed" ? 3 : 6,
  sleepHours: mood === "Happy" ? 8 : mood === "Stressed" ? 5 : 7,
  studyHours: 5 + Math.floor(Math.random() * 4),
  confidenceLevel: mood === "Happy" ? 8 : mood === "Stressed" ? 4 : 6,
  reflectionNote: "",
  timestamp: null as any,
  dateKey: daysAgo(i),
}));

export const SEED_TODAY_CHECKIN: DailyCheckIn = {
  id: `seed_checkin_today`,
  userId: "seed_user",
  mood: "Calm",
  stressScore: 4,
  energyScore: 7,
  sleepHours: 7.5,
  studyHours: 6,
  confidenceLevel: 7,
  reflectionNote: "Feeling focused today. Got through organic chemistry revision.",
  timestamp: null as any,
  dateKey: todayKey(),
};

// ─── Wellness Tasks ───────────────────────────────────────────────────────

export const SEED_TASKS: WellnessTask[] = [
  { id: "t1", userId: "seed_user", label: "2-minute breathing", description: "Close your eyes and breathe deeply", type: "breathing", icon: "Wind", xpReward: 15, completed: true, completedAt: null, date: todayKey(), createdAt: null as any },
  { id: "t2", userId: "seed_user", label: "Quick journal entry", description: "Write a short reflection", type: "journal", icon: "Sparkles", xpReward: 20, completed: true, completedAt: null, date: todayKey(), createdAt: null as any },
  { id: "t3", userId: "seed_user", label: "10-min walk after study block", description: "Take a refreshing walk", type: "walk", icon: "Flame", xpReward: 15, completed: false, completedAt: null, date: todayKey(), createdAt: null as any },
  { id: "t4", userId: "seed_user", label: "Drink water — stay hydrated", description: "Drink a full glass of water", type: "hydration", icon: "Droplets", xpReward: 10, completed: true, completedAt: null, date: todayKey(), createdAt: null as any },
  { id: "t5", userId: "seed_user", label: "Sleep by 11:30 pm", description: "Get to bed on time", type: "sleep", icon: "Moon", xpReward: 20, completed: false, completedAt: null, date: todayKey(), createdAt: null as any },
];

// ─── Journal Entries ──────────────────────────────────────────────────────

export const SEED_JOURNALS: JournalEntry[] = [
  {
    id: "j1", userId: "seed_user", title: "Mock test anxiety",
    content: "Scored 180 in today's mock. Expected 220+. Feeling like I'm falling behind everyone. But then I reminded myself — last month I was at 140. Progress isn't linear.",
    tags: ["Anxiety", "Motivation"],
    aiSummary: "Student is experiencing performance anxiety but shows healthy self-awareness by recognizing progress over time.",
    createdAt: { seconds: Date.now() / 1000 - 86400 } as any, updatedAt: null as any, isDeleted: false,
  },
  {
    id: "j2", userId: "seed_user", title: "Good day today ✨",
    content: "Finally understood thermodynamics! The Pomodoro technique really worked. Took breaks, went for a walk, and felt so much better than yesterday.",
    tags: ["Motivation", "Gratitude"],
    aiSummary: "Positive study session with effective techniques. Student is building healthy study-wellness balance.",
    createdAt: { seconds: Date.now() / 1000 - 172800 } as any, updatedAt: null as any, isDeleted: false,
  },
  {
    id: "j3", userId: "seed_user", title: "Can't stop comparing",
    content: "My coaching batch topper scored 280 in the mock. I'm at 180. Sometimes I wonder if I'm even cut out for this. But my teacher said everyone has their own pace.",
    tags: ["Anxiety", "Anxiety"],
    aiSummary: "Comparison-driven stress is common. Student is receiving supportive guidance from teacher.",
    createdAt: { seconds: Date.now() / 1000 - 345600 } as any, updatedAt: null as any, isDeleted: false,
  },
  {
    id: "j4", userId: "seed_user", title: "Parents talk",
    content: "Had an honest conversation with mom about feeling pressured. She said she just wants me to be happy. Felt a huge weight lift off.",
    tags: ["Gratitude", "Gratitude"],
    aiSummary: "Healthy family communication helped reduce pressure. Student feels emotionally supported.",
    createdAt: { seconds: Date.now() / 1000 - 518400 } as any, updatedAt: null as any, isDeleted: false,
  },
  {
    id: "j5", userId: "seed_user", title: "Sleep experiment",
    content: "Tried sleeping by 10:30 instead of 1 AM. Woke up at 5:30 feeling incredible. Morning study session was 3x more productive than late night ones.",
    tags: ["Motivation", "Motivation"],
    aiSummary: "Sleep schedule change led to significant productivity improvement. Positive reinforcement for healthy habits.",
    createdAt: { seconds: Date.now() / 1000 - 604800 } as any, updatedAt: null as any, isDeleted: false,
  },
];

// ─── Streaks ──────────────────────────────────────────────────────────────

export const SEED_STREAKS: UserStreaks = {
  userId: "seed_user",
  checkinStreak: 7,
  journalStreak: 4,
  taskStreak: 5,
  longestCheckinStreak: 12,
  longestJournalStreak: 8,
  longestTaskStreak: 9,
  lastCheckinDate: todayKey(),
  lastJournalDate: daysAgo(0),
  lastTaskDate: todayKey(),
};

// ─── Insights ─────────────────────────────────────────────────────────────

export const SEED_INSIGHTS: WellnessInsight = {
  id: "insight_seed",
  userId: "seed_user",
  insights: [
    "Your mood has been consistently positive this week — great streak! 🌟",
    "You study best with 6-7 hours. Going past 9 hours correlates with higher stress.",
    "Sleep quality is your superpower — your best scores come after 7+ hours of sleep.",
    "Consider a 5-minute break every 45 minutes — it matches your energy patterns.",
  ],
  generatedAt: null as any,
  expiresAt: null as any,
  type: "daily",
};

// ─── Achievements ─────────────────────────────────────────────────────────

export const SEED_BADGES: Achievement[] = [
  { id: "b1", userId: "seed_user", badgeName: "First Step 👣", badgeId: "first_checkin", description: "First check-in completed", icon: "Check", earnedAt: null as any },
  { id: "b2", userId: "seed_user", badgeName: "7-Day Streak 🔥", badgeId: "7day_checkin", description: "7-day check-in streak reached", icon: "Flame", earnedAt: null as any },
  { id: "b3", userId: "seed_user", badgeName: "Task Master ✅", badgeId: "3day_tasks", description: "Tasks completed for 3 days", icon: "CheckSquare", earnedAt: null as any },
];

// ─── XP / Level ───────────────────────────────────────────────────────────

export const SEED_XP = 340;
export const SEED_LEVEL = 4;

// ─── Mood Analytics ───────────────────────────────────────────────────────

export const SEED_MOOD_TRENDS = CHECKIN_MOODS.slice(0, 7).reverse().map((mood, i) => ({
  date: daysAgo(6 - i),
  mood,
  moodScore: MOOD_SCORES[mood],
  energy: mood === "Happy" ? 80 : mood === "Stressed" ? 35 : 60,
  stressScore: mood === "Stressed" ? 7 : mood === "Happy" ? 2 : 4,
}));

export const SEED_WELLNESS_HISTORY = Array.from({ length: 7 }, (_, i) => ({
  dateKey: daysAgo(6 - i),
  score: 55 + Math.floor(Math.random() * 30) + (i * 3),
}));

export const SEED_STUDY_STRESS = Array.from({ length: 10 }, (_, i) => ({
  studyHours: 3 + Math.random() * 8,
  stressScore: 2 + Math.random() * 6,
}));

export const SEED_SLEEP_MOOD = Array.from({ length: 7 }, (_, i) => ({
  date: daysAgo(6 - i),
  sleepHours: 5 + Math.random() * 4,
  moodScore: 40 + Math.random() * 50,
}));

// ─── Profile defaults ────────────────────────────────────────────────────

export const SEED_EXAM_COUNTDOWN = {
  examType: "JEE Advanced" as const,
  examDate: (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  })(),
  daysRemaining: 90,
  weeksRemaining: 13,
  milestone: "3 months to go — you've got this! 💪",
};
