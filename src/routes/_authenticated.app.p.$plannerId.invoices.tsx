import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { INVOICE_STATUSES } from "@/lib/format";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/invoices")({
  component: InvoicesPage,
});

type Row = { id: string; invoice_number: string; client_id: string | null; project_id: string | null; issue_date: string; due_date: string | null; amount: number; currency: string; status: string };

function InvoicesPage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState("");
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? "")); }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["invoices", plannerId],
    queryFn: async () => ((await supabase.from("invoices").select("*").eq("planner_id", plannerId).order("issue_date", { ascending: false })).data ?? []) as unknown as Row[],
  });
  const { data: clients = [] } = useQuery({ queryKey: ["clients", plannerId], queryFn: async () => (await supabase.from("clients").select("id, name").eq("planner_id", plannerId)).data ?? [] });
  const { data: projects = [] } = useQuery({ queryKey: ["projects", plannerId], queryFn: async () => (await supabase.from("projects").select("id, name").eq("planner_id", plannerId)).data ?? [] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Invoices</h1>
        <p className="text-sm text-muted-foreground">Track what's been billed and what's been paid.</p>
      </div>
      <EditableTable<Row>
        table="invoices"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["invoices", plannerId]]}
        onNewRow={() => ({ issue_date: new Date().toISOString().slice(0, 10), amount: 0, currency: "USD", status: "pending", invoice_number: `INV-${Date.now().toString().slice(-6)}` })}
        totals={{ amountKey: "amount", label: "Billed" }}
        columns={[
          { key: "invoice_number", label: "Number", width: "140px", render: (r, on) => <CellInput value={r.invoice_number ?? ""} onChange={(v) => on({ invoice_number: v })} /> },
          { key: "client_id", label: "Client", width: "170px", render: (r, on) => <CellSelect value={r.client_id ?? ""} onChange={(v) => on({ client_id: v || null })} options={clients.map((c) => ({ value: c.id, label: c.name }))} /> },
          { key: "project_id", label: "Project", width: "170px", render: (r, on) => <CellSelect value={r.project_id ?? ""} onChange={(v) => on({ project_id: v || null })} options={projects.map((p) => ({ value: p.id, label: p.name }))} /> },
          { key: "issue_date", label: "Issued", width: "140px", render: (r, on) => <CellInput type="date" value={r.issue_date ?? ""} onChange={(v) => on({ issue_date: v })} /> },
          { key: "due_date", label: "Due", width: "140px", render: (r, on) => <CellInput type="date" value={r.due_date ?? ""} onChange={(v) => on({ due_date: v || null })} /> },
          { key: "amount", label: "Amount", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.amount ?? 0)} onChange={(v) => on({ amount: parseFloat(v) || 0 })} className="text-right font-mono" /> },
          { key: "currency", label: "CCY", width: "80px", render: (r, on) => <CellInput value={r.currency ?? "USD"} onChange={(v) => on({ currency: v.toUpperCase() })} className="uppercase" /> },
          { key: "status", label: "Status", width: "140px", render: (r, on) => <CellSelect value={r.status ?? "pending"} onChange={(v) => on({ status: v })} options={INVOICE_STATUSES.map((s) => ({ value: s, label: s }))} /> },
        ]}
      />
    </div>
  );
}
