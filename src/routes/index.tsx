import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles, Wind } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { WellnessUniverse } from "@/components/three/WellnessUniverse";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindMate AI — Your wellness companion through every exam journey" },
      { name: "description", content: "An AI wellness companion that helps students preparing for JEE, NEET, UPSC, GATE, CAT, CUET and Boards manage stress, anxiety, and burnout." },
      { property: "og:title", content: "MindMate AI" },
      { property: "og:description", content: "Track emotions. Reduce stress. Build resilience. Perform better." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <PageShell>
      <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-24 pt-12 lg:grid-cols-2 lg:pt-20">
        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            For students preparing for JEE · NEET · UPSC · GATE · CAT · CUET · Boards
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
          >
            Your <span className="text-gradient italic">AI wellness</span> companion through every exam journey.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Track your emotions. Reduce stress. Build resilience. Perform better — without burning out.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-[color:var(--lavender)] px-7 py-4 text-base font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
            >
              Start your wellness journey
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/coach"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-4 text-base font-medium text-foreground hover:bg-card"
            >
              Talk to MindMate
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex gap-6 text-sm text-muted-foreground"
          >
            <Stat icon={<Heart className="h-4 w-4" />} label="Daily mood check-ins" />
            <Stat icon={<Wind className="h-4 w-4" />} label="Breathing & grounding" />
            <Stat icon={<Sparkles className="h-4 w-4" />} label="Gemini-powered coach" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[420px] w-full lg:h-[620px]"
        >
          <WellnessUniverse className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-x-10 bottom-8 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
            your mind, gently held
          </div>
        </motion.div>
      </section>
    </PageShell>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-card text-primary">{icon}</span>
      {label}
    </div>
  );
}
