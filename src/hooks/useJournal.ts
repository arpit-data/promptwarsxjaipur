/** @module useJournal — Journal CRUD hooks with seed fallback */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  createJournalEntry, updateJournalEntry, deleteJournalEntry, getJournalEntries,
} from "@/lib/api/journal.functions";
import { SEED_JOURNALS } from "@/lib/seed-data";
import type { JournalTag } from "@/types";

export function useJournalEntries(filters?: { tag?: JournalTag; search?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["journal", user?.uid, filters?.tag, filters?.search],
    queryFn: async () => {
      try {
        const entries = await getJournalEntries(user!.uid, { tag: filters?.tag, search: filters?.search });
        if (entries.length > 0) {
          if (filters?.search) {
            const s = filters.search.toLowerCase();
            return entries.filter((e) => e.title.toLowerCase().includes(s) || e.content.toLowerCase().includes(s));
          }
          return entries;
        }
        // Return seed data filtered
        let data = SEED_JOURNALS;
        if (filters?.tag) data = data.filter((e) => e.tags.includes(filters.tag!));
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          data = data.filter((e) => e.title.toLowerCase().includes(s) || e.content.toLowerCase().includes(s));
        }
        return data;
      } catch (e) {
        console.warn("[useJournalEntries] Firestore unavailable, using seed data");
        let data = SEED_JOURNALS;
        if (filters?.tag) data = data.filter((e) => e.tags.includes(filters.tag!));
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          data = data.filter((e) => e.title.toLowerCase().includes(s) || e.content.toLowerCase().includes(s));
        }
        return data;
      }
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useCreateJournal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string; tags: JournalTag[] }) => {
      try {
        return await createJournalEntry(user!.uid, data);
      } catch (e) {
        console.warn("[useCreateJournal] Firestore unavailable");
        return "mock_id";
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}

export function useUpdateJournal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; title: string; content: string; tags: JournalTag[] }) => {
      try {
        await updateJournalEntry(data.id, { title: data.title, content: data.content, tags: data.tags });
      } catch (e) {
        console.warn("[useUpdateJournal] Firestore unavailable");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}

export function useDeleteJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteJournalEntry(id);
      } catch (e) {
        console.warn("[useDeleteJournal] Firestore unavailable");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}
