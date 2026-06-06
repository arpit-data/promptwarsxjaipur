/** @module InsightsCard — Dashboard card displaying AI-generated wellness insights */
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useInsights } from "@/hooks/useInsights";
import { Skeleton } from "@/components/ui/skeleton";

export function InsightsCard() {
  const { data: insight, isLoading } = useInsights();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-3xl p-6"
      role="region"
      aria-label="AI Wellness Insights"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 className="font-display text-xl">AI Insights</h2>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full rounded" />
          ))
        ) : insight?.insights && insight.insights.length > 0 ? (
          insight.insights.map((text: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{text}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Complete your first check-in to unlock personalized insights ✨
          </p>
        )}
      </div>
    </motion.div>
  );
}
