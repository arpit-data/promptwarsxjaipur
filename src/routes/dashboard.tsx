/**
 * @module dashboard
 * @description Main wellness dashboard wired to Firebase data.
 * Preserves ALL original visual structure, animations, and styling.
 * Replaces hardcoded data with real Firestore-backed hooks.
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Check, Flame, Moon, Sparkles, Wind, Droplets } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { WellnessSphere } from "@/components/three/WellnessSphere";
import { CheckInModal } from "@/components/CheckInModal";
import { InsightsCard } from "@/components/InsightsCard";
import { GamificationBar } from "@/components/GamificationBar";
import { useAuth } from "@/contexts/AuthContext";
import { useTodayCheckIn, useRecentCheckIns } from "@/hooks/useCheckIn";
import { useWellnessScore } from "@/hooks/useWellnessScore";
import { useDailyTasks, useCompleteTask } from "@/hooks/useTasks";
import { useExamCountdown } from "@/hooks/useProfile";
import { MOOD_OPTIONS, MOOD_EMOJIS, MOOD_SCORES, type MoodOption } from "@/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your wellness dashboard · MindMate AI" },
      { name: "description", content: "Track your mood, stress, exam countdown, and daily wellness tasks." },
    ],
  }),
  component: Dashboard,
});

/** Icon lookup for dynamic tasks */
const ICON_MAP: Record<string, any> = {
  Wind, Sparkles, Flame, Moon, Droplets,
};

function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  // Data hooks
  const { data: todayCheckIn, isLoading: checkInLoading } = useTodayCheckIn();
  const { data: recentCheckIns } = useRecentCheckIns(7);
  const { score, category, loading: scoreLoading } = useWellnessScore();
  const { data: tasks } = useDailyTasks();
  const completeMutation = useCompleteTask();
  const countdown = useExamCountdown();

  // Check-in modal state
  const [checkInOpen, setCheckInOpen] = useState(false);

  // Auto-open check-in if not done today
  useEffect(() => {
    if (!checkInLoading && !todayCheckIn && user) {
      setCheckInOpen(true);
    }
  }, [checkInLoading, todayCheckIn, user]);

  // Mood index from today's check-in
  const moodIdx = useMemo(() => {
    if (!todayCheckIn) return 2; // default "Okay"
    return MOOD_OPTIONS.indexOf(todayCheckIn.mood);
  }, [todayCheckIn]);

  // Wellness score display
  const displayScore = todayCheckIn ? score : 50;
  const tone = useMemo(() => {
    if (displayScore >= 75) return { label: "Healthy", color: "text-[color:var(--sage)]" };
    if (displayScore >= 50) return { label: "Moderate stress", color: "text-[color:var(--amber-glow)]" };
    return { label: "High stress — be gentle", color: "text-primary" };
  }, [displayScore]);

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = profile?.name?.split(" ")[0] || "friend";
    if (hour < 12) return `Good morning, ${name}.`;
    if (hour < 17) return `Good afternoon, ${name}.`;
    return `Good evening, ${name}.`;
  }, [profile?.name]);

  // Completed tasks set
  const doneSet = useMemo(() => {
    return new Set(tasks?.filter((t) => t.completed).map((t) => t.id) || []);
  }, [tasks]);

  if (!user) return null;

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-6 pb-20">
        <header className="mb-6">
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">How is your mind today?</h1>
        </header>

        <GamificationBar />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Wellness sphere */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass relative col-span-1 overflow-hidden rounded-3xl p-6 lg:row-span-2"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl">Wellness score</h2>
              <span className={`text-xs font-medium ${tone.color}`}>{tone.label}</span>
            </div>
            <WellnessSphere score={displayScore} className="mt-2 h-72" />
            <div className="text-center">
              <div className="font-display text-6xl">{displayScore}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {todayCheckIn ? "based on today's mood check-in" : "complete your check-in to update"}
              </p>
            </div>
            <Link
              to="/coach"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-medium text-background hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Talk it through with MindMate
            </Link>
          </motion.div>

          {/* Mood constellation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass col-span-1 rounded-3xl p-6 lg:col-span-2"
          >
            <h2 className="font-display text-xl">Today's mood</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {todayCheckIn ? "You've checked in today ✓" : "Tap a planet to drop your emotional marker."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {MOOD_OPTIONS.map((m, i) => {
                const active = i === moodIdx;
                return (
                  <button
                    key={m}
                    onClick={() => { if (!todayCheckIn) setCheckInOpen(true); }}
                    aria-label={`Mood: ${m}`}
                    aria-pressed={active}
                    className={`group flex flex-col items-center gap-2 rounded-2xl border px-5 py-4 transition-all ${
                      active
                        ? "border-primary bg-card shadow-[var(--shadow-glow)] -translate-y-1"
                        : "border-transparent bg-muted/50 hover:border-border"
                    }`}
                  >
                    <span className="text-3xl">{MOOD_EMOJIS[m]}</span>
                    <span className="text-xs font-medium">{m}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-sm font-medium">Mood constellation · last 7 days</h3>
              <Constellation checkIns={recentCheckIns || []} />
            </div>
          </motion.div>

          {/* Exam countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-6"
          >
            <h2 className="font-display text-xl">Exam orbits</h2>
            <ul className="mt-4 space-y-3">
              {countdown ? (
                <li className="flex items-center gap-4 rounded-2xl bg-muted/50 p-3">
                  <div className="relative h-12 w-12 shrink-0">
                    <div className="absolute inset-0 animate-float rounded-full bg-gradient-to-br from-[color:var(--peach)] via-[color:var(--coral)] to-[color:var(--lavender)] shadow-[var(--shadow-glow)]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{countdown.examType}</div>
                    <div className="text-xs text-muted-foreground">{countdown.daysRemaining} days remaining</div>
                    {countdown.milestone && <div className="mt-1 text-xs font-medium text-primary">{countdown.milestone}</div>}
                  </div>
                </li>
              ) : (
                <li className="text-sm text-muted-foreground">Set your exam date in your profile to see the countdown.</li>
              )}
            </ul>
          </motion.div>

          {/* Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-3xl p-6 lg:col-span-2"
          >
            <h2 className="font-display text-xl">Today's wellness tasks</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(tasks || []).map((t) => {
                const isDone = t.completed || doneSet.has(t.id);
                const Icon = ICON_MAP[t.icon] || Sparkles;
                return (
                  <motion.button
                    key={t.id}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      if (!isDone && t.id) completeMutation.mutate(t.id);
                    }}
                    aria-label={`${isDone ? "Completed" : "Complete"} task: ${t.label}`}
                    aria-pressed={isDone}
                    className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                      isDone ? "border-[color:var(--sage)] bg-[color:var(--sage)]/15" : "border-border bg-muted/40 hover:bg-card"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full transition-colors ${
                        isDone ? "bg-[color:var(--sage)] text-white" : "bg-background text-primary"
                      }`}
                    >
                      {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </span>
                    <span className={`flex-1 text-sm font-medium ${isDone ? "line-through opacity-70" : ""}`}>
                      {t.label}
                    </span>
                    {!isDone && (
                      <span className="text-xs text-muted-foreground">+{t.xpReward} XP</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* AI Insights */}
          <InsightsCard />
        </div>
      </div>

      <CheckInModal open={checkInOpen} onOpenChange={setCheckInOpen} />
    </PageShell>
  );
}

/** Constellation visualization using real mood data */
function Constellation({ checkIns }: { checkIns: Array<{ mood: MoodOption; dateKey: string }> }) {
  const points = useMemo(() => {
    if (checkIns.length === 0) {
      // Fallback for no data
      return Array.from({ length: 7 }, (_, i) => ({
        x: i * 60 + 20,
        y: 60 + Math.sin(i * 1.2) * 30 + (i % 2) * 10,
      }));
    }
    return checkIns
      .slice(0, 7)
      .reverse()
      .map((c, i) => ({
        x: i * 60 + 20,
        y: 120 - (MOOD_SCORES[c.mood] / 100) * 80,
      }));
  }, [checkIns]);

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 460 140" className="mt-4 w-full" role="img" aria-label="Mood constellation chart showing mood trends over the last 7 days">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.16 30)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.82 0.09 305)" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path d={path} stroke="url(#g)" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="10" fill="oklch(0.72 0.16 30)" opacity="0.15" />
          <circle cx={p.x} cy={p.y} r="4" fill="oklch(0.72 0.16 30)" />
        </g>
      ))}
    </svg>
  );
}
