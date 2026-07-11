import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput } from "@/components/editable-table";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/clients")({
  component: ClientsPage,
});

type Row = { id: string; name: string; email: string | null; phone: string | null; company: string | null; notes: string | null };

function ClientsPage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState("");
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? "")); }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["clients", plannerId],
    queryFn: async () => (await supabase.from("clients").select("*").eq("planner_id", plannerId).order("name")).data as Row[] ?? [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Clients</h1>
        <p className="text-sm text-muted-foreground">People and companies you work with.</p>
      </div>
      <EditableTable<Row>
        table="clients"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["clients", plannerId]]}
        onNewRow={() => ({ name: "New client" })}
        columns={[
          { key: "name", label: "Name", render: (r, on) => <CellInput value={r.name ?? ""} onChange={(v) => on({ name: v })} /> },
          { key: "company", label: "Company", render: (r, on) => <CellInput value={r.company ?? ""} onChange={(v) => on({ company: v })} /> },
          { key: "email", label: "Email", render: (r, on) => <CellInput value={r.email ?? ""} onChange={(v) => on({ email: v })} /> },
          { key: "phone", label: "Phone", render: (r, on) => <CellInput value={r.phone ?? ""} onChange={(v) => on({ phone: v })} /> },
          { key: "notes", label: "Notes", render: (r, on) => <CellInput value={r.notes ?? ""} onChange={(v) => on({ notes: v })} /> },
        ]}
      />
    </div>
  );
}
