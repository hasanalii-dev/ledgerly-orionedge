import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { ACCOUNT_KINDS } from "@/lib/format";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/format";
import { Wallet, Pencil } from "lucide-react";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/accounts")({
  component: AccountsPage,
});

type Row = { id: string; name: string; kind: string; currency: string; opening_balance: number; color: string | null };

function AccountsPage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState("");
  const currency = usePlannerCurrency(plannerId);
  const qc = useQueryClient();

  const [editAcc, setEditAcc] = useState<Row | null>(null);
  const [editAmt, setEditAmt] = useState("");
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

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editAcc || !editAmt) return;
      const b = balMap.get(editAcc.id) ?? 0;
      const newOpening = Number(editAmt) - b;
      const { error } = await supabase.from("accounts").update({ opening_balance: newOpening }).eq("id", editAcc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Account balance updated!");
      setEditAcc(null);
      qc.invalidateQueries({ queryKey: ["accounts", plannerId] });
    },
    onError: (e) => toast.error(e.message)
  });

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
              <div key={a.id} className="rounded-2xl border border-hairline bg-card p-4 relative group">
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                  <Wallet className="h-3.5 w-3.5" />{a.kind}
                </div>
                <div className="mt-1 font-medium truncate">{a.name}</div>
                <div className="mt-2 font-display text-2xl text-primary">{formatMoney(live, a.currency)}</div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                  onClick={() => { setEditAcc(a); setEditAmt(String(live)); }}
                  title="Edit Account Balance"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
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

      <Dialog open={!!editAcc} onOpenChange={(open) => !open && setEditAcc(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit Account Balance</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">Force set the exact balance for <strong>{editAcc?.name}</strong>. This ignores tracking data and resets the starting balance.</p>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Balance</label>
              <Input type="number" value={editAmt} onChange={(e) => setEditAmt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditAcc(null)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !editAmt} className="glow-emerald">Save Balance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
