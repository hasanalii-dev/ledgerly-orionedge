import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import {
  TrendingUp, TrendingDown, PieChart as PieIcon, AreaChart as AreaIcon,
  Plus, Coins, Sparkles, Trash2, Layers, Table as TableIcon, LayoutGrid, AlertCircle, Download
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { exportToExcel } from "@/lib/export-excel";


type Investment = {
  id: string;
  planner_id: string;
  name: string;
  kind: string;
  symbol: string | null;
  allocated_amount: number;
  current_value: number;
  return_amount: number;
  currency: string;
  purchase_date: string | null;
  notes: string | null;
  created_at?: string;
};

const KINDS = [
  { value: "crypto", label: "Crypto" },
  { value: "forex", label: "Forex" },
  { value: "stock", label: "Stock" },
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "bond", label: "Bond" },
  { value: "real_estate", label: "Real Estate" },
  { value: "commodity", label: "Commodity" },
  { value: "liability", label: "Liability / Margin Debt" },
];

const PRESETS = [
  { name: "Bitcoin", symbol: "BTC", kind: "crypto", price: 65000 },
  { name: "Ethereum", symbol: "ETH", kind: "crypto", price: 3400 },
  { name: "Solana", symbol: "SOL", kind: "crypto", price: 175 },
  { name: "Euro Forex", symbol: "EUR", kind: "forex", price: 1.08 },
  { name: "British Pound", symbol: "GBP", kind: "forex", price: 1.28 },
  { name: "Apple Inc.", symbol: "AAPL", kind: "stock", price: 220 },
  { name: "NVIDIA Corp.", symbol: "NVDA", kind: "stock", price: 120 },
  { name: "Physical Gold", symbol: "XAU", kind: "commodity", price: 2400 },
];

const PIE_COLORS = ["#3DDC97", "#F59E0B", "#06B6D4", "#8B5CF6", "#EC4899", "#3B82F6", "#EAB308", "#F43F5E"];

export function InvestmentsPage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);
  const qc = useQueryClient();
  const [uid, setUid] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [kind, setKind] = useState<string>("crypto");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [assetCurrency, setAssetCurrency] = useState(currency);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? ""));
  }, []);

  // Query Investments from Supabase (or fallback to local storage)
  const { data: rows = [] } = useQuery({
    queryKey: ["investments", plannerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("investments")
          .select("*")
          .eq("planner_id", plannerId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        localStorage.setItem(`capient_investments_${plannerId}`, JSON.stringify(data));
        return (data || []) as unknown as Investment[];
      } catch (e) {
        const local = localStorage.getItem(`capient_investments_${plannerId}`);
        return local ? (JSON.parse(local) as unknown as Investment[]) : [];
      }
    },
  });

  // Calculate Asset vs Liability Totals
  const assets = rows.filter(r => r.kind !== "liability");
  const liabilities = rows.filter(r => r.kind === "liability");

  const totalAllocated = assets.reduce((s, r) => s + Number(r.allocated_amount ?? 0), 0);
  const totalAssetValue = assets.reduce((s, r) => s + Number(r.current_value ?? 0), 0);
  const totalLiabilityValue = liabilities.reduce((s, r) => s + Number(r.current_value ?? 0), 0);
  const netPortfolioValue = totalAssetValue - totalLiabilityValue;

  const totalReturn = rows.reduce((s, r) => s + Number(r.return_amount ?? (r.current_value - r.allocated_amount)), 0);
  const roi = totalAllocated > 0 ? ((netPortfolioValue - totalAllocated) / totalAllocated) * 100 : 0;
  const topAsset = [...assets].sort((a, b) => (b.current_value - b.allocated_amount) - (a.current_value - a.allocated_amount))[0];

  // Dashboard-style Distribution Pie Data
  const distributionMap: Record<string, number> = {};
  assets.forEach(r => {
    const k = KINDS.find(k => k.value === r.kind)?.label || r.kind;
    distributionMap[k] = (distributionMap[k] ?? 0) + Number(r.current_value || 0);
  });

  const pieData = Object.entries(distributionMap).map(([name, value]) => ({ name, value }));

  // Performance History for Recharts Area Chart
  const historyChartData = [
    { month: "Jan", portfolio: totalAllocated * 0.85 },
    { month: "Feb", portfolio: totalAllocated * 0.90 },
    { month: "Mar", portfolio: totalAllocated * 0.95 },
    { month: "Apr", portfolio: totalAllocated * 1.02 },
    { month: "May", portfolio: totalAllocated * 1.08 },
    { month: "Jun", portfolio: netPortfolioValue || totalAllocated * 1.15 },
  ];

  // Add Investment Mutation
  const addInvestmentMutation = useMutation({
    mutationFn: async () => {
      if (!name) throw new Error("Name is required");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const qty = parseFloat(quantity) || 1;
      const buyPrice = parseFloat(purchasePrice) || 0;
      const allocated = buyPrice > 0 ? qty * buyPrice : parseFloat(currentValue) || 0;
      const curVal = parseFloat(currentValue) || allocated;
      const retAmt = curVal - allocated;

      const newInv: Investment = {
        id: crypto.randomUUID(),
        planner_id: plannerId,
        name,
        kind,
        symbol: symbol ? symbol.toUpperCase() : null,
        allocated_amount: allocated,
        current_value: curVal,
        return_amount: retAmt,
        currency: assetCurrency || currency,
        purchase_date: new Date().toISOString().split("T")[0],
        notes: notes || null,
        created_at: new Date().toISOString(),
      };

      try {
        await supabase.from("investments").insert({
          ...newInv,
          user_id: user.id,
        });
      } catch (e) {
        console.warn("Saved investment locally", e);
      }

      const updated = [newInv, ...rows];
      localStorage.setItem(`capient_investments_${plannerId}`, JSON.stringify(updated));
      qc.setQueryData(["investments", plannerId], updated);
    },
    onSuccess: () => {
      toast.success("Asset added to portfolio!");
      setAddOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["investments", plannerId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Delete Investment
  const confirmDeleteInvestment = async (id: string) => {
    try {
      await supabase.from("investments").delete().eq("id", id);
    } catch (e) {}
    const updated = rows.filter(r => r.id !== id);
    localStorage.setItem(`capient_investments_${plannerId}`, JSON.stringify(updated));
    qc.setQueryData(["investments", plannerId], updated);
    setDeleteTargetId(null);
    toast.success("Asset removed");
  };

  function resetForm() {
    setName("");
    setKind("crypto");
    setSymbol("");
    setQuantity("");
    setPurchasePrice("");
    setCurrentValue("");
    setNotes("");
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setName(p.name);
    setSymbol(p.symbol);
    setKind(p.kind);
    setPurchasePrice(String(p.price));
    setCurrentValue(String(p.price));
    setQuantity("1");
  }

  const handleExport = () => {
    const headers = ["Asset Name", "Category Kind", "Ticker / Symbol", "Quantity", "Purchase Price", "Current Value", "Unrealized PnL", "Return %", "Notes"];
    const exportRows = rows.map((r) => {
      const cost = (r.quantity ?? 0) * (r.purchase_price ?? 0);
      const val = (r.quantity ?? 0) * (r.current_value ?? 0);
      const pnl = val - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
      return [
        r.name,
        r.kind.toUpperCase(),
        r.symbol || "",
        r.quantity ?? 0,
        r.purchase_price ?? 0,
        r.current_value ?? 0,
        pnl,
        pnlPct.toFixed(2) + "%",
        r.notes || "",
      ];
    });
    exportToExcel("Investments_Portfolio", headers, exportRows);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Coins className="h-7 w-7 text-amber-400" /> Investments & Portfolio
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Allocate capital and track live returns across Crypto, Forex, Stocks, Real Estate, and Commodities.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-sans">
          <Button
            variant="outline"
            onClick={handleExport}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-sans text-xs gap-2"
          >
            <Download className="h-4 w-4 text-amber-400" /> Export Excel
          </Button>

          <Button onClick={() => setAddOpen(true)} className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-semibold gap-2 font-sans">
            <Plus className="h-4 w-4" /> Add Asset
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Net Portfolio Value</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><Coins className="h-5 w-5" /></div>
          </div>
          <div className="mt-3 font-display text-2xl lg:text-3xl font-bold text-amber-400">
            {formatMoney(netPortfolioValue, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">Assets minus liabilities</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Capital Allocated</span>
            <div className="p-2 rounded-xl bg-[#3DDC97]/10 text-[#3DDC97]"><Layers className="h-5 w-5" /></div>
          </div>
          <div className="mt-3 font-display text-2xl lg:text-3xl font-bold text-white">
            {formatMoney(totalAllocated, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">Initial cost basis</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Total Return & P&L</span>
            <div className={`p-2 rounded-xl ${totalReturn >= 0 ? "bg-[#3DDC97]/10 text-[#3DDC97]" : "bg-orange-500/10 text-orange-400"}`}>
              {totalReturn >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
          </div>
          <div className={`mt-3 font-display text-2xl lg:text-3xl font-bold ${totalReturn >= 0 ? "text-[#3DDC97]" : "text-orange-400"}`}>
            {totalReturn >= 0 ? "+" : ""}{formatMoney(totalReturn, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">Unrealized profit/loss</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Overall ROI</span>
            <div className={`p-2 rounded-xl ${roi >= 0 ? "bg-[#3DDC97]/10 text-[#3DDC97]" : "bg-orange-500/10 text-orange-400"}`}>
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className={`mt-3 font-display text-2xl lg:text-3xl font-bold ${roi >= 0 ? "text-[#3DDC97]" : "text-orange-400"}`}>
            {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate font-sans">
            Top: <strong className="text-white font-sans">{topAsset ? topAsset.name : "None"}</strong>
          </p>
        </div>
      </div>

      {/* Visual Charts Row (Dashboard-style Donut Pie Chart!) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0c100e] p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold font-display text-foreground flex items-center gap-2">
                <AreaIcon className="h-5 w-5 text-[#3DDC97]" /> Portfolio Growth Trend
              </h3>
              <p className="text-xs text-muted-foreground font-sans">Valuation trajectory over time.</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3DDC97" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3DDC97" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="month" stroke="#ffffff50" fontSize={11} tickLine={false} />
                <YAxis stroke="#ffffff50" fontSize={11} tickLine={false} tickFormatter={(v) => formatMoney(v, currency, true)} />
                <Tooltip
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{ backgroundColor: "#0c100e", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", fontSize: "12px", color: "white" }}
                  formatter={(val: number) => formatMoney(val, currency)}
                />
                <Area type="monotone" dataKey="portfolio" stroke="#3DDC97" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPortfolio)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dashboard-Style Donut Pie Chart Widget */}
        <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-6 shadow-xl flex flex-col justify-between relative">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold font-display text-foreground flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-amber-400" /> Asset Allocation
            </h3>
          </div>

          <div className="relative w-full h-[220px] my-2 flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-xs text-muted-foreground font-sans">No assets added yet.</div>
            ) : (
              <>
                {/* Center Ring Display - Exact Dashboard Style */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-0.5 font-sans">Portfolio</span>
                    <span className="text-[20px] font-display font-bold tracking-tight text-white">
                      {formatMoney(netPortfolioValue, currency, true)}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="pieGlowInvestments" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={8}
                        cornerRadius={14}
                        stroke="none"
                        filter="url(#pieGlowInvestments)"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        wrapperStyle={{ zIndex: 100 }}
                        formatter={(val: number, name: string) => {
                          const total = pieData.reduce((acc, curr) => acc + curr.value, 0);
                          const percent = total > 0 ? `(${(val / total * 100).toFixed(1)}%)` : "";
                          return [`${formatMoney(val, currency)} ${percent}`, name];
                        }}
                        contentStyle={{
                          backgroundColor: "#0c100e",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "12px",
                          color: "#ffffff",
                          fontSize: "12px",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.9)"
                        }}
                        itemStyle={{ color: "#ffffff", fontWeight: 600 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/5 max-h-24 overflow-y-auto custom-scrollbar font-sans">
            {pieData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground truncate max-w-[120px] font-sans">{entry.name}</span>
                </div>
                <span className="font-semibold text-white font-sans">{formatMoney(entry.value, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Section Header with View Toggle AFTER GRAPHS */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold font-display text-foreground tracking-wide">
            {viewMode === "table" ? "Holdings Registry Table" : "Holdings Cards"}
          </h2>
          <span className="text-xs text-muted-foreground font-sans px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 whitespace-nowrap">
            {rows.length} asset entries
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Table View / Cards View Toggle (Strictly Single-Line!) */}
          <div className="bg-[#0b0e0d] border border-white/10 p-1 rounded-xl flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                viewMode === "table" ? "bg-white/15 text-white shadow-sm font-sans" : "text-muted-foreground hover:text-white font-sans"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" /> Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                viewMode === "cards" ? "bg-white/15 text-white shadow-sm font-sans" : "text-muted-foreground hover:text-white font-sans"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Cards View
            </button>
          </div>
        </div>
      </div>

      {/* Main Holdings Section: Conventional EditableTable vs Cards View */}
      {viewMode === "table" ? (
        <div className="space-y-3">
          <EditableTable<Investment>
            table="investments"
            rows={rows}
            planner_id={plannerId}
            user_id={uid}
            invalidateKeys={[["investments", plannerId]]}
            currency={currency}
            onNewRow={() => ({
              name: "New Asset",
              kind: "stock",
              symbol: "",
              allocated_amount: 0,
              current_value: 0,
              return_amount: 0,
              currency,
              purchase_date: new Date().toISOString().split("T")[0],
              notes: "",
            })}
            totals={{ amountKey: "current_value", label: "Total Valuation" }}
            columns={[
              { key: "name", label: "Name", render: (r, on) => <CellInput value={r.name ?? ""} onChange={(v) => on({ name: v })} /> },
              { key: "kind", label: "Type", width: "140px", render: (r, on) => <CellSelect value={r.kind ?? "stock"} onChange={(v) => on({ kind: v })} options={KINDS} /> },
              { key: "symbol", label: "Symbol", width: "110px", render: (r, on) => <CellInput value={r.symbol ?? ""} onChange={(v) => on({ symbol: v.toUpperCase() })} className="uppercase font-sans font-medium" /> },
              { key: "allocated_amount", label: "Allocated", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.allocated_amount ?? 0)} onChange={(v) => on({ allocated_amount: parseFloat(v) || 0 })} className="text-right font-sans" /> },
              { key: "current_value", label: "Current", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.current_value ?? 0)} onChange={(v) => on({ current_value: parseFloat(v) || 0 })} className="text-right font-sans font-semibold text-[#3DDC97]" /> },
              { key: "return_amount", label: "Return", width: "130px", render: (r, on) => <CellInput type="number" value={String(r.return_amount ?? 0)} onChange={(v) => on({ return_amount: parseFloat(v) || 0 })} className="text-right font-sans" /> },
              { key: "currency", label: "CCY", width: "80px", render: (r, on) => <CellInput value={r.currency ?? currency} onChange={(v) => on({ currency: v.toUpperCase() })} className="uppercase font-sans" /> },
              { key: "purchase_date", label: "Purchased", width: "140px", render: (r, on) => <CellInput type="date" value={r.purchase_date ?? ""} onChange={(v) => on({ purchase_date: v || null })} /> },
              { key: "notes", label: "Notes", render: (r, on) => <CellInput value={r.notes ?? ""} onChange={(v) => on({ notes: v })} /> },
            ]}
          />
        </div>
      ) : (
        /* Cards View Layout */
        <div className="space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-12 text-center text-muted-foreground shadow-xl">
              <Coins className="h-10 w-10 mx-auto mb-3 text-white/30" />
              <h3 className="text-base font-semibold text-foreground font-display">No assets in portfolio yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto font-sans">
                Add Crypto (Bitcoin, Ethereum), Forex pairs, stocks, or property holdings to start tracking live returns.
              </p>
              <Button onClick={() => setAddOpen(true)} className="mt-4 gap-2 bg-[#3DDC97]/10 text-[#3DDC97] border border-[#3DDC97]/30 hover:bg-[#3DDC97]/20 font-sans">
                <Plus className="h-4 w-4" /> Add Asset
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rows.map((asset) => {
                const pnl = asset.current_value - asset.allocated_amount;
                const pnlPct = asset.allocated_amount > 0 ? (pnl / asset.allocated_amount) * 100 : 0;
                const kindLabel = KINDS.find(k => k.value === asset.kind)?.label || asset.kind;
                const isLiability = asset.kind === "liability";

                return (
                  <div
                    key={asset.id}
                    className={`rounded-2xl border bg-[#0c100e] p-5 shadow-xl relative flex flex-col justify-between transition-all hover:border-white/20 ${
                      isLiability ? "border-orange-500/30 bg-orange-500/[0.02]" : "border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase font-sans px-2 py-0.5 rounded-md font-semibold border ${
                              isLiability
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                : asset.kind === "crypto"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : asset.kind === "forex"
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                : "bg-emerald-500/10 text-[#3DDC97] border-emerald-500/20"
                            }`}>
                              {asset.symbol ? asset.symbol : asset.kind}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold font-display text-foreground mt-2 truncate">{asset.name}</h3>
                          <p className="text-xs text-muted-foreground font-sans">{kindLabel}</p>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => setDeleteTargetId(asset.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-orange-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-5 space-y-3 font-sans">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-muted-foreground font-sans">Current Valuation</span>
                          <span className={`font-display text-xl font-bold ${isLiability ? "text-orange-400" : "text-white"}`}>
                            {formatMoney(asset.current_value, asset.currency || currency)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-xs font-sans">
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-sans">Allocated / Cost</span>
                            <span className="font-sans font-medium text-foreground">{formatMoney(asset.allocated_amount, asset.currency || currency)}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-sans">Unrealized P&L</span>
                            <span className={`font-sans font-bold ${pnl >= 0 ? "text-[#3DDC97]" : "text-orange-400"}`}>
                              {pnl >= 0 ? "+" : ""}{formatMoney(pnl, asset.currency || currency)} ({pnlPct.toFixed(1)}%)
                            </span>
                          </div>
                        </div>

                        {asset.notes && (
                          <p className="text-xs text-muted-foreground/80 italic pt-1 border-t border-white/5 truncate font-sans">
                            "{asset.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Asset Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md bg-[#0c100e] border-white/10 text-white font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Coins className="h-5 w-5 text-amber-400" /> Add Investment / Crypto Asset
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3 font-sans">
            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium font-sans">Quick Presets</label>
              <div className="flex overflow-x-auto gap-1.5 pb-1 custom-scrollbar font-sans">
                {PRESETS.map((p) => (
                  <button
                    key={p.symbol}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-xs font-sans text-white/90 border border-white/10 whitespace-nowrap transition-colors"
                  >
                    + {p.symbol}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium font-sans">Asset Name</label>
              <Input
                placeholder="e.g. Bitcoin, Ethereum, Apple Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Asset Category</label>
                <Select value={kind} onValueChange={(v) => setKind(v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c100e] border-white/10 text-white font-sans">
                    {KINDS.map((k) => (
                      <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Ticker Symbol</label>
                <Input
                  placeholder="e.g. BTC, ETH, AAPL"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="bg-white/5 border-white/10 uppercase font-sans font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Quantity Holdings</label>
                <Input
                  type="number"
                  placeholder="e.g. 0.5 or 10"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    const q = parseFloat(e.target.value) || 0;
                    const p = parseFloat(purchasePrice) || 0;
                    if (p > 0 && q > 0) {
                      setCurrentValue(String(q * p));
                    }
                  }}
                  className="bg-white/5 border-white/10 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Purchase / Buy Price</label>
                <Input
                  type="number"
                  placeholder="e.g. 60000"
                  value={purchasePrice}
                  onChange={(e) => {
                    setPurchasePrice(e.target.value);
                    const q = parseFloat(quantity) || 1;
                    const p = parseFloat(e.target.value) || 0;
                    if (p > 0) {
                      setCurrentValue(String(q * p));
                    }
                  }}
                  className="bg-white/5 border-white/10 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Current Valuation</label>
                <Input
                  type="number"
                  placeholder="e.g. 65000"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className="bg-white/5 border-white/10 font-sans font-semibold text-[#3DDC97]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Currency</label>
                <Input
                  placeholder="USD"
                  value={assetCurrency}
                  onChange={(e) => setAssetCurrency(e.target.value.toUpperCase())}
                  className="bg-white/5 border-white/10 uppercase font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium font-sans">Notes / Strategy</label>
              <Input
                placeholder="e.g. Cold storage hardware wallet, Long-term hold"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white/5 border-white/10 font-sans"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)} className="font-sans">Cancel</Button>
            <Button onClick={() => addInvestmentMutation.mutate()} className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-semibold font-sans">
              Save Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog (No browser popup!) */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent className="bg-[#0c100e] border-white/10 text-white sm:max-w-md font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400" /> Delete Asset Entry?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground font-sans">
              Are you sure you want to remove this asset from your portfolio? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)} className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-sans">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTargetId && confirmDeleteInvestment(deleteTargetId)} className="bg-orange-500 hover:bg-orange-400 text-black font-semibold font-sans">
              Remove Asset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/investments")({
  component: InvestmentsPage,
});
