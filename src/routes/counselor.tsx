/** @module counselor — Counselor dashboard with aggregated student analytics */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { AlertTriangle, Users, TrendingUp, ShieldAlert } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/counselor")({
  head: () => ({ meta: [{ title: "Counselor Dashboard · MindMate AI" }] }),
  component: CounselorPage,
});

const MOCK_TREND = Array.from({ length: 14 }, (_, i) => ({
  date: `Day ${i + 1}`, avgScore: 55 + Math.random() * 30, checkInRate: 60 + Math.random() * 30,
}));

function CounselorPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);
  if (!user) return null;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <header className="mb-4">
          <h1 className="font-display text-4xl">Counselor Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Aggregated student wellness metrics</p>
        </header>

        {/* Disclaimer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-2xl border border-[color:var(--amber-glow)]/30 bg-[color:var(--amber-glow)]/5 p-4 text-sm" role="alert">
          <strong>⚠️ Important:</strong> This dashboard provides aggregated wellness trends only. It does not provide medical diagnosis, clinical assessment, or therapeutic recommendations. For clinical concerns, refer students to qualified professionals.
        </motion.div>

        {/* Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {[
            { label: "Total Students", value: "24", icon: Users, color: "text-primary" },
            { label: "Avg Wellness Score", value: "68", icon: TrendingUp, color: "text-[color:var(--sage)]" },
            { label: "Engagement Rate", value: "82%", icon: TrendingUp, color: "text-[color:var(--amber-glow)]" },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 text-center">
              <Icon className={`mx-auto h-6 w-6 ${color}`} aria-hidden="true" />
              <div className="mt-2 font-display text-3xl">{value}</div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Trend Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
            <h2 className="font-display text-xl">Wellness Trends (14 days)</h2>
            <div className="mt-4 h-64" role="img" aria-label="Student wellness trends chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_TREND}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="avgScore" stroke="var(--coral)" strokeWidth={2} name="Avg Score" /><Line type="monotone" dataKey="checkInRate" stroke="var(--sage)" strokeWidth={2} name="Check-in %" /></LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Risk Indicators */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-3xl p-6">
            <h2 className="flex items-center gap-2 font-display text-xl"><ShieldAlert className="h-5 w-5 text-destructive" />Risk Indicators</h2>
            <p className="mt-1 text-xs text-muted-foreground">Students showing sustained stress patterns</p>
            <div className="mt-4 space-y-3">
              {[
                { name: "Student A", indicator: "Declining wellness score", severity: "high" as const },
                { name: "Student B", indicator: "3-day high stress streak", severity: "medium" as const },
                { name: "Student C", indicator: "Reduced engagement", severity: "low" as const },
              ].map((r) => (
                <div key={r.name} className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
                  <div>
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.indicator}</div>
                  </div>
                  <Badge variant={r.severity === "high" ? "destructive" : "secondary"}>
                    {r.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}
