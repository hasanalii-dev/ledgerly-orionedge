import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, PieChart as PieChartIcon, Check, X, Pencil, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/monthly")({
  component: MonthlyTracking,
});

type Allocation = {
  id: string;
  planner_id: string;
  month_year: string;
  allocation_type: string;
  category: string;
  description: string | null;
  amount: number;
  is_completed?: boolean;
};

function AllocationTable({
  title, type, total, items, currency, plannerId, monthYear, onAssign, netCashflow
}: {
  title: string; type: string; total: number; items: Allocation[]; currency: string; plannerId: string; monthYear: string; onAssign?: (amt: number, title: string, type: string) => void; netCashflow: number;
}) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCat, setEditCat] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAmt, setEditAmt] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [addCat, setAddCat] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addAmt, setAddAmt] = useState("");

  const toggleDoneMutation = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { error } = await (supabase as any).from("monthly_allocations").update({ is_completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["monthly_allocations", plannerId, monthYear] }),
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("monthly_allocations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["monthly_allocations", plannerId, monthYear] });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editCat || !editAmt) throw new Error("Category and Amount required");
      
      const newAmt = Number(editAmt);
      if (type !== "earning") {
         const currentItem = items.find(i => i.id === editingId);
         const amtDiff = newAmt - (currentItem ? currentItem.amount : 0);
         if (netCashflow - amtDiff < 0) throw new Error("Cannot allocate more than your available net cash flow!");
      }

      const { error } = await (supabase as any).from("monthly_allocations")
        .update({ category: editCat, description: editDesc || null, amount: newAmt })
        .eq("id", editingId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated");
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["monthly_allocations", plannerId, monthYear] });
    },
    onError: (e) => toast.error(e.message),
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!addCat || !addAmt) throw new Error("Category and Amount required");

      const newAmt = Number(addAmt);
      if (type !== "earning") {
         if (netCashflow - newAmt < 0) throw new Error("Cannot allocate more than your available net cash flow!");
      }

      const { error } = await (supabase as any).from("monthly_allocations").insert({
        planner_id: plannerId,
        month_year: monthYear,
        allocation_type: type,
        category: addCat,
        description: addDesc || null,
        amount: newAmt
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Added");
      setIsAdding(false);
      setAddCat(""); setAddDesc(""); setAddAmt("");
      qc.invalidateQueries({ queryKey: ["monthly_allocations", plannerId, monthYear] });
    },
    onError: (e) => toast.error(e.message),
  });

  const startEdit = (item: Allocation) => {
    setEditingId(item.id);
    setEditCat(item.category);
    setEditDesc(item.description || "");
    setEditAmt(item.amount.toString());
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl hover:bg-card/60 transition-colors shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h3 className="font-display text-lg">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="text-primary font-medium">{formatMoney(total, currency)}</div>
          {onAssign && total > 0 && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" onClick={() => onAssign(total, title, type)} title="Assign to Account">
              <Wallet className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 p-0 overflow-x-auto">
          <table className="w-full text-left text-sm hidden md:table">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-white/5 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 font-medium w-12 text-center">Done</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-2 py-3 w-[100px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.length === 0 && !isAdding ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-sm">No items yet</td></tr>
              ) : (
                items.map((item: any) => (
                  <tr key={item.id} className={`group hover:bg-white/5 transition-all ${item.is_completed ? 'opacity-50 grayscale' : ''}`}>
                    {editingId === item.id ? (
                      <>
                        <td className="px-5 py-2 text-center"></td>
                        <td className="px-2 py-2"><Input className="h-8 text-sm" value={editCat} onChange={(e) => setEditCat(e.target.value)} /></td>
                        <td className="px-2 py-2"><Input className="h-8 text-sm" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} /></td>
                        <td className="px-2 py-2"><Input className="h-8 text-sm text-right" type="number" step="0.01" value={editAmt} onChange={(e) => setEditAmt(e.target.value)} /></td>
                        <td className="px-2 py-2 text-center flex justify-center gap-1">
                          <button onClick={() => updateMutation.mutate()} className="p-1.5 text-primary hover:bg-primary/20 rounded-md transition-colors"><Check className="h-4 w-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-muted-foreground hover:bg-white/10 rounded-md transition-colors"><X className="h-4 w-4" /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3 text-center">
                          <Checkbox checked={item.is_completed} onCheckedChange={() => toggleDoneMutation.mutate({ id: item.id, is_completed: !item.is_completed })} className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-[#030808]" />
                        </td>
                        <td className={`px-5 py-3 font-medium ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>{item.category}</td>
                        <td className={`px-5 py-3 text-muted-foreground truncate max-w-[200px] ${item.is_completed ? 'line-through' : ''}`}>{item.description ?? "—"}</td>
                        <td className={`px-5 py-3 text-right ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>{formatMoney(item.amount, currency)}</td>
                        <td className="px-2 py-3 text-center flex justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                          {onAssign && item.amount > 0 && (
                            <button onClick={() => onAssign(item.amount, item.category, type)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/20 rounded-md transition-colors" title="Assign to Account"><Wallet className="h-4 w-4" /></button>
                          )}
                          <button onClick={() => startEdit(item)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/20 rounded-md transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => deleteMutation.mutate(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/20 rounded-md transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
              
              {/* Inline Add Row Desktop */}
              {isAdding && (
                <tr className="bg-white/5">
                  <td className="px-5 py-2 text-center"></td>
                  <td className="px-2 py-2"><Input placeholder="Category" autoFocus className="h-8 text-sm" value={addCat} onChange={(e) => setAddCat(e.target.value)} /></td>
                  <td className="px-2 py-2"><Input placeholder="Description (optional)" className="h-8 text-sm" value={addDesc} onChange={(e) => setAddDesc(e.target.value)} /></td>
                  <td className="px-2 py-2"><Input placeholder="0.00" className="h-8 text-sm text-right" type="number" step="0.01" value={addAmt} onChange={(e) => setAddAmt(e.target.value)} /></td>
                  <td className="px-2 py-2 text-center flex justify-center gap-1">
                    <button onClick={() => addMutation.mutate()} className="p-1.5 text-primary hover:bg-primary/20 rounded-md transition-colors"><Check className="h-4 w-4" /></button>
                    <button onClick={() => { setIsAdding(false); setAddCat(""); setAddDesc(""); setAddAmt(""); }} className="p-1.5 text-muted-foreground hover:bg-white/10 rounded-md transition-colors"><X className="h-4 w-4" /></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card List */}
          <div className="md:hidden flex flex-col divide-y divide-white/5">
            {items.length === 0 && !isAdding && (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">No items yet</div>
            )}
            
            {items.map((item: any) => (
              <div key={item.id} className="p-4 flex flex-col gap-3">
                {editingId === item.id ? (
                  <div className="flex flex-col gap-2">
                    <Input placeholder="Category" className="h-9 text-sm" value={editCat} onChange={(e) => setEditCat(e.target.value)} />
                    <Input placeholder="Description" className="h-9 text-sm" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                    <Input placeholder="Amount" className="h-9 text-sm" type="number" step="0.01" value={editAmt} onChange={(e) => setEditAmt(e.target.value)} />
                    <div className="flex items-center gap-2 mt-2">
                      <Button onClick={() => updateMutation.mutate()} size="sm" className="flex-1"><Check className="h-4 w-4 mr-2" /> Save</Button>
                      <Button onClick={() => setEditingId(null)} size="sm" variant="ghost" className="flex-1">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`flex justify-between items-start gap-4 transition-all ${item.is_completed ? 'opacity-50 grayscale line-through' : ''}`}>
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox checked={item.is_completed} onCheckedChange={() => toggleDoneMutation.mutate({ id: item.id, is_completed: !item.is_completed })} className="mt-1 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-[#030808]" />
                        <div className="min-w-0 flex-1">
                          <div className={`font-medium text-sm ${item.is_completed ? 'text-muted-foreground' : 'text-foreground'}`}>{item.category}</div>
                          {item.description && <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>}
                        </div>
                      </div>
                      <div className={`text-sm font-medium whitespace-nowrap ${item.is_completed ? 'text-muted-foreground' : ''}`}>{formatMoney(item.amount, currency)}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {onAssign && item.amount > 0 && (
                        <Button onClick={() => onAssign(item.amount, item.category, type)} variant="secondary" size="sm" className="h-7 text-xs px-2 flex-1"><Wallet className="h-3 w-3 mr-1.5" /> Assign</Button>
                      )}
                      <Button onClick={() => startEdit(item)} variant="secondary" size="sm" className="h-7 text-xs px-2 flex-1 bg-white/5"><Pencil className="h-3 w-3 mr-1.5" /> Edit</Button>
                      <Button onClick={() => deleteMutation.mutate(item.id)} variant="secondary" size="sm" className="h-7 text-xs px-2 flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"><Trash2 className="h-3 w-3 mr-1.5" /> Delete</Button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Inline Add Mobile */}
            {isAdding && (
              <div className="p-4 flex flex-col gap-2 bg-white/5">
                <Input placeholder="Category" autoFocus className="h-9 text-sm" value={addCat} onChange={(e) => setAddCat(e.target.value)} />
                <Input placeholder="Description (optional)" className="h-9 text-sm" value={addDesc} onChange={(e) => setAddDesc(e.target.value)} />
                <Input placeholder="Amount" className="h-9 text-sm" type="number" step="0.01" value={addAmt} onChange={(e) => setAddAmt(e.target.value)} />
                <div className="flex items-center gap-2 mt-2">
                  <Button onClick={() => addMutation.mutate()} size="sm" className="flex-1"><Check className="h-4 w-4 mr-2" /> Save</Button>
                  <Button onClick={() => { setIsAdding(false); setAddCat(""); setAddDesc(""); setAddAmt(""); }} size="sm" variant="ghost" className="flex-1">Cancel</Button>
                </div>
              </div>
            )}
          </div>
      </div>
        {!isAdding && (
          <div className="border-t border-white/5 p-2 bg-black/20">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)} className="w-full text-muted-foreground hover:text-foreground text-xs h-9">
              <Plus className="h-4 w-4 mr-2" /> Add entry
            </Button>
          </div>
        )}
    </div>
  );
}

function MonthlyTracking() {
  const { plannerId } = Route.useParams();
  const qc = useQueryClient();
  const [monthYear, setMonthYear] = useState(() => format(new Date(), "yyyy-MM"));

  const { data: planner } = useQuery({
    queryKey: ["planner", plannerId],
    queryFn: async () => (await supabase.from("planners").select("*").eq("id", plannerId).single()).data,
  });
  const currency = planner?.currency ?? "USD";

  const { data: allocations = [] } = useQuery({
    queryKey: ["monthly_allocations", plannerId, monthYear],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("monthly_allocations")
        .select("*")
        .eq("planner_id", plannerId)
        .eq("month_year", monthYear)
        .order("created_at", { ascending: true });
      return (data ?? []) as Allocation[];
    },
  });

  const getTotals = (type: string) => allocations.filter(a => a.allocation_type === type).reduce((sum, a) => sum + Number(a.amount), 0);
  const tEarnings = getTotals("earning");
  const tSavings = getTotals("saving");
  const tExpenses = getTotals("personal_expense");
  const tInvestments = getTotals("investment");
  const tOther = getTotals("other");
  const netCashflow = tEarnings - tSavings - tExpenses - tInvestments - tOther;

  const pieData = [
    { name: "Savings", value: tSavings, color: "#3DDC97" },
    { name: "Expenses", value: tExpenses, color: "#F56565" },
    { name: "Investments", value: tInvestments, color: "#7CC4FF" },
    { name: "Other", value: tOther, color: "#F6AD55" },
  ].filter(d => d.value > 0);

  // Top modal state (kept per user request)
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState("earning");
  const [addCat, setAddCat] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addAmt, setAddAmt] = useState("");

  const addMutationTop = useMutation({
    mutationFn: async () => {
      if (!addCat || !addAmt) throw new Error("Category and Amount required");

      const newAmt = Number(addAmt);
      if (addType !== "earning") {
         if (netCashflow - newAmt < 0) throw new Error("Cannot allocate more than your available net cash flow!");
      }

      const { error } = await (supabase as any).from("monthly_allocations").insert({
        planner_id: plannerId,
        month_year: monthYear,
        allocation_type: addType,
        category: addCat,
        description: addDesc || null,
        amount: newAmt
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entry added");
      setAddOpen(false);
      setAddCat(""); setAddDesc(""); setAddAmt("");
      qc.invalidateQueries({ queryKey: ["monthly_allocations", plannerId, monthYear] });
    },
    onError: (e) => toast.error(e.message),
  });

  // Account Assignment State
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTotal, setAssignTotal] = useState(0);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignType, setAssignType] = useState("");
  const [assignTargetAcc, setAssignTargetAcc] = useState("");
  const [assignSourceAcc, setAssignSourceAcc] = useState("");

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", plannerId],
    queryFn: async () => (await supabase.from("accounts").select("id, name, opening_balance").eq("planner_id", plannerId)).data ?? [],
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

  const assignMutation = useMutation({
    mutationFn: async (mode: "add" | "overwrite" = "add") => {
      if (assignType !== "earning" && !assignSourceAcc) throw new Error("Select a source account");
      if (!assignTargetAcc) throw new Error("Select a destination account");

      const target = accounts.find(a => a.id === assignTargetAcc);
      if (!target) throw new Error("Target account not found");
      const targetLive = Number(target.opening_balance || 0) + (balMap.get(target.id) ?? 0);

      if (assignType === "earning") {
        const diff = mode === "overwrite" ? assignTotal - targetLive : assignTotal;
        const newBalance = Number(target.opening_balance || 0) + diff;
        const { error } = await supabase.from("accounts").update({ opening_balance: newBalance }).eq("id", assignTargetAcc);
        if (error) throw error;
      } else {
        const source = accounts.find(a => a.id === assignSourceAcc);
        if (!source) throw new Error("Source account not found");
        
        const targetDiff = mode === "overwrite" ? assignTotal - targetLive : assignTotal;
        const newTargetBalance = Number(target.opening_balance || 0) + targetDiff;
        const newSourceBalance = Number(source.opening_balance || 0) - assignTotal;
        
        const { error: err1 } = await supabase.from("accounts").update({ opening_balance: newSourceBalance }).eq("id", assignSourceAcc);
        if (err1) throw err1;
        const { error: err2 } = await supabase.from("accounts").update({ opening_balance: newTargetBalance }).eq("id", assignTargetAcc);
        if (err2) throw err2;
      }
    },
    onSuccess: () => {
      toast.success(assignType === "earning" ? "Money assigned!" : "Transfer complete!");
      setAssignOpen(false);
      qc.invalidateQueries({ queryKey: ["accounts", plannerId] });
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAssign = (amt: number, title: string, type: string) => {
    setAssignTotal(amt);
    setAssignTitle(title);
    setAssignType(type);
    setAssignTargetAcc("");
    setAssignSourceAcc("");
    setAssignOpen(true);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display tracking-tight">Monthly Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">Allocate and track your earnings month over month.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            type="month" 
            value={monthYear} 
            onChange={(e) => setMonthYear(e.target.value)} 
            className="w-48 bg-card border-white/10"
          />
          <Button onClick={() => setAddOpen(true)} className="glow-emerald"><Plus className="h-4 w-4 mr-2" /> Quick Add</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AllocationTable title="Monthly Earnings" type="earning" total={tEarnings} items={allocations.filter(a => a.allocation_type === "earning")} currency={currency} plannerId={plannerId} monthYear={monthYear} onAssign={handleAssign} netCashflow={netCashflow} />
          <AllocationTable title="Savings" type="saving" total={tSavings} items={allocations.filter(a => a.allocation_type === "saving")} currency={currency} plannerId={plannerId} monthYear={monthYear} onAssign={handleAssign} netCashflow={netCashflow} />
          <AllocationTable title="Personal Expenses" type="personal_expense" total={tExpenses} items={allocations.filter(a => a.allocation_type === "personal_expense")} currency={currency} plannerId={plannerId} monthYear={monthYear} onAssign={handleAssign} netCashflow={netCashflow} />
          <AllocationTable title="Investments" type="investment" total={tInvestments} items={allocations.filter(a => a.allocation_type === "investment")} currency={currency} plannerId={plannerId} monthYear={monthYear} onAssign={handleAssign} netCashflow={netCashflow} />
          <AllocationTable title="Other Allocations" type="other" total={tOther} items={allocations.filter(a => a.allocation_type === "other")} currency={currency} plannerId={plannerId} monthYear={monthYear} onAssign={handleAssign} netCashflow={netCashflow} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-card/60 backdrop-blur-xl p-6 shadow-xl sticky top-6">
            <h3 className="font-display text-xl mb-6 flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-primary" /> Allocation Overview</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-end pb-4 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Total Earnings</span>
                <span className="font-medium text-lg">{formatMoney(tEarnings, currency)}</span>
              </div>
              <div className="flex justify-between items-end pb-4 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Allocated</span>
                <span className="font-medium text-lg text-muted-foreground">{formatMoney(tEarnings - netCashflow, currency)}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-between items-end pt-2">
                <span className="text-sm font-medium">Net Cash Flow</span>
                <span className={`font-display text-2xl ${netCashflow >= 0 ? "text-primary" : "text-destructive"}`}>
                  {formatMoney(netCashflow, currency)}
                </span>
              </div>
            </div>

            {pieData.length > 0 ? (
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="pieGlowMonthly" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      {pieData.map((e, i) => (
                        <linearGradient key={`gradient-monthly-${i}`} id={`pieGradientMonthly-${i}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={e.color} stopOpacity={1} />
                          <stop offset="100%" stopColor={e.color} stopOpacity={0.3} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} stroke="rgba(0,0,0,0.2)" strokeWidth={2} filter="url(#pieGlowMonthly)">
                      {pieData.map((e, i) => <Cell key={i} fill={`url(#pieGradientMonthly-${i})`} />)}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number, name: string) => {
                        const total = pieData.reduce((acc, curr) => acc + curr.value, 0);
                        const percent = total > 0 ? `(${(val / total * 100).toFixed(1)}%)` : '';
                        return [`${formatMoney(val, currency)} ${percent}`, name];
                      }}
                      contentStyle={{ backgroundColor: "rgba(3, 8, 8, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", color: "white" }} 
                      itemStyle={{ color: "white", fontWeight: 500, padding: "2px 0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-white/10 rounded-xl">
                Add allocations to see charts
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Quick Add Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={addType} onValueChange={setAddType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earning">Earning</SelectItem>
                  <SelectItem value="saving">Saving</SelectItem>
                  <SelectItem value="personal_expense">Personal Expense</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category / Type</label>
              <Input placeholder="e.g. Salary, Rent, Crypto..." value={addCat} onChange={(e) => setAddCat(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input placeholder="Notes..." value={addDesc} onChange={(e) => setAddDesc(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" step="0.01" placeholder="0.00" value={addAmt} onChange={(e) => setAddAmt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => addMutationTop.mutate()} disabled={addMutationTop.isPending} className="glow-emerald">Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{assignType === "earning" ? "Assign to Wallet" : "Transfer to Wallet"}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {assignType === "earning" ? "Assigning" : "Transferring"} <strong className="text-foreground">{formatMoney(assignTotal, currency)}</strong> from <strong className="text-foreground">{assignTitle}</strong>.
            </p>
            
            {assignType !== "earning" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Account (Subtract from)</label>
                <Select value={assignSourceAcc} onValueChange={setAssignSourceAcc}>
                  <SelectTrigger><SelectValue placeholder="Choose source account" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => {
                      const live = Number(acc.opening_balance || 0) + (balMap.get(acc.id) ?? 0);
                      return <SelectItem key={acc.id} value={acc.id} disabled={acc.id === assignTargetAcc}>{acc.name} (Bal: {formatMoney(live, currency)})</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Destination Account (Add to)</label>
              <Select value={assignTargetAcc} onValueChange={setAssignTargetAcc}>
                <SelectTrigger><SelectValue placeholder="Choose destination account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => {
                    const live = Number(acc.opening_balance || 0) + (balMap.get(acc.id) ?? 0);
                    return <SelectItem key={acc.id} value={acc.id} disabled={acc.id === assignSourceAcc}>{acc.name} (Bal: {formatMoney(live, currency)})</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-4 border-t border-white/5 pt-4">
            <Button variant="ghost" onClick={() => setAssignOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => assignMutation.mutate("overwrite")} disabled={!assignTargetAcc || (assignType !== "earning" && !assignSourceAcc) || assignMutation.isPending} className="w-full sm:w-auto">
                Overwrite
              </Button>
              <Button onClick={() => assignMutation.mutate("add")} disabled={!assignTargetAcc || (assignType !== "earning" && !assignSourceAcc) || assignMutation.isPending} className="glow-emerald w-full sm:w-auto">
                {assignType === "earning" ? "Assign (Add)" : "Transfer (Add)"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
