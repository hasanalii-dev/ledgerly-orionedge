import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { InvoicePdfGenerator } from "@/components/invoice-pdf-generator";
import { INVOICE_STATUSES } from "@/lib/format";
import { useEffect, useState } from "react";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { exportToExcel } from "@/lib/export-excel";

type Row = { id: string; invoice_number: string; client_id: string | null; project_id: string | null; issue_date: string; due_date: string | null; amount: number; currency: string; status: string };

export function InvoicesPage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState("");
  const currency = usePlannerCurrency(plannerId);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? "")); }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["invoices", plannerId],
    queryFn: async () => ((await supabase.from("invoices").select("*").eq("planner_id", plannerId).order("issue_date", { ascending: false })).data ?? []) as unknown as Row[],
  });
  const { data: clients = [] } = useQuery({ queryKey: ["clients", plannerId], queryFn: async () => (await supabase.from("clients").select("id, name").eq("planner_id", plannerId)).data ?? [] });
  const { data: projects = [] } = useQuery({ queryKey: ["projects", plannerId], queryFn: async () => (await supabase.from("projects").select("id, name").eq("planner_id", plannerId)).data ?? [] });

  const handleExport = () => {
    const headers = ["Invoice Number", "Client", "Project", "Issue Date", "Due Date", "Amount", "Currency", "Status"];
    const exportRows = rows.map((r) => [
      r.invoice_number ?? "",
      clients.find((c) => c.id === r.client_id)?.name ?? "",
      projects.find((p) => p.id === r.project_id)?.name ?? "",
      r.issue_date ?? "",
      r.due_date ?? "",
      r.amount ?? 0,
      r.currency ?? currency,
      r.status ?? "",
    ]);
    exportToExcel("Invoices_Registry", headers, exportRows);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-purple-400" /> Invoices
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">Track what's been billed and what's been paid.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-sans text-xs gap-2 self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-purple-400" /> Export Excel
        </Button>
      </div>

      <EditableTable<Row>
        table="invoices"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["invoices", plannerId]]}
        onNewRow={() => ({ issue_date: new Date().toISOString().slice(0, 10), amount: 0, currency, status: "pending", invoice_number: `INV-${Date.now().toString().slice(-6)}` })}
        currency={currency}
        totals={{ amountKey: "amount", label: "Billed" }}
        columns={[
          { key: "invoice_number", label: "Number", width: "140px", render: (r, on) => <CellInput value={r.invoice_number ?? ""} onChange={(v) => on({ invoice_number: v })} /> },
          { key: "client_id", label: "Client", width: "160px", render: (r, on) => <CellSelect value={r.client_id ?? ""} onChange={(v) => on({ client_id: v || null })} options={clients.map((c) => ({ value: c.id, label: c.name }))} /> },
          { key: "project_id", label: "Project", width: "160px", render: (r, on) => <CellSelect value={r.project_id ?? ""} onChange={(v) => on({ project_id: v || null })} options={projects.map((p) => ({ value: p.id, label: p.name }))} /> },
          { key: "issue_date", label: "Issue Date", width: "130px", render: (r, on) => <CellInput type="date" value={r.issue_date ?? ""} onChange={(v) => on({ issue_date: v })} /> },
          { key: "due_date", label: "Due Date", width: "130px", render: (r, on) => <CellInput type="date" value={r.due_date ?? ""} onChange={(v) => on({ due_date: v || null })} /> },
          { key: "amount", label: "Amount", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.amount ?? 0)} onChange={(v) => on({ amount: parseFloat(v) || 0 })} className="text-right font-sans" /> },
          { key: "currency", label: "CCY", width: "80px", render: (r, on) => <CellInput value={r.currency ?? currency} onChange={(v) => on({ currency: v.toUpperCase() })} className="uppercase font-sans" /> },
          { key: "status", label: "Status", width: "130px", render: (r, on) => <CellSelect value={r.status ?? "pending"} onChange={(v) => on({ status: v })} options={INVOICE_STATUSES} /> },
          {
            key: "pdf",
            label: "PDF",
            width: "120px",
            render: (r) => (
              <div className="flex justify-center py-1">
                <InvoicePdfGenerator invoice={r} clientName={clients.find((c) => c.id === r.client_id)?.name} projectName={projects.find((p) => p.id === r.project_id)?.name} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/invoices")({
  component: InvoicesPage,
});
