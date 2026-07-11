import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Folder, Upload, FileText, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRef, useState } from "react";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/vault")({
  component: VaultPage,
});

type F = { id: string; name: string };
type Doc = { id: string; folder_id: string | null; file_name: string; file_path: string; size_bytes: number | null; mime_type: string | null; created_at: string };

function VaultPage() {
  const { plannerId } = Route.useParams();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const { data: folders = [] } = useQuery({
    queryKey: ["folders", plannerId],
    queryFn: async () => ((await supabase.from("doc_folders").select("id, name").eq("planner_id", plannerId).order("name")).data ?? []) as F[],
  });
  const { data: docs = [] } = useQuery({
    queryKey: ["docs", plannerId, activeFolder],
    queryFn: async () => {
      let q = supabase.from("documents").select("*").eq("planner_id", plannerId).order("created_at", { ascending: false });
      if (activeFolder) q = q.eq("folder_id", activeFolder);
      return ((await q).data ?? []) as unknown as Doc[];
    },
  });

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    for (const file of Array.from(files)) {
      const path = `${user.id}/${plannerId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("planner-files").upload(path, file);
      if (upErr) { toast.error(upErr.message); continue; }
      const { error } = await supabase.from("documents").insert({
        planner_id: plannerId, user_id: user.id, folder_id: activeFolder,
        file_name: file.name, file_path: path, size_bytes: file.size, mime_type: file.type,
      });
      if (error) toast.error(error.message);
    }
    toast.success("Uploaded");
    qc.invalidateQueries({ queryKey: ["docs", plannerId] });
  }

  async function download(doc: Doc) {
    const { data, error } = await supabase.storage.from("planner-files").createSignedUrl(doc.file_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  }
  async function remove(doc: Doc) {
    if (!confirm(`Delete "${doc.file_name}"?`)) return;
    await supabase.storage.from("planner-files").remove([doc.file_path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    qc.invalidateQueries({ queryKey: ["docs", plannerId] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Vault</h1>
          <p className="text-sm text-muted-foreground">Invoices, receipts, contracts — private and encrypted at rest.</p>
        </div>
        <input ref={fileRef} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
        <Button onClick={() => fileRef.current?.click()} className="glow-emerald"><Upload className="h-4 w-4 mr-1" />Upload</Button>
      </div>
      <div className="grid grid-cols-[240px_1fr] gap-6">
        <div className="rounded-2xl border border-hairline bg-card p-2 h-fit">
          <button onClick={() => setActiveFolder(null)} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${!activeFolder ? "bg-elevated" : "hover:bg-elevated/60"}`}>
            <Folder className="h-4 w-4" />All files
          </button>
          {folders.map((f) => (
            <button key={f.id} onClick={() => setActiveFolder(f.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${activeFolder === f.id ? "bg-elevated" : "hover:bg-elevated/60"}`}>
              <Folder className="h-4 w-4" />{f.name}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-hairline bg-card overflow-hidden">
          {docs.length === 0 ? (
            <div className="p-16 text-center text-sm text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-3 opacity-40" />
              Drop files or click Upload to get started.
            </div>
          ) : (
            <div>
              {docs.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3 border-b border-hairline last:border-0 hover:bg-elevated/40 group">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.file_name}</div>
                    <div className="text-xs text-muted-foreground">{d.size_bytes ? `${(d.size_bytes / 1024).toFixed(1)} KB · ` : ""}{new Date(d.created_at).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => download(d)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"><Download className="h-4 w-4" /></button>
                  <button onClick={() => remove(d)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
