/** @module useInsights — React Query hook for AI wellness insights with seed fallback */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getLatestInsights } from "@/lib/api/insights.functions";
import { SEED_INSIGHTS } from "@/lib/seed-data";

export function useInsights() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["insights", user?.uid],
    queryFn: async () => {
      try {
        const result = await getLatestInsights(user!.uid);
        return result || SEED_INSIGHTS;
      } catch (e) {
        console.warn("[useInsights] Firestore unavailable, using seed data");
        return SEED_INSIGHTS;
      }
    },
    enabled: !!user,
    staleTime: 300_000,
  });
}
