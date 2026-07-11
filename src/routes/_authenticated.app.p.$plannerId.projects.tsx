import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { PROJECT_STATUSES } from "@/lib/format";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/projects")({
  component: ProjectsPage,
});

type Row = { id: string; name: string; client_id: string | null; status: string; budget: number | string | null; start_date: string | null; end_date: string | null; notes: string | null };

function ProjectsPage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState("");
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? "")); }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["projects", plannerId],
    queryFn: async () => (await supabase.from("projects").select("*").eq("planner_id", plannerId).order("created_at", { ascending: false })).data as Row[] ?? [],
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients", plannerId],
    queryFn: async () => (await supabase.from("clients").select("id, name").eq("planner_id", plannerId)).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Projects</h1>
        <p className="text-sm text-muted-foreground">Scope, budget and status per engagement.</p>
      </div>
      <EditableTable<Row>
        table="projects"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["projects", plannerId]]}
        onNewRow={() => ({ name: "New project", status: "active" })}
        columns={[
          { key: "name", label: "Name", render: (r, on) => <CellInput value={r.name ?? ""} onChange={(v) => on({ name: v })} /> },
          { key: "client_id", label: "Client", width: "170px", render: (r, on) => <CellSelect value={r.client_id ?? ""} onChange={(v) => on({ client_id: v || null })} options={clients.map((c) => ({ value: c.id, label: c.name }))} /> },
          { key: "status", label: "Status", width: "140px", render: (r, on) => <CellSelect value={r.status ?? "active"} onChange={(v) => on({ status: v })} options={PROJECT_STATUSES.map((s) => ({ value: s, label: s }))} /> },
          { key: "budget", label: "Budget", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.budget ?? 0)} onChange={(v) => on({ budget: parseFloat(v) || 0 })} className="text-right font-mono" /> },
          { key: "start_date", label: "Start", width: "140px", render: (r, on) => <CellInput type="date" value={r.start_date ?? ""} onChange={(v) => on({ start_date: v || null })} /> },
          { key: "end_date", label: "End", width: "140px", render: (r, on) => <CellInput type="date" value={r.end_date ?? ""} onChange={(v) => on({ end_date: v || null })} /> },
          { key: "notes", label: "Notes", render: (r, on) => <CellInput value={r.notes ?? ""} onChange={(v) => on({ notes: v })} /> },
        ]}
      />
    </div>
  );
}
