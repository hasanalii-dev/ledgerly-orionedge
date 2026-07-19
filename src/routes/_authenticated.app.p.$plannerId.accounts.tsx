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
  const [activeIndex, setActiveIndex] = useState(0);

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
        <div className="relative w-full flex flex-col items-center">
          <div 
            className="flex overflow-x-auto snap-x snap-mandatory w-full pt-4 pb-6 gap-4 px-4 sm:px-0 sm:justify-center [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const itemWidth = el.scrollWidth / rows.length;
              const index = Math.round(el.scrollLeft / itemWidth);
              setActiveIndex(Math.min(index, rows.length - 1));
            }}
          >
            {rows.map((a) => {
              const live = Number(a.opening_balance ?? 0) + (balMap.get(a.id) ?? 0);
              
              const getCardStyles = (kind: string) => {
                switch (kind) {
                  case 'wallet': return { base: 'bg-[#171508]', g1: 'from-yellow-500/40', g2: 'from-amber-600/30', g3: 'from-orange-400/30' };
                  case 'cash': return { base: 'bg-[#051616]', g1: 'from-cyan-400/40', g2: 'from-[#3DDC97]/30', g3: 'from-teal-500/40' };
                  case 'bank':
                  default: return { base: 'bg-[#071d15]', g1: 'from-[#3DDC97]/40', g2: 'from-cyan-500/30', g3: 'from-teal-800/50' };
                }
              };

              const cardStyle = getCardStyles(a.kind || 'bank');

              return (
                <div key={a.id} className={`snap-center shrink-0 rounded-[28px] relative overflow-hidden group w-[85vw] max-w-[360px] aspect-[1.586] flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${cardStyle.base}`}>
                  {/* Abstract geometric shapes */}
                  <div className="absolute inset-0 opacity-100 z-0 mix-blend-screen pointer-events-none">
                    <div className={`absolute -top-[30%] -right-[10%] w-[80%] h-[120%] bg-gradient-to-bl ${cardStyle.g1} to-transparent rotate-12 blur-2xl`} />
                    <div className={`absolute top-[20%] -left-[20%] w-[70%] h-[100%] bg-gradient-to-tr ${cardStyle.g2} to-transparent -rotate-12 blur-3xl`} />
                    <div className={`absolute bottom-[0%] right-[0%] w-[60%] h-[80%] bg-gradient-to-tl ${cardStyle.g3} to-transparent blur-2xl`} />
                  </div>
                  
                  {/* Shimmer Hover Animation */}
                  <div className="absolute inset-0 z-20 pointer-events-none w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] -skew-x-[20deg] group-hover:translate-x-[50%] transition-transform duration-1000 ease-in-out" />

                  {/* Overlay texture on the right half (like the image pattern) */}
                  <div className="absolute top-0 bottom-0 right-0 w-[45%] opacity-[0.07] z-0 pointer-events-none mix-blend-overlay [mask-image:linear-gradient(to_left,white,transparent)]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'40\' viewBox=\'0 0 20 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 20 L20 0 L20 40 Z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '12px 24px' }} />
                  
                  {/* Frosted Bottom section */}
                  <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-white/5 backdrop-blur-[2px] z-0 border-t border-white/5" />

                  {/* Highlight edges */}
                  <div className="absolute inset-0 rounded-[28px] border border-white/10 pointer-events-none z-20" />
                  <div className="absolute inset-0 rounded-[28px] border-t border-white/20 pointer-events-none z-20 [mask-image:linear-gradient(to_bottom,white,transparent_30%)]" />

                  {/* Card Content Top */}
                  <div className="relative z-10 flex justify-between items-start px-6 pt-6">
                    <div>
                      <div className="text-white/80 text-sm font-medium tracking-wide mb-1">{a.name}</div>
                      <div className="text-white text-xl font-mono tracking-widest drop-shadow-sm font-semibold flex items-center gap-2">
                        <span className="text-white/60">xxxx</span> <span className="text-white/60">xxxx</span> {a.id.slice(0, 4).toUpperCase()}
                      </div>
                    </div>
                    {/* Morphing Badge / Edit Button */}
                    <div className="relative mt-1 h-7 min-w-[60px] flex items-center justify-center">
                      <div className="absolute whitespace-nowrap bg-black/20 backdrop-blur-md border border-white/10 text-white/90 text-[11px] font-medium tracking-wide px-3 py-1.5 rounded-full shadow-inner transition-all duration-300 group-hover:opacity-0 group-hover:scale-50 group-hover:rotate-45 pointer-events-none">
                        {(a.kind || 'bank').toUpperCase()}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute h-8 w-8 opacity-0 scale-50 -rotate-45 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0 transition-all duration-300 bg-black/40 hover:bg-black/60 text-white hover:text-white backdrop-blur-md border border-white/20 rounded-full z-30 shadow-xl"
                        onClick={(e) => { e.preventDefault(); setEditAcc(a); setEditAmt(String(live)); }}
                        title="Edit Account Balance"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Card Content Bottom */}
                  <div className="relative z-10 flex items-center justify-between px-6 pb-6 mt-auto">
                    <div className="text-white/70 text-sm font-medium">Live Balance</div>
                    <div className="font-display text-3xl font-bold text-white tracking-tight drop-shadow-md">{formatMoney(live, a.currency)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 mt-2">
            {rows.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-6 bg-white/80' : 'w-1.5 bg-white/20'}`}
              />
            ))}
          </div>
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
