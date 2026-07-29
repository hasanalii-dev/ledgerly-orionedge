import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { INCOME_STATUSES } from "@/lib/format";
import { useEffect, useState } from "react";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import { exportToExcel } from "@/lib/export-excel";

type Row = {
  id: string;
  date: string;
  description: string | null;
  client_id: string | null;
  project_id: string | null;
  invoice_id: string | null;
  amount: number;
  currency: string;
  status: string;
  account_id: string | null;
  notes: string | null;
};

function IncomePage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState<string>("");
  const currency = usePlannerCurrency(plannerId);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? "")); }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["income", plannerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("income_entries").select("*").eq("planner_id", plannerId).order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients", plannerId],
    queryFn: async () => (await supabase.from("clients").select("id, name").eq("planner_id", plannerId)).data ?? [],
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", plannerId],
    queryFn: async () => (await supabase.from("projects").select("id, name").eq("planner_id", plannerId)).data ?? [],
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", plannerId],
    queryFn: async () => (await supabase.from("accounts").select("id, name").eq("planner_id", plannerId)).data ?? [],
  });

  const handleExport = () => {
    const headers = ["Date", "Description", "Client", "Project", "Amount", "Currency", "Status", "Account", "Notes"];
    const exportRows = rows.map((r) => [
      r.date ?? "",
      r.description ?? "",
      clients.find((c) => c.id === r.client_id)?.name ?? "",
      projects.find((p) => p.id === r.project_id)?.name ?? "",
      r.amount ?? 0,
      r.currency ?? currency,
      r.status ?? "",
      accounts.find((a) => a.id === r.account_id)?.name ?? "",
      r.notes ?? "",
    ]);
    exportToExcel("Income_Registry", headers, exportRows);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-[#3DDC97]" /> Income
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">Every payment received. Autosaves as you type.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-sans text-xs gap-2 self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-[#3DDC97]" /> Export Excel
        </Button>
      </div>

      <EditableTable<Row>
        table="income_entries"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["income", plannerId], ["dashboard", plannerId]]}
        onNewRow={() => ({ date: new Date().toISOString().slice(0, 10), amount: 0, currency, status: "pending" })}
        currency={currency}
        totals={{ amountKey: "amount", label: "Total" }}
        columns={[
          { key: "date", label: "Date", width: "130px", render: (r, on) => <CellInput type="date" value={r.date ?? ""} onChange={(v) => on({ date: v })} /> },
          { key: "description", label: "Source / Description", render: (r, on) => <CellInput value={r.description ?? ""} onChange={(v) => on({ description: v })} /> },
          { key: "client_id", label: "Client", width: "160px", render: (r, on) => <CellSelect value={r.client_id ?? ""} onChange={(v) => on({ client_id: v || null })} options={clients.map((c) => ({ value: c.id, label: c.name }))} /> },
          { key: "project_id", label: "Project", width: "160px", render: (r, on) => <CellSelect value={r.project_id ?? ""} onChange={(v) => on({ project_id: v || null })} options={projects.map((p) => ({ value: p.id, label: p.name }))} /> },
          { key: "amount", label: "Amount", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.amount ?? 0)} onChange={(v) => on({ amount: parseFloat(v) || 0 })} className="text-right font-sans" /> },
          { key: "currency", label: "CCY", width: "80px", render: (r, on) => <CellInput value={r.currency ?? currency} onChange={(v) => on({ currency: v.toUpperCase() })} className="uppercase font-sans" /> },
          { key: "status", label: "Status", width: "130px", render: (r, on) => <CellSelect value={r.status ?? "pending"} onChange={(v) => on({ status: v })} options={INCOME_STATUSES} /> },
          { key: "account_id", label: "Account", width: "150px", render: (r, on) => <CellSelect value={r.account_id ?? ""} onChange={(v) => on({ account_id: v || null })} options={accounts.map((a) => ({ value: a.id, label: a.name }))} /> },
          { key: "notes", label: "Notes", render: (r, on) => <CellInput value={r.notes ?? ""} onChange={(v) => on({ notes: v })} /> },
        ]}
      />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/income")({
  component: IncomePage,
});
