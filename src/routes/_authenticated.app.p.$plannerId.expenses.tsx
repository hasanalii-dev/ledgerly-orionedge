import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/expenses")({
  component: ExpensesPage,
});

type Row = {
  id: string;
  date: string;
  vendor: string | null;
  category_id: string | null;
  amount: number | string;
  currency: string;
  account_id: string | null;
  is_recurring: boolean;
  notes: string | null;
};

function ExpensesPage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState<string>("");
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? "")); }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["expenses", plannerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("expense_entries").select("*").eq("planner_id", plannerId).order("date", { ascending: false });
      if (error) throw error;
      return data as Row[];
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Expenses</h1>
        <p className="text-sm text-muted-foreground">Every dollar out — categorized and searchable.</p>
      </div>
      <EditableTable<Row>
        table="expense_entries"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["expenses", plannerId], ["dashboard", plannerId]]}
        onNewRow={() => ({ date: new Date().toISOString().slice(0, 10), amount: 0, currency: "USD", is_recurring: false })}
        totals={{ amountKey: "amount", label: "Total" }}
        columns={[
          { key: "date", label: "Date", width: "130px", render: (r, on) => <CellInput type="date" value={r.date ?? ""} onChange={(v) => on({ date: v })} /> },
          { key: "vendor", label: "Vendor / Description", render: (r, on) => <CellInput value={r.vendor ?? ""} onChange={(v) => on({ vendor: v })} /> },
          { key: "category_id", label: "Category", width: "160px", render: (r, on) => <CellSelect value={r.category_id ?? ""} onChange={(v) => on({ category_id: v || null })} options={cats.map((c) => ({ value: c.id, label: c.name }))} /> },
          { key: "amount", label: "Amount", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.amount ?? 0)} onChange={(v) => on({ amount: parseFloat(v) || 0 })} className="text-right font-mono" /> },
          { key: "currency", label: "CCY", width: "80px", render: (r, on) => <CellInput value={r.currency ?? "USD"} onChange={(v) => on({ currency: v.toUpperCase() })} className="uppercase" /> },
          { key: "account_id", label: "Account", width: "150px", render: (r, on) => <CellSelect value={r.account_id ?? ""} onChange={(v) => on({ account_id: v || null })} options={accounts.map((a) => ({ value: a.id, label: a.name }))} /> },
          { key: "notes", label: "Notes", render: (r, on) => <CellInput value={r.notes ?? ""} onChange={(v) => on({ notes: v })} /> },
        ]}
      />
    </div>
  );
}
