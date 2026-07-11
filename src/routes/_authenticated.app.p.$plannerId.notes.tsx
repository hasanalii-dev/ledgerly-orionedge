import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/notes")({
  component: NotesPage,
});

type Note = { id: string; title: string | null; content: string | null; updated_at: string };

function NotesPage() {
  const { plannerId } = Route.useParams();
  const qc = useQueryClient();
  const { data: notes = [] } = useQuery({
    queryKey: ["notes", plannerId],
    queryFn: async () => (await supabase.from("notes").select("*").eq("planner_id", plannerId).order("updated_at", { ascending: false })).data as Note[] ?? [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = notes.find((n) => n.id === activeId) ?? notes[0];
  const [title, setTitle] = useState(""); const [body, setBody] = useState("");

  useEffect(() => { if (active) { setTitle(active.title ?? ""); setBody(active.content ?? ""); } }, [active?.id]);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(async () => {
      if (title === (active.title ?? "") && body === (active.content ?? "")) return;
      await supabase.from("notes").update({ title, content: body }).eq("id", active.id);
      qc.invalidateQueries({ queryKey: ["notes", plannerId] });
    }, 700);
    return () => clearTimeout(t);
  }, [title, body, active, plannerId, qc]);

  async function addNote() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("notes").insert({ planner_id: plannerId, user_id: user.id, title: "Untitled" }).select("id").single();
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["notes", plannerId] });
    setActiveId(data.id);
  }
  async function del(id: string) {
    if (!confirm("Delete this note?")) return;
    await supabase.from("notes").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["notes", plannerId] });
    setActiveId(null);
  }

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6 h-[calc(100vh-160px)]">
      <div className="rounded-2xl border border-hairline bg-card overflow-hidden flex flex-col">
        <div className="p-3 border-b border-hairline flex items-center justify-between">
          <div className="text-sm font-medium">Notes</div>
          <Button size="sm" variant="ghost" onClick={addNote}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="flex-1 overflow-auto">
          {notes.map((n) => (
            <button key={n.id} onClick={() => setActiveId(n.id)} className={`w-full text-left px-3 py-2.5 border-b border-hairline hover:bg-elevated ${active?.id === n.id ? "bg-elevated" : ""}`}>
              <div className="text-sm font-medium truncate">{n.title || "Untitled"}</div>
              <div className="text-xs text-muted-foreground truncate">{(n.content ?? "").slice(0, 40)}</div>
            </button>
          ))}
          {notes.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No notes yet.</div>}
        </div>
      </div>
      <div className="rounded-2xl border border-hairline bg-card overflow-hidden flex flex-col">
        {active ? (
          <>
            <div className="p-3 border-b border-hairline flex items-center gap-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border-0 bg-transparent font-display text-lg focus-visible:ring-0" />
              <Button size="sm" variant="ghost" onClick={() => del(active.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Start writing…" className="flex-1 border-0 rounded-none resize-none focus-visible:ring-0 bg-transparent p-6 text-base leading-relaxed" />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Select or create a note</div>
        )}
      </div>
    </div>
  );
}
