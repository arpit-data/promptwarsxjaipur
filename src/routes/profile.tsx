/** @module profile — User profile management page */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Award, Flame, Star, Calendar } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile, useExamCountdown } from "@/hooks/useProfile";
import { useXP, useBadges, useStreaks } from "@/hooks/useGamification";
import { EXAM_TYPES } from "@/types";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · MindMate AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const updateMutation = useUpdateProfile();
  const { xp, level, xpInLevel, xpForNextLevel } = useXP();
  const { data: badges } = useBadges();
  const { data: streaks } = useStreaks();
  const countdown = useExamCountdown();

  const [form, setForm] = useState({
    name: "", age: "", examType: "", examDate: "", dailyStudyTarget: "8", preferredLanguage: "English",
  });

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "", age: profile.age?.toString() || "",
        examType: profile.examType || "", examDate: profile.examDate || "",
        dailyStudyTarget: profile.dailyStudyTarget?.toString() || "8",
        preferredLanguage: profile.preferredLanguage || "English",
      });
    }
  }, [profile]);

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
        name: form.name, age: form.age ? parseInt(form.age) : null,
        examType: form.examType as any, examDate: form.examDate,
        dailyStudyTarget: parseInt(form.dailyStudyTarget) || 8,
        preferredLanguage: form.preferredLanguage,
      });
      toast.success("Profile updated ✨");
    } catch { toast.error("Failed to update profile."); }
  }

  if (!user) return null;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 pb-20">
        <h1 className="font-display text-4xl">Your Profile</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Profile Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
            <h2 className="flex items-center gap-2 font-display text-xl"><User className="h-5 w-5 text-primary" />Details</h2>
            <div className="mt-4 space-y-4">
              <div><Label htmlFor="p-name">Name</Label><Input id="p-name" value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} /></div>
              <div><Label htmlFor="p-age">Age</Label><Input id="p-age" type="number" value={form.age} onChange={(e) => setForm(f => ({...f, age: e.target.value}))} /></div>
              <div><Label htmlFor="p-exam">Exam Type</Label><Select value={form.examType} onValueChange={(v) => setForm(f => ({...f, examType: v}))}><SelectTrigger id="p-exam"><SelectValue /></SelectTrigger><SelectContent>{EXAM_TYPES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div>
              <div><Label htmlFor="p-date">Exam Date</Label><Input id="p-date" type="date" value={form.examDate} onChange={(e) => setForm(f => ({...f, examDate: e.target.value}))} /></div>
              <div><Label htmlFor="p-target">Daily Study Target (hours)</Label><Input id="p-target" type="number" value={form.dailyStudyTarget} onChange={(e) => setForm(f => ({...f, dailyStudyTarget: e.target.value}))} /></div>
              <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full rounded-full bg-gradient-to-r from-primary to-[color:var(--lavender)]">Save Changes</Button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="space-y-6">
            {/* XP & Level */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-3xl p-6">
              <h2 className="flex items-center gap-2 font-display text-xl"><Star className="h-5 w-5 text-[color:var(--amber-glow)]" />Level {level}</h2>
              <div className="mt-3 flex items-center gap-3">
                <Progress value={(xpInLevel / xpForNextLevel) * 100} className="flex-1" aria-label={`${xpInLevel} of ${xpForNextLevel} XP`} />
                <span className="text-sm text-muted-foreground">{xp} XP</span>
              </div>
            </motion.div>

            {/* Streaks */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6">
              <h2 className="flex items-center gap-2 font-display text-xl"><Flame className="h-5 w-5 text-[color:var(--coral)]" />Streaks</h2>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div><div className="font-display text-2xl">{streaks?.checkinStreak ?? 0}</div><div className="text-xs text-muted-foreground">Check-in</div></div>
                <div><div className="font-display text-2xl">{streaks?.journalStreak ?? 0}</div><div className="text-xs text-muted-foreground">Journal</div></div>
                <div><div className="font-display text-2xl">{streaks?.taskStreak ?? 0}</div><div className="text-xs text-muted-foreground">Tasks</div></div>
              </div>
            </motion.div>

            {/* Exam Countdown */}
            {countdown && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-3xl p-6">
                <h2 className="flex items-center gap-2 font-display text-xl"><Calendar className="h-5 w-5 text-primary" />{countdown.examType}</h2>
                <div className="mt-2 font-display text-3xl">{countdown.daysRemaining} days</div>
                <p className="text-sm text-muted-foreground">{countdown.weeksRemaining} weeks remaining</p>
                {countdown.milestone && <p className="mt-2 text-sm font-medium text-primary">{countdown.milestone}</p>}
              </motion.div>
            )}

            {/* Badges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-6">
              <h2 className="flex items-center gap-2 font-display text-xl"><Award className="h-5 w-5 text-[color:var(--amber-glow)]" />Badges</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {badges && badges.length > 0 ? badges.map((b) => (
                  <Badge key={b.id} variant="secondary" className="px-3 py-1.5">{b.badgeName}</Badge>
                )) : <p className="text-sm text-muted-foreground">Keep going to earn your first badge!</p>}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
