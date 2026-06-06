/**
 * @module types
 * @description Central type definitions for MindMate AI.
 * All Firestore document shapes, enums, and shared interfaces live here
 * to enforce a single source of truth across the codebase.
 */

import type { Timestamp } from "firebase/firestore";

// ─── Enums ────────────────────────────────────────────────────────────────────

/** Supported competitive exams */
export const EXAM_TYPES = [
  "JEE",
  "NEET",
  "UPSC",
  "CAT",
  "GATE",
  "CUET",
  "Class 10",
  "Class 12",
] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

/** Mood options for daily check-in */
export const MOOD_OPTIONS = [
  "Happy",
  "Calm",
  "Okay",
  "Stressed",
  "Overwhelmed",
] as const;
export type MoodOption = (typeof MOOD_OPTIONS)[number];

/** Mood numeric mapping for scoring */
export const MOOD_SCORES: Record<MoodOption, number> = {
  Happy: 100,
  Calm: 85,
  Okay: 60,
  Stressed: 35,
  Overwhelmed: 15,
};

/** Mood emoji mapping */
export const MOOD_EMOJIS: Record<MoodOption, string> = {
  Happy: "😊",
  Calm: "🌟",
  Okay: "🌤",
  Stressed: "⚡",
  Overwhelmed: "🌧",
};

/** Journal entry tags */
export const JOURNAL_TAGS = [
  "Anxiety",
  "Motivation",
  "Confidence",
  "Burnout",
  "Gratitude",
] as const;
export type JournalTag = (typeof JOURNAL_TAGS)[number];

/** Wellness score categories */
export type WellnessCategory =
  | "Healthy"
  | "Moderate"
  | "Elevated Stress"
  | "High Stress";

/** User roles for access control */
export type UserRole = "student" | "parent" | "counselor";

// ─── Firestore Document Types ─────────────────────────────────────────────────

/** User account (top-level auth record) */
export interface UserDocument {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Timestamp;
}

/** Student profile with exam and preference details */
export interface UserProfile {
  uid: string;
  name: string;
  age: number | null;
  examType: ExamType;
  examDate: string; // ISO date string
  classLevel: string;
  dailyStudyTarget: number; // hours
  preferredLanguage: string;
  xp: number;
  level: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Daily mood and wellness check-in */
export interface DailyCheckIn {
  id?: string;
  userId: string;
  mood: MoodOption;
  stressScore: number; // 1–10
  energyScore: number; // 1–10
  sleepHours: number;
  studyHours: number;
  confidenceLevel: number; // 1–10
  reflectionNote: string;
  timestamp: Timestamp;
  /** ISO date string "YYYY-MM-DD" for querying */
  dateKey: string;
}

/** Journal reflection entry */
export interface JournalEntry {
  id?: string;
  userId: string;
  title: string;
  content: string;
  tags: JournalTag[];
  aiSummary: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDeleted: boolean;
}

/** Computed wellness score */
export interface WellnessScore {
  id?: string;
  userId: string;
  score: number; // 0–100
  category: WellnessCategory;
  breakdown: WellnessBreakdown;
  timestamp: Timestamp;
  dateKey: string;
}

/** Individual components of the wellness score */
export interface WellnessBreakdown {
  mood: number;
  sleep: number;
  stress: number;
  study: number;
  consistency: number;
}

/** AI-generated wellness insight */
export interface WellnessInsight {
  id?: string;
  userId: string;
  insights: string[];
  type: "daily" | "weekly";
  generatedAt: Timestamp;
  expiresAt: Timestamp;
}

/** Wellness task for daily to-do list */
export interface WellnessTask {
  id?: string;
  userId: string;
  label: string;
  description: string;
  type: "breathing" | "walk" | "journal" | "hydration" | "sleep" | "custom";
  icon: string; // Lucide icon name
  completed: boolean;
  completedAt: Timestamp | null;
  xpReward: number;
  date: string; // ISO date string
  createdAt: Timestamp;
}

/** Achievement / badge */
export interface Achievement {
  id?: string;
  userId: string;
  badgeId: string;
  badgeName: string;
  description: string;
  icon: string;
  earnedAt: Timestamp;
}

/** User streaks tracking */
export interface UserStreaks {
  userId: string;
  checkinStreak: number;
  journalStreak: number;
  taskStreak: number;
  longestCheckinStreak: number;
  longestJournalStreak: number;
  longestTaskStreak: number;
  lastCheckinDate: string | null;
  lastJournalDate: string | null;
  lastTaskDate: string | null;
}

/** Notification record */
export interface NotificationRecord {
  id?: string;
  userId: string;
  type: "checkin" | "break" | "sleep" | "journal" | "motivation";
  message: string;
  read: boolean;
  createdAt: Timestamp;
  scheduledFor: Timestamp | null;
}

/** Parent-student link */
export interface ParentLink {
  id?: string;
  parentUserId: string;
  studentUserId: string;
  accessCode: string;
  active: boolean;
  createdAt: Timestamp;
}

/** Counselor access */
export interface CounselorAccess {
  id?: string;
  counselorUserId: string;
  studentUserIds: string[];
  institutionName: string;
  createdAt: Timestamp;
}

/** AI conversation */
export interface AIConversation {
  id?: string;
  userId: string;
  messages: AIConversationMessage[];
  startedAt: Timestamp;
  lastMessageAt: Timestamp;
  mood: string;
}

export interface AIConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Timestamp;
}

/** Safety event log */
export interface SafetyEvent {
  id?: string;
  userId: string;
  triggerPhrase: string;
  timestamp: Timestamp;
  responseGiven: string;
  acknowledged: boolean;
}

// ─── Client-side Computed Types ──────────────────────────────────────────────

/** Registration form data */
export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  classLevel: string;
  examType: ExamType;
  examDate: string;
}

/** Profile form data */
export interface ProfileFormData {
  name: string;
  age: number | null;
  examType: ExamType;
  examDate: string;
  dailyStudyTarget: number;
  preferredLanguage: string;
}

/** Check-in form data */
export interface CheckInFormData {
  mood: MoodOption;
  stressScore: number;
  energyScore: number;
  sleepHours: number;
  studyHours: number;
  confidenceLevel: number;
  reflectionNote: string;
}

/** Badge definitions (static) */
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  check: (streaks: UserStreaks, stats: { totalCheckIns: number; totalJournals: number }) => boolean;
}

/** Exam countdown data */
export interface ExamCountdown {
  examType: ExamType;
  examDate: string;
  daysRemaining: number;
  weeksRemaining: number;
  milestone: string | null;
}

/** Parent dashboard view (sanitized data) */
export interface ParentDashboardData {
  studentName: string;
  wellnessScoreTrend: { date: string; score: number }[];
  currentStreak: number;
  tasksCompletedToday: number;
  totalTasksToday: number;
  averageWellnessScore: number;
  suggestions: string[];
}

/** Counselor dashboard view (aggregated data) */
export interface CounselorDashboardData {
  totalStudents: number;
  averageWellnessScore: number;
  engagementRate: number;
  riskIndicators: RiskIndicator[];
  trendData: { date: string; avgScore: number; checkInRate: number }[];
}

export interface RiskIndicator {
  studentId: string;
  studentName: string;
  indicator: string;
  severity: "low" | "medium" | "high";
  details: string;
}
