/** @module useTasks — React Query hooks for wellness tasks with seed fallback */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { generateDailyTasks, completeTask } from "@/lib/api/tasks.functions";
import { SEED_TASKS } from "@/lib/seed-data";

export function useDailyTasks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tasks", "today", user?.uid],
    queryFn: async () => {
      try {
        const tasks = await generateDailyTasks(user!.uid);
        return tasks.length > 0 ? tasks : SEED_TASKS;
      } catch (e) {
        console.warn("[useDailyTasks] Firestore unavailable, using seed data");
        return SEED_TASKS;
      }
    },
    enabled: !!user,
    staleTime: 120_000,
  });
}

export function useCompleteTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      try {
        return await completeTask(taskId, user!.uid);
      } catch (e) {
        console.warn("[useCompleteTask] Firestore unavailable");
        return { xpAwarded: 15 };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["gamification"] });
      qc.invalidateQueries({ queryKey: ["streaks"] });
    },
  });
}
