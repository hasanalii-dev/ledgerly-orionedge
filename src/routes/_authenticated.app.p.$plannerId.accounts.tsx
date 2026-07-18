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
        <div className="flex flex-wrap justify-center gap-6">
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
            
            const getCardLogo = (kind: string) => {
              switch (kind) {
                case 'wallet': return <div className="text-white/90 font-extrabold text-xl tracking-wider">WALLET</div>;
                case 'cash': return <div className="text-white/90 font-extrabold text-xl tracking-wider">CASH</div>;
                case 'bank':
                default: return (
                  <div>
                    <div className="text-white font-extrabold text-2xl tracking-tighter italic">VISA</div>
                    <div className="text-white/70 text-[9px] font-medium tracking-widest uppercase mt-0.5">Platinum</div>
                  </div>
                );
              }
            };

            const cardStyle = getCardStyles(a.kind || 'bank');

            return (
              <div key={a.id} className={`rounded-[20px] relative overflow-hidden group w-full max-w-[320px] aspect-[1.586] p-5 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${cardStyle.base}`}>
                {/* Abstract geometric shapes */}
                <div className="absolute inset-0 opacity-100 z-0 mix-blend-screen pointer-events-none">
                  <div className={`absolute -top-[30%] -right-[10%] w-[80%] h-[120%] bg-gradient-to-bl ${cardStyle.g1} to-transparent rotate-12 blur-2xl`} />
                  <div className={`absolute top-[20%] -left-[20%] w-[70%] h-[100%] bg-gradient-to-tr ${cardStyle.g2} to-transparent -rotate-12 blur-3xl`} />
                  <div className={`absolute bottom-[0%] right-[0%] w-[60%] h-[80%] bg-gradient-to-tl ${cardStyle.g3} to-transparent blur-2xl`} />
                </div>
                
                {/* Overlay texture for premium feel */}
                <div className="absolute inset-0 opacity-[0.04] z-0 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
                
                {/* Highlight edge */}
                <div className="absolute inset-0 rounded-[20px] border border-white/10 pointer-events-none z-20" />
                <div className="absolute inset-0 rounded-[20px] border-t border-white/20 pointer-events-none z-20 [mask-image:linear-gradient(to_bottom,white,transparent_40%)]" />

                {/* Shimmer Hover Animation */}
                <div className="absolute inset-0 z-20 pointer-events-none w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] -skew-x-[20deg] group-hover:translate-x-[50%] transition-transform duration-1000 ease-in-out" />

                {/* Card Content Top */}
                <div className="relative z-10 flex justify-between items-start pr-2">
                  {getCardLogo(a.kind || 'bank')}
                  {/* Contactless Icon */}
                  <svg className="w-4 h-4 text-white/50 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 21.6A16.4 16.4 0 0 1 4 15.4M12 21.6A20.4 20.4 0 0 1 6.5 13M15.5 21.6a24.4 24.4 0 0 1-6.5-11.2M19 21.6a28.4 28.4 0 0 1-6.5-13.8" />
                  </svg>
                </div>

                <div className="relative z-10 mt-auto">
                  {/* EMV Chip */}
                  <svg className="w-8 h-6 mb-1.5 text-white/40 ml-auto mr-1" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="47" height="35" rx="5.5" stroke="currentColor" strokeWidth="1" fill="transparent"/>
                    <path d="M12 0.5V35.5M36 0.5V35.5M0.5 12H12M36 12H47.5M0.5 24H12M36 24H47.5" stroke="currentColor" strokeWidth="1"/>
                    <rect x="16" y="8" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1" fill="transparent"/>
                  </svg>

                  <div className="text-white/80 text-[12px] font-mono tracking-[0.25em] mb-1.5 flex items-center gap-2 drop-shadow-sm">
                    <span>••••</span>
                    <span>••••</span>
                    <span>••••</span>
                    <span>{a.id.slice(0, 4).toUpperCase()}</span>
                  </div>
                  
                  <div className="flex items-end justify-between mb-2 pr-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-white/40 text-[6px] uppercase tracking-widest font-semibold">Card Holder</div>
                      <div className="text-white/90 text-[9px] uppercase tracking-widest font-medium truncate max-w-[150px]">{a.name}</div>
                    </div>
                    <div className="flex flex-col gap-0.5 items-end">
                      <div className="text-white/40 text-[6px] uppercase tracking-widest font-semibold">Valid Thru</div>
                      <div className="text-white/90 text-[9px] font-mono tracking-widest font-medium">12/28</div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-white/10 pt-2">
                    <div>
                      <div className="text-white/40 text-[7px] uppercase tracking-[0.15em] font-semibold mb-0.5">Live Balance</div>
                      <div className="font-display text-[20px] text-white tracking-tight drop-shadow-md leading-none">{formatMoney(live, a.currency)}</div>
                    </div>
                  </div>
                </div>

                {/* Edit Button overlay - Top Right */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 h-8 w-8 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 lg:translate-y-1 lg:group-hover:translate-y-0 bg-black/40 hover:bg-black/60 text-white/90 hover:text-white backdrop-blur-md border border-white/20 rounded-full z-30 shadow-lg"
                  onClick={(e) => { e.preventDefault(); setEditAcc(a); setEditAmt(String(live)); }}
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
