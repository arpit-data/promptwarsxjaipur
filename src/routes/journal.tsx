/** @module journal — Reflection journal page with search, tags, and CRUD */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Plus, Edit, Trash2, Sparkles, BookOpen } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useJournalEntries, useCreateJournal, useUpdateJournal, useDeleteJournal } from "@/hooks/useJournal";
import { JOURNAL_TAGS, type JournalTag, type JournalEntry } from "@/types";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "Reflection Journal · MindMate AI" }] }),
  component: JournalPage,
});

function JournalPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<JournalTag | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  const { data: entries, isLoading } = useJournalEntries({ tag: activeTag, search: search || undefined });

  if (!user) return null;

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-6 pb-20">
        <header className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl">Reflection Journal</h1>
            <p className="mt-1 text-sm text-muted-foreground">A safe space for your thoughts</p>
          </div>
          <Button onClick={() => { setEditEntry(null); setDialogOpen(true); }} className="rounded-full bg-gradient-to-r from-primary to-[color:var(--lavender)]" aria-label="Create new journal entry">
            <Plus className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </header>

        {/* Search & Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries..." className="pl-10" aria-label="Search journal entries" />
          </div>
          <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Filter by tag">
            <button onClick={() => setActiveTag(undefined)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${!activeTag ? 'bg-foreground text-background' : 'bg-muted/60 hover:bg-muted'}`} aria-pressed={!activeTag}>All</button>
            {JOURNAL_TAGS.map((tag) => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? undefined : tag)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${activeTag === tag ? 'bg-foreground text-background' : 'bg-muted/60 hover:bg-muted'}`} aria-pressed={activeTag === tag}>{tag}</button>
            ))}
          </div>
        </div>

        {/* Entries */}
        <div role="list" aria-label="Journal entries" className="space-y-4">
          <AnimatePresence>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass h-24 animate-pulse rounded-2xl" />)
            ) : entries && entries.length > 0 ? (
              entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onEdit={() => { setEditEntry(entry); setDialogOpen(true); }} />
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-12 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-3 font-display text-xl">Start your first reflection</h3>
                <p className="mt-2 text-sm text-muted-foreground">Writing helps you process emotions and build self-awareness.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <EntryDialog open={dialogOpen} onOpenChange={setDialogOpen} entry={editEntry} />
      </div>
    </PageShell>
  );
}

function EntryCard({ entry, onEdit }: { entry: JournalEntry; onEdit: () => void }) {
  const deleteMutation = useDeleteJournal();

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-2xl p-5" role="listitem">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium">{entry.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{entry.content}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
            <span className="text-xs text-muted-foreground">{entry.createdAt && new Date((entry.createdAt as any).seconds * 1000).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="rounded-full p-2 hover:bg-muted" aria-label={`Edit entry: ${entry.title}`}><Edit className="h-4 w-4" /></button>
          <button onClick={() => { deleteMutation.mutate(entry.id!); toast.success("Entry deleted"); }} className="rounded-full p-2 hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete entry: ${entry.title}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      {entry.aiSummary && (
        <div className="mt-3 rounded-xl bg-muted/40 p-3">
          <div className="flex items-center gap-1 text-xs font-medium text-primary"><Sparkles className="h-3 w-3" /> AI Summary</div>
          <p className="mt-1 text-xs text-muted-foreground">{entry.aiSummary}</p>
        </div>
      )}
    </motion.div>
  );
}

function EntryDialog({ open, onOpenChange, entry }: { open: boolean; onOpenChange: (o: boolean) => void; entry: JournalEntry | null }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<JournalTag[]>([]);
  const createMutation = useCreateJournal();
  const updateMutation = useUpdateJournal();

  useEffect(() => {
    if (entry) { setTitle(entry.title); setContent(entry.content); setTags(entry.tags); }
    else { setTitle(""); setContent(""); setTags([]); }
  }, [entry, open]);

  async function handleSave() {
    if (!title.trim() || !content.trim()) { toast.error("Title and content are required."); return; }
    try {
      if (entry?.id) {
        await updateMutation.mutateAsync({ id: entry.id, title, content, tags });
        toast.success("Entry updated ✨");
      } else {
        await createMutation.mutateAsync({ title, content, tags });
        toast.success("Entry created ✨");
      }
      onOpenChange(false);
    } catch { toast.error("Failed to save entry."); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-lg" aria-label={entry ? "Edit journal entry" : "New journal entry"}>
        <DialogHeader><DialogTitle className="font-display text-xl">{entry ? "Edit Entry" : "New Reflection"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label htmlFor="entry-title">Title</Label><Input id="entry-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your mind?" aria-required="true" /></div>
          <div><Label htmlFor="entry-content">Your thoughts</Label><Textarea id="entry-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write freely..." rows={6} aria-required="true" /></div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Tags</legend>
            <div className="flex flex-wrap gap-2">
              {JOURNAL_TAGS.map((tag) => (
                <label key={tag} className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs cursor-pointer hover:bg-muted">
                  <Checkbox checked={tags.includes(tag)} onCheckedChange={(checked) => setTags((prev) => checked ? [...prev, tag] : prev.filter((t) => t !== tag))} aria-label={`Tag: ${tag}`} />
                  {tag}
                </label>
              ))}
            </div>
          </fieldset>
          <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="w-full rounded-full bg-gradient-to-r from-primary to-[color:var(--lavender)]">
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Entry ✨"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
