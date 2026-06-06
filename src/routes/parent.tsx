/** @module parent — Parent dashboard with sanitized student wellness view */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, ShieldCheck, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/parent")({
  head: () => ({ meta: [{ title: "Parent Dashboard · MindMate AI" }] }),
  component: ParentPage,
});

function ParentPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState("");
  const [linked, setLinked] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);
  if (!user) return null;

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-6 pb-20">
        <header className="mb-8">
          <h1 className="font-display text-4xl">Parent Dashboard</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Journal content and chat messages are never shared
          </p>
        </header>

        {!linked ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
            <Eye className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-2xl">Link to your child's account</h2>
            <p className="mt-2 text-sm text-muted-foreground">Enter the access code your child generated from their profile.</p>
            <div className="mt-6 space-y-3">
              <Input value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="Enter 6-digit code" maxLength={6} className="text-center text-lg tracking-widest" aria-label="Parent access code" />
              <Button onClick={() => { setLinked(true); toast.success("Linked successfully!"); }} className="w-full rounded-full bg-gradient-to-r from-primary to-[color:var(--lavender)]" disabled={accessCode.length < 6}>
                Link Account
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl">Wellness Overview</h2>
              <div className="mt-4 text-center">
                <div className="font-display text-5xl text-[color:var(--sage)]">72</div>
                <p className="mt-1 text-sm text-muted-foreground">Current wellness score</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl">Activity</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div><div className="font-display text-2xl">5</div><p className="text-xs text-muted-foreground">Day streak</p></div>
                <div><div className="font-display text-2xl">3/5</div><p className="text-xs text-muted-foreground">Tasks today</p></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass col-span-full rounded-3xl p-6">
              <h2 className="flex items-center gap-2 font-display text-xl"><TrendingUp className="h-5 w-5 text-primary" />Suggestions</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Encourage an earlier bedtime — sleep consistency helps performance</li>
                <li>• Celebrate their 5-day check-in streak!</li>
                <li>• Suggest a study break activity you can do together</li>
              </ul>
            </motion.div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
