/** @module GamificationBar — XP progress, level, and streak display */
import { Flame, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useXP, useStreaks } from "@/hooks/useGamification";

export function GamificationBar() {
  const { xp, level, xpInLevel, xpForNextLevel } = useXP();
  const { data: streaks } = useStreaks();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mb-6 flex flex-wrap items-center gap-4 rounded-2xl px-5 py-3"
      role="status"
      aria-label={`Level ${level}, ${xp} XP, ${streaks?.checkinStreak ?? 0} day streak`}
    >
      {/* Level */}
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-[color:var(--lavender)] text-xs font-bold text-primary-foreground">
          {level}
        </span>
        <span className="text-sm font-medium">Level {level}</span>
      </div>

      {/* XP Bar */}
      <div className="flex min-w-[120px] flex-1 items-center gap-2">
        <Star className="h-4 w-4 text-[color:var(--amber-glow)]" aria-hidden="true" />
        <Progress
          value={(xpInLevel / xpForNextLevel) * 100}
          className="h-2 flex-1"
          aria-label={`${xpInLevel} of ${xpForNextLevel} XP to next level`}
        />
        <span className="text-xs text-muted-foreground">{xpInLevel}/{xpForNextLevel} XP</span>
      </div>

      {/* Streak */}
      {streaks && streaks.checkinStreak > 0 && (
        <div className="flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-[color:var(--coral)]" aria-hidden="true" />
          <span className="text-sm font-medium">{streaks.checkinStreak}</span>
          <span className="text-xs text-muted-foreground">day streak</span>
        </div>
      )}

      {/* Total XP */}
      <div className="flex items-center gap-1.5">
        <Trophy className="h-4 w-4 text-[color:var(--amber-glow)]" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">{xp} total XP</span>
      </div>
    </motion.div>
  );
}
