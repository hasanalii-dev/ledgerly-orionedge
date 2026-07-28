import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Plus, Trash2, StickyNote, Save, CheckCircle2, Clock, WifiOff } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type Note = { id: string; title: string | null; content: string | null; updated_at: string; planner_id?: string; user_id?: string };

export function NotesPage() {
  const { plannerId } = Route.useParams();
  const qc = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<"synced" | "saving" | "offline">("synced");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Fetch Notes (with local offline fallback)
  const { data: notes = [] } = useQuery({
    queryKey: ["notes", plannerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .eq("planner_id", plannerId)
          .order("updated_at", { ascending: false });
        if (error) throw error;

        localStorage.setItem(`capient_notes_${plannerId}`, JSON.stringify(data));
        return (data || []) as Note[];
      } catch (e) {
        setSaveStatus("offline");
        const local = localStorage.getItem(`capient_notes_${plannerId}`);
        return local ? (JSON.parse(local) as Note[]) : [];
      }
    },
  });

  // Automatically select first note or active note
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      const first = notes[0];
      setActiveNoteId(first.id);
      setTitle(first.title || "");
      setContent(first.content || "");
    }
  }, [notes, activeNoteId]);

  // Handle Note selection
  const selectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setTitle(note.title || "");
    setContent(note.content || "");
  };

  // Auto-Save Note Mutation (Offline First)
  const saveNoteMutation = useMutation({
    mutationFn: async ({ noteId, newTitle, newContent }: { noteId: string; newTitle: string; newContent: string }) => {
      setSaveStatus("saving");
      const updatedAt = new Date().toISOString();

      // 1. Update local cache & localStorage immediately for instant feedback
      const localNotes = (notes.length > 0 ? notes : JSON.parse(localStorage.getItem(`capient_notes_${plannerId}`) || "[]")) as Note[];
      const updatedLocal = localNotes.map((n) =>
        n.id === noteId ? { ...n, title: newTitle, content: newContent, updated_at: updatedAt } : n
      );
      localStorage.setItem(`capient_notes_${plannerId}`, JSON.stringify(updatedLocal));
      qc.setQueryData(["notes", plannerId], updatedLocal);

      // 2. Persist to Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("notes").upsert({
            id: noteId,
            planner_id: plannerId,
            user_id: user.id,
            title: newTitle,
            content: newContent,
            updated_at: updatedAt,
          });
        }
        setSaveStatus("synced");
      } catch (e) {
        console.warn("Saved note offline in localStorage", e);
        setSaveStatus("offline");
      }
    },
  });

  // Debounced auto-save when title or content changes
  useEffect(() => {
    if (!activeNoteId) return;
    const active = notes.find((n) => n.id === activeNoteId);
    if (!active) return;
    if (active.title === title && active.content === content) return;

    const timer = setTimeout(() => {
      saveNoteMutation.mutate({ noteId: activeNoteId, newTitle: title, newContent: content });
    }, 500);

    return () => clearTimeout(timer);
  }, [title, content, activeNoteId]);

  // Create New Note
  const createNewNote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const newNote: Note = {
      id: crypto.randomUUID(),
      planner_id: plannerId,
      user_id: user?.id,
      title: "Untitled Note",
      content: "",
      updated_at: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    localStorage.setItem(`capient_notes_${plannerId}`, JSON.stringify(updated));
    qc.setQueryData(["notes", plannerId], updated);
    setActiveNoteId(newNote.id);
    setTitle("Untitled Note");
    setContent("");

    try {
      if (user) {
        await supabase.from("notes").insert({
          id: newNote.id,
          planner_id: plannerId,
          user_id: user.id,
          title: "Untitled Note",
          content: "",
          updated_at: newNote.updated_at,
        });
      }
    } catch (e) {}
  };

  // Delete Note
  const confirmDeleteNote = async (id: string) => {
    try {
      await supabase.from("notes").delete().eq("id", id);
    } catch (e) {}

    const updated = notes.filter((n) => n.id !== id);
    localStorage.setItem(`capient_notes_${plannerId}`, JSON.stringify(updated));
    qc.setQueryData(["notes", plannerId], updated);

    if (activeNoteId === id) {
      if (updated.length > 0) {
        selectNote(updated[0]);
      } else {
        setActiveNoteId(null);
        setTitle("");
        setContent("");
      }
    }
    setDeleteTargetId(null);
    toast.success("Note deleted");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <StickyNote className="h-7 w-7 text-[#3DDC97]" /> Workspace Notes & Memo
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Capture scratchpad notes, meeting memos, and financial strategy. Syncs automatically.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-sans text-muted-foreground">
            {saveStatus === "saving" && (
              <>
                <Clock className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "synced" && (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-[#3DDC97]" />
                <span className="text-muted-foreground">Saved to cloud</span>
              </>
            )}
            {saveStatus === "offline" && (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-400">Saved offline</span>
              </>
            )}
          </div>

          <Button onClick={createNewNote} className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-semibold gap-2 font-sans">
            <Plus className="h-4 w-4" /> New Note
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[550px] font-sans">
        {/* Left Sidebar: Note List */}
        <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-3 shadow-xl flex flex-col justify-between font-sans">
          <div className="space-y-1 overflow-y-auto max-h-[500px] custom-scrollbar pr-1 font-sans">
            {notes.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground font-sans">
                <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-30 text-white" />
                No notes created yet.
              </div>
            ) : (
              notes.map((n) => {
                const isActive = n.id === activeNoteId;
                return (
                  <div
                    key={n.id}
                    onClick={() => selectNote(n)}
                    className={`group p-3 rounded-xl cursor-pointer transition-all border font-sans ${
                      isActive
                        ? "bg-white/10 border-[#3DDC97]/40 text-white shadow-md"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-sans">
                      <h4 className="text-sm font-semibold truncate font-sans">{n.title || "Untitled Note"}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(n.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-orange-400 transition-opacity p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground/70 truncate mt-1 font-sans">
                      {n.content || "Empty note..."}
                    </p>
                    <span className="text-[10px] text-muted-foreground/50 mt-2 block font-sans">
                      {formatDate(n.updated_at)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Editor Area */}
        <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-white/10 bg-[#0c100e] p-6 shadow-xl flex flex-col justify-between font-sans">
          {activeNoteId ? (
            <div className="space-y-4 flex-1 flex flex-col font-sans">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title..."
                className="bg-transparent border-0 border-b border-white/10 rounded-none text-2xl font-bold font-display px-0 focus-visible:ring-0 focus-visible:border-[#3DDC97]"
              />

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your notes, meeting details, or financial memos here..."
                className="flex-1 bg-transparent border-0 px-0 text-sm font-sans focus-visible:ring-0 resize-none min-h-[380px] custom-scrollbar"
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20 font-sans">
              <StickyNote className="h-12 w-12 mb-3 opacity-30 text-white" />
              <p className="text-sm font-sans">Select a note from the left list or create a new one.</p>
              <Button onClick={createNewNote} className="mt-4 gap-2 bg-[#3DDC97] text-black font-semibold font-sans">
                <Plus className="h-4 w-4" /> Create Note
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent className="bg-[#0c100e] border-white/10 text-white sm:max-w-md font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">Delete Note?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground font-sans">
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)} className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-sans">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTargetId && confirmDeleteNote(deleteTargetId)} className="bg-orange-500 hover:bg-orange-400 text-black font-semibold font-sans">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/notes")({
  component: NotesPage,
});
