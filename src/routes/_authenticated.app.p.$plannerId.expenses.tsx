import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { useEffect, useState } from "react";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { Button } from "@/components/ui/button";
import { Download, TrendingDown } from "lucide-react";
import { exportToExcel } from "@/lib/export-excel";

type Row = {
  id: string;
  date: string;
  vendor: string | null;
  description: string | null;
  category_id: string | null;
  amount: number;
  currency: string;
  account_id: string | null;
  notes: string | null;
};

function ExpensesPage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState<string>("");
  const currency = usePlannerCurrency(plannerId);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? "")); }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["expenses", plannerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("expense_entries").select("*").eq("planner_id", plannerId).order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["expense_categories", plannerId],
    queryFn: async () => (await supabase.from("expense_categories").select("id, name").eq("planner_id", plannerId).order("name")).data ?? [],
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", plannerId],
    queryFn: async () => (await supabase.from("accounts").select("id, name").eq("planner_id", plannerId)).data ?? [],
  });

  const handleExport = () => {
    const headers = ["Date", "Vendor", "Description", "Category", "Amount", "Currency", "Account", "Notes"];
    const exportRows = rows.map((r) => [
      r.date ?? "",
      r.vendor ?? "",
      r.description ?? "",
      cats.find((c) => c.id === r.category_id)?.name ?? "",
      r.amount ?? 0,
      r.currency ?? currency,
      accounts.find((a) => a.id === r.account_id)?.name ?? "",
      r.notes ?? "",
    ]);
    exportToExcel("Expense_Registry", headers, exportRows);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingDown className="h-7 w-7 text-orange-400" /> Expenses
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">Track operational outgoings, vendor payouts, and office costs.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-sans text-xs gap-2 self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-orange-400" /> Export Excel
        </Button>
      </div>

      <EditableTable<Row>
        table="expense_entries"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["expenses", plannerId], ["dashboard", plannerId]]}
        onNewRow={() => ({ date: new Date().toISOString().slice(0, 10), amount: 0, currency })}
        currency={currency}
        totals={{ amountKey: "amount", label: "Total" }}
        columns={[
          { key: "date", label: "Date", width: "130px", render: (r, on) => <CellInput type="date" value={r.date ?? ""} onChange={(v) => on({ date: v })} /> },
          { key: "vendor", label: "Vendor / Recipient", width: "180px", render: (r, on) => <CellInput value={r.vendor ?? ""} onChange={(v) => on({ vendor: v })} /> },
          { key: "description", label: "Description", render: (r, on) => <CellInput value={r.description ?? ""} onChange={(v) => on({ description: v })} /> },
          { key: "category_id", label: "Category", width: "170px", render: (r, on) => <CellSelect value={r.category_id ?? ""} onChange={(v) => on({ category_id: v || null })} options={cats.map((c) => ({ value: c.id, label: c.name }))} /> },
          { key: "amount", label: "Amount", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.amount ?? 0)} onChange={(v) => on({ amount: parseFloat(v) || 0 })} className="text-right font-sans" /> },
          { key: "currency", label: "CCY", width: "80px", render: (r, on) => <CellInput value={r.currency ?? currency} onChange={(v) => on({ currency: v.toUpperCase() })} className="uppercase font-sans" /> },
          { key: "account_id", label: "Account", width: "150px", render: (r, on) => <CellSelect value={r.account_id ?? ""} onChange={(v) => on({ account_id: v || null })} options={accounts.map((a) => ({ value: a.id, label: a.name }))} /> },
          { key: "notes", label: "Notes", render: (r, on) => <CellInput value={r.notes ?? ""} onChange={(v) => on({ notes: v })} /> },
        ]}
      />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/expenses")({
  component: ExpensesPage,
});
