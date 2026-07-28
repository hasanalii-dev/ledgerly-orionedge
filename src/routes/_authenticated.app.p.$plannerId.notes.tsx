import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Cloud, CloudOff, Check } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { queueOfflineAction } from "@/lib/offline-sync";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/notes")({
  component: NotesPage,
});

type Note = { id: string; title: string | null; content: string | null; updated_at: string; planner_id?: string; user_id?: string };

export function NotesPage() {
  const { plannerId } = Route.useParams();
  const qc = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<"synced" | "saving" | "offline">("synced");

  const { data: notes = [] } = useQuery({
    queryKey: ["notes", plannerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .eq("planner_id", plannerId)
          .order("updated_at", { ascending: false });
        if (error || !data) throw error;
        // Cache to localStorage for offline fallback
        localStorage.setItem(`capient_notes_${plannerId}`, JSON.stringify(data));
        return data as Note[];
      } catch (e) {
        // Fallback to local storage cache if offline or error
        const local = localStorage.getItem(`capient_notes_${plannerId}`);
        return local ? (JSON.parse(local) as Note[]) : [];
      }
    },
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const active = notes.find((n) => n.id === activeId) ?? notes[0];
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (active) {
      setTitle(active.title ?? "");
      setBody(active.content ?? "");
    }
  }, [active?.id]);

  useEffect(() => {
    if (!active) return;
    if (title === (active.title ?? "") && body === (active.content ?? "")) return;

    setSaveStatus("saving");
    const t = setTimeout(async () => {
      const updatedNote = {
        ...active,
        title,
        content: body,
        updated_at: new Date().toISOString(),
      };

      // Optimistically update React Query cache and local backup
      qc.setQueryData(["notes", plannerId], (old: Note[] = []) =>
        old.map((n) => (n.id === active.id ? updatedNote : n))
      );

      const localNotes = notes.map((n) => (n.id === active.id ? updatedNote : n));
      localStorage.setItem(`capient_notes_${plannerId}`, JSON.stringify(localNotes));

      if (navigator.onLine) {
        try {
          const { error } = await supabase
            .from("notes")
            .update({ title, content: body, updated_at: updatedNote.updated_at })
            .eq("id", active.id);
          if (error) throw error;
          setSaveStatus("synced");
        } catch (err) {
          // If network failed, queue offline action
          await queueOfflineAction({
            type: "UPDATE",
            table: "notes",
            payload: { id: active.id, title, content: body, updated_at: updatedNote.updated_at },
          });
          setSaveStatus("offline");
        }
      } else {
        await queueOfflineAction({
          type: "UPDATE",
          table: "notes",
          payload: { id: active.id, title, content: body, updated_at: updatedNote.updated_at },
        });
        setSaveStatus("offline");
      }
    }, 600);

    return () => clearTimeout(t);
  }, [title, body, active, plannerId, qc]);

  async function addNote() {
    const { data: { user } } = await supabase.auth.getUser();
    const newId = crypto.randomUUID();
    const newNote: Note = {
      id: newId,
      planner_id: plannerId,
      user_id: user?.id ?? "offline-user",
      title: "Untitled Note",
      content: "",
      updated_at: new Date().toISOString(),
    };

    // Optimistically insert into cache
    qc.setQueryData(["notes", plannerId], (old: Note[] = []) => [newNote, ...old]);
    setActiveId(newId);
    setTitle("Untitled Note");
    setBody("");

    if (navigator.onLine && user) {
      try {
        const { error } = await supabase.from("notes").insert({
          id: newId,
          planner_id: plannerId,
          user_id: user.id,
          title: "Untitled Note",
          content: "",
        });
        if (error) throw error;
      } catch (e) {
        await queueOfflineAction({
          type: "INSERT",
          table: "notes",
          payload: newNote,
        });
      }
    } else {
      await queueOfflineAction({
        type: "INSERT",
        table: "notes",
        payload: newNote,
      });
      toast.info("Note created offline. Will sync when back online.");
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this note?")) return;

    qc.setQueryData(["notes", plannerId], (old: Note[] = []) => old.filter((n) => n.id !== id));
    if (activeId === id) setActiveId(null);

    if (navigator.onLine) {
      try {
        await supabase.from("notes").delete().eq("id", id);
      } catch (e) {
        await queueOfflineAction({
          type: "DELETE",
          table: "notes",
          payload: { id },
        });
      }
    } else {
      await queueOfflineAction({
        type: "DELETE",
        table: "notes",
        payload: { id },
      });
    }
    toast.success("Note deleted");
  }

  return (
    <div className="flex flex-col md:grid md:grid-cols-[280px_1fr] gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar List */}
      <div className="rounded-2xl border border-white/10 bg-[#0c100e] overflow-hidden flex flex-col min-h-[250px] shadow-xl">
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="text-sm font-semibold tracking-wide text-foreground flex items-center gap-2">
            <span>Notes</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono">
              {notes.length}
            </span>
          </div>
          <Button size="sm" variant="ghost" onClick={addNote} className="h-8 w-8 p-0 hover:bg-emerald-500/10 hover:text-emerald-400">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={`w-full text-left px-4 py-3 transition-colors ${
                active?.id === n.id ? "bg-emerald-500/10 border-l-2 border-emerald-400" : "hover:bg-white/[0.03]"
              }`}
            >
              <div className="text-sm font-medium truncate text-foreground">{n.title || "Untitled Note"}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5 font-sans">
                {n.content ? n.content.slice(0, 45) : "Empty note..."}
              </div>
            </button>
          ))}
          {notes.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No notes yet. Click + to create one.
            </div>
          )}
        </div>
      </div>

      {/* Note Editor */}
      <div className="rounded-2xl border border-white/10 bg-[#0c100e] overflow-hidden flex flex-col shadow-xl">
        {active ? (
          <>
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02] gap-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="border-0 bg-transparent font-display text-xl font-bold focus-visible:ring-0 text-foreground px-2 h-9"
              />
              <div className="flex items-center gap-2 shrink-0">
                {/* Save Status Indicator */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded-md bg-white/5 font-mono">
                  {saveStatus === "saving" && (
                    <>
                      <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                      <span className="text-[11px] text-amber-400">Saving...</span>
                    </>
                  )}
                  {saveStatus === "synced" && (
                    <>
                      <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400 hidden sm:inline">Saved</span>
                    </>
                  )}
                  {saveStatus === "offline" && (
                    <>
                      <CloudOff className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-[11px] text-blue-400 hidden sm:inline">Saved Offline</span>
                    </>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => del(active.id)}
                  className="h-8 w-8 p-0 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Start writing your thoughts, strategies, or meeting notes..."
              className="flex-1 border-0 rounded-none resize-none focus-visible:ring-0 bg-transparent p-6 text-sm md:text-base leading-relaxed text-foreground/90 font-sans custom-scrollbar"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
            <p className="mb-4">Select an existing note or create a new one.</p>
            <Button onClick={addNote} variant="outline" className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              <Plus className="h-4 w-4" /> Create Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
