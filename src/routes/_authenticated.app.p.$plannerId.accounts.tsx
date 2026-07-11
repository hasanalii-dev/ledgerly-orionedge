import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { ACCOUNT_KINDS } from "@/lib/format";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/format";
import { Wallet } from "lucide-react";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/accounts")({
  component: AccountsPage,
});

type Row = { id: string; name: string; kind: string; currency: string; opening_balance: number; color: string | null };

function AccountsPage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState("");
  const currency = usePlannerCurrency(plannerId);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? "")); }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["accounts", plannerId],
    queryFn: async () => ((await supabase.from("accounts").select("*").eq("planner_id", plannerId).order("name")).data ?? []) as unknown as Row[],
  });
  const { data: bals = [] } = useQuery({
    queryKey: ["account_balances", plannerId],
    queryFn: async () => {
      const [{ data: inc }, { data: exp }] = await Promise.all([
        supabase.from("income_entries").select("account_id, amount").eq("planner_id", plannerId),
        supabase.from("expense_entries").select("account_id, amount").eq("planner_id", plannerId),
      ]);
      const map = new Map<string, number>();
      (inc ?? []).forEach((r) => { if (r.account_id) map.set(r.account_id, (map.get(r.account_id) ?? 0) + Number(r.amount)); });
      (exp ?? []).forEach((r) => { if (r.account_id) map.set(r.account_id, (map.get(r.account_id) ?? 0) - Number(r.amount)); });
      return Array.from(map.entries());
    },
  });
  const balMap = new Map(bals);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Accounts</h1>
        <p className="text-sm text-muted-foreground">Wallets, banks and cash — with live balances.</p>
      </div>

      {rows.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {rows.map((a) => {
            const live = Number(a.opening_balance ?? 0) + (balMap.get(a.id) ?? 0);
            return (
              <div key={a.id} className="rounded-2xl border border-hairline bg-card p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                  <Wallet className="h-3.5 w-3.5" />{a.kind}
                </div>
                <div className="mt-1 font-medium truncate">{a.name}</div>
                <div className="mt-2 font-display text-2xl text-primary">{formatMoney(live, a.currency)}</div>
              </div>
            );
          })}
        </div>
      )}

      <EditableTable<Row>
        table="accounts"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["accounts", plannerId]]}
        onNewRow={() => ({ name: "New account", kind: "bank", currency, opening_balance: 0 })}
        columns={[
          { key: "name", label: "Name", render: (r, on) => <CellInput value={r.name ?? ""} onChange={(v) => on({ name: v })} /> },
          { key: "kind", label: "Type", width: "140px", render: (r, on) => <CellSelect value={r.kind ?? "bank"} onChange={(v) => on({ kind: v })} options={ACCOUNT_KINDS.map((k) => ({ value: k, label: k }))} /> },
          { key: "currency", label: "CCY", width: "80px", render: (r, on) => <CellInput value={r.currency ?? currency} onChange={(v) => on({ currency: v.toUpperCase() })} className="uppercase" /> },
          { key: "opening_balance", label: "Opening", width: "140px", render: (r, on) => <CellInput type="number" value={String(r.opening_balance ?? 0)} onChange={(v) => on({ opening_balance: parseFloat(v) || 0 })} className="text-right font-mono" /> },
        ]}
      />
    </div>
  );
}
