/** @module useProfile — Profile and exam countdown hooks with seed fallback */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import { SEED_EXAM_COUNTDOWN } from "@/lib/seed-data";
import { useMemo } from "react";

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        await updateDoc(doc(db, COLLECTIONS.USER_PROFILES, user!.uid), data);
      } catch (e) {
        console.warn("[useUpdateProfile] Firestore unavailable");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useExamCountdown() {
  const { profile } = useAuth();

  return useMemo(() => {
    const examDate = profile?.examDate;
    const examType = profile?.examType;

    if (!examDate || !examType) {
      // Return seed data when profile doesn't have exam info
      return SEED_EXAM_COUNTDOWN;
    }

    const target = new Date(examDate);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return { examType, examDate, daysRemaining: 0, weeksRemaining: 0, milestone: "Exam day is here! You've prepared well. 🌟" };

    const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const weeksRemaining = Math.ceil(daysRemaining / 7);

    let milestone: string | null = null;
    if (daysRemaining <= 7) milestone = "Final week — trust your preparation! 💪";
    else if (daysRemaining <= 30) milestone = "1 month left — stay focused and rest well 🎯";
    else if (daysRemaining <= 90) milestone = `${Math.floor(daysRemaining / 30)} months to go — you've got this! 💪`;

    return { examType, examDate, daysRemaining, weeksRemaining, milestone };
  }, [profile?.examDate, profile?.examType]);
}
