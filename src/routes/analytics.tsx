/** @module analytics — Mood analytics page with Recharts visualizations */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { TrendingUp, AlertTriangle, Brain } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useMoodTrends, useStudyStressCorrelation, useSleepMoodCorrelation, useBurnoutIndicators } from "@/hooks/useMoodAnalytics";
import { useWellnessHistory } from "@/hooks/useWellnessScore";
import { MOOD_OPTIONS, MOOD_SCORES } from "@/types";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Mood Analytics · MindMate AI" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"week" | "month">("week");

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  const { data: moodData } = useMoodTrends(period);
  const { data: wellnessHistory } = useWellnessHistory(period === "week" ? 7 : 30);
  const { data: studyStress } = useStudyStressCorrelation();
  const { data: sleepMood } = useSleepMoodCorrelation();
  const { data: burnout } = useBurnoutIndicators();

  // Emotional patterns radar data
  const radarData = MOOD_OPTIONS.map((mood) => ({
    mood,
    count: moodData?.filter((d) => d.mood === mood).length ?? 0,
  }));

  if (!user) return null;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <header className="mb-8">
          <h1 className="font-display text-4xl">Mood Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Understand your emotional patterns</p>
        </header>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="mb-6">
          <TabsList aria-label="Select time period">
            <TabsTrigger value="week">7 Days</TabsTrigger>
            <TabsTrigger value="month">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mood Trends */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
            <h2 className="flex items-center gap-2 font-display text-xl"><TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />Mood Trends</h2>
            <div className="mt-4 h-64" role="img" aria-label="Mood trend line chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="moodScore" stroke="var(--coral)" strokeWidth={2} dot={{ r: 4 }} name="Mood" />
                  <Line type="monotone" dataKey="energy" stroke="var(--sage)" strokeWidth={2} dot={{ r: 3 }} name="Energy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Wellness Score History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-3xl p-6">
            <h2 className="font-display text-xl">Wellness Score History</h2>
            <div className="mt-4 h-64" role="img" aria-label="Wellness score area chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wellnessHistory || []}>
                  <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--coral)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--coral)" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="dateKey" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="var(--coral)" fill="url(#scoreGrad)" strokeWidth={2} name="Score" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Study vs Stress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6">
            <h2 className="font-display text-xl">Study vs Stress</h2>
            <div className="mt-4 h-64" role="img" aria-label="Study versus stress scatter chart">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="studyHours" name="Study Hours" tick={{ fontSize: 11 }} /><YAxis dataKey="stressScore" name="Stress" domain={[0, 10]} tick={{ fontSize: 11 }} /><Tooltip /><Scatter data={studyStress || []} fill="var(--lavender)" /></ScatterChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Sleep vs Mood */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-3xl p-6">
            <h2 className="font-display text-xl">Sleep vs Mood</h2>
            <div className="mt-4 h-64" role="img" aria-label="Sleep versus mood bar chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepMood || []}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="sleepHours" fill="var(--sky)" name="Sleep (h)" /><Bar dataKey="moodScore" fill="var(--coral)" name="Mood" /></BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Burnout Indicators */}
          {burnout?.isAtRisk && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass col-span-full rounded-3xl border-2 border-destructive/30 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 shrink-0 text-destructive" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-xl text-destructive">Burnout Warning</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{burnout.message}</p>
                  <p className="mt-2 text-sm">Consider taking a break, talking to someone, or trying a relaxation exercise.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Emotional Patterns */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-6 lg:col-span-2">
            <h2 className="flex items-center gap-2 font-display text-xl"><Brain className="h-5 w-5 text-primary" aria-hidden="true" />Emotional Patterns</h2>
            <div className="mt-4 h-72" role="img" aria-label="Emotional patterns radar chart">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}><PolarGrid stroke="var(--border)" /><PolarAngleAxis dataKey="mood" tick={{ fontSize: 12 }} /><Radar dataKey="count" stroke="var(--coral)" fill="var(--coral)" fillOpacity={0.3} /></RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}
