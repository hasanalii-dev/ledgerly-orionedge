import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/investments")({
  component: InvestmentsPage,
});

type Row = {
  id: string;
  name: string;
  kind: string;
  symbol: string | null;
  allocated_amount: number;
  current_value: number;
  return_amount: number;
  currency: string;
  purchase_date: string | null;
  notes: string | null;
};

const KINDS = [
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "stock", label: "Stock" },
  { value: "crypto", label: "Crypto" },
  { value: "bond", label: "Bond" },
  { value: "real_estate", label: "Real Estate" },
  { value: "custom", label: "Custom" },
];

function InvestmentsPage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState("");
  const currency = usePlannerCurrency(plannerId);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? "")); }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["investments", plannerId],
    queryFn: async () =>
      ((await supabase.from("investments").select("*").eq("planner_id", plannerId).order("created_at")).data ?? []) as unknown as Row[],
  });

  const totalAllocated = rows.reduce((s, r) => s + Number(r.allocated_amount ?? 0), 0);
  const totalValue = rows.reduce((s, r) => s + Number(r.current_value ?? 0), 0);
  const totalReturn = rows.reduce((s, r) => s + Number(r.return_amount ?? 0), 0);
  const roi = totalAllocated > 0 ? ((totalValue + totalReturn - totalAllocated) / totalAllocated) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Investments</h1>
        <p className="text-sm text-muted-foreground">Allocate capital and track returns across your portfolio.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Allocated" value={formatMoney(totalAllocated, currency)} />
        <Kpi label="Current value" value={formatMoney(totalValue, currency)} />
        <Kpi label="Returns" value={formatMoney(totalReturn, currency)} tone={totalReturn >= 0 ? "up" : "down"} />
        <Kpi label="ROI" value={`${roi.toFixed(2)}%`} tone={roi >= 0 ? "up" : "down"} />
      </div>

      <EditableTable<Row>
        table="investments"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["investments", plannerId]]}
        currency={currency}
        onNewRow={() => ({ name: "New investment", kind: "stock", allocated_amount: 0, current_value: 0, return_amount: 0, currency })}
        totals={{ amountKey: "current_value", label: "Total value" }}
        columns={[
          { key: "name", label: "Name", render: (r, on) => <CellInput value={r.name ?? ""} onChange={(v) => on({ name: v })} /> },
          { key: "kind", label: "Type", width: "150px", render: (r, on) => <CellSelect value={r.kind ?? "stock"} onChange={(v) => on({ kind: v })} options={KINDS} /> },
          { key: "symbol", label: "Symbol", width: "110px", render: (r, on) => <CellInput value={r.symbol ?? ""} onChange={(v) => on({ symbol: v.toUpperCase() })} className="uppercase font-mono" /> },
          { key: "allocated_amount", label: "Allocated", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.allocated_amount ?? 0)} onChange={(v) => on({ allocated_amount: parseFloat(v) || 0 })} className="text-right font-mono" /> },
          { key: "current_value", label: "Current", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.current_value ?? 0)} onChange={(v) => on({ current_value: parseFloat(v) || 0 })} className="text-right font-mono" /> },
          { key: "return_amount", label: "Return", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.return_amount ?? 0)} onChange={(v) => on({ return_amount: parseFloat(v) || 0 })} className="text-right font-mono" /> },
          { key: "currency", label: "CCY", width: "80px", render: (r, on) => <CellInput value={r.currency ?? currency} onChange={(v) => on({ currency: v.toUpperCase() })} className="uppercase" /> },
          { key: "purchase_date", label: "Purchased", width: "140px", render: (r, on) => <CellInput type="date" value={r.purchase_date ?? ""} onChange={(v) => on({ purchase_date: v || null })} /> },
          { key: "notes", label: "Notes", render: (r, on) => <CellInput value={r.notes ?? ""} onChange={(v) => on({ notes: v })} /> },
        ]}
      />
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-2xl border border-hairline bg-card p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`mt-1 font-display text-2xl ${tone === "up" ? "text-primary" : tone === "down" ? "text-destructive" : ""}`}>{value}</div>
    </div>
  );
}
