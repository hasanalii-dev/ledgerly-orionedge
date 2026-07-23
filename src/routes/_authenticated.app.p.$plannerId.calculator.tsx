import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney, formatCompact } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator as CalcIcon, Download, History, TrendingUp, TrendingDown,
  Wallet, Calendar, Sparkles, Percent, RotateCcw, Delete, Copy, Check,
  Target, Layers, SlidersHorizontal, ArrowRight, X, ChevronRight, DollarSign,
  Plus, Minus, Divide, Equal, Bookmark, HelpCircle, ShieldCheck, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/calculator")({
  component: CalculatorPage,
});

type CalculationHistory = {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
  source?: string;
};

function CalculatorPage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);

  // Active Tab Mode: 'standard' | 'presets'
  const [activeTab, setActiveTab] = useState<"standard" | "presets">("standard");

  // Calculator State
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [memory, setMemory] = useState<number | null>(null);
  const [history, setHistory] = useState<CalculationHistory[]>(() => {
    try {
      const saved = localStorage.getItem(`calc_history_${plannerId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Copied state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mobile drawer state
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Selected Month for Importer
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`calc_history_${plannerId}`, JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  }, [history, plannerId]);

  /* ─────────────────────────────────────────────────────────────
     DATA QUERIES (For Importer)
  ───────────────────────────────────────────────────────────── */

  // 1. Monthly Allocations & Tracking Data
  const { data: monthlyAllocations = [] } = useQuery({
    queryKey: ["calc_monthly_allocations", plannerId, selectedMonth],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("monthly_allocations")
        .select("*")
        .eq("planner_id", plannerId)
        .eq("month_year", selectedMonth);
      if (error) throw error;
      return data || [];
    },
  });

  // 2. Financial Totals (Income, Expense, Net) for selected month
  const { data: monthlySummary } = useQuery({
    queryKey: ["calc_monthly_summary", plannerId, selectedMonth],
    queryFn: async () => {
      const start = `${selectedMonth}-01`;
      const end = `${selectedMonth}-31`;

      const [{ data: inc }, { data: exp }] = await Promise.all([
        supabase.from("income_entries").select("amount").eq("planner_id", plannerId).gte("date", start).lte("date", end),
        supabase.from("expense_entries").select("amount").eq("planner_id", plannerId).gte("date", start).lte("date", end),
      ]);

      const totalInc = (inc || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const totalExp = (exp || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

      return {
        income: totalInc,
        expenses: totalExp,
        net: totalInc - totalExp,
      };
    },
  });

  // 3. Accounts Balances
  const { data: accounts = [] } = useQuery({
    queryKey: ["calc_accounts", plannerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, name, opening_balance, kind")
        .eq("planner_id", plannerId);
      if (error) throw error;

      // Also get transaction net sums per account if needed
      return data || [];
    },
  });

  const totalAccountBalance = useMemo(() => {
    return accounts.reduce((acc, a) => acc + Number(a.opening_balance || 0), 0);
  }, [accounts]);

  // 4. Goals & Invoices
  const { data: goals = [] } = useQuery({
    queryKey: ["calc_goals", plannerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("id, title, target_amount, current_amount")
        .eq("planner_id", plannerId);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: invoicesSummary } = useQuery({
    queryKey: ["calc_invoices_summary", plannerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("amount, status")
        .eq("planner_id", plannerId);
      if (error) throw error;

      const pending = (data || [])
        .filter((i) => i.status === "pending" || i.status === "sent" || i.status === "overdue")
        .reduce((sum, i) => sum + Number(i.amount || 0), 0);

      const total = (data || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);

      return { pending, total };
    },
  });

  /* ─────────────────────────────────────────────────────────────
     CALCULATOR LOGIC & PARSING
  ───────────────────────────────────────────────────────────── */

  const handleDigit = (digit: string) => {
    if (display === "0" || display === "Error" || display === "Infinity") {
      setDisplay(digit);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    if (display.includes(".")) return;
    setDisplay(display + ".");
  };

  const handleOperator = (op: string) => {
    if (display === "Error") return;
    setExpression(`${expression} ${display} ${op}`);
    setDisplay("0");
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
  };

  const handleBackspace = () => {
    if (display.length <= 1 || display === "Error") {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handlePercentage = () => {
    try {
      const val = parseFloat(display);
      if (!isNaN(val)) {
        const res = (val / 100).toString();
        setDisplay(res);
      }
    } catch {
      setDisplay("Error");
    }
  };

  const handleToggleSign = () => {
    if (display === "0" || display === "Error") return;
    if (display.startsWith("-")) {
      setDisplay(display.slice(1));
    } else {
      setDisplay("-" + display);
    }
  };

  const safeEvaluate = (exprString: string): number => {
    // Clean string to only allow math characters
    const cleanExpr = exprString
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/[^0-9+\-*/.() ]/g, "");

    // Simple Function evaluator without unsafe eval
    const fn = new Function(`return (${cleanExpr})`);
    const val = fn();
    if (typeof val !== "number" || !isFinite(val) || isNaN(val)) {
      throw new Error("Invalid Calculation");
    }
    return val;
  };

  const handleEquals = () => {
    if (!expression && display) return;
    const fullExpr = `${expression} ${display}`.trim();
    try {
      const evaluated = safeEvaluate(fullExpr);
      const resStr = Number.isInteger(evaluated)
        ? evaluated.toString()
        : parseFloat(evaluated.toFixed(6)).toString();

      const newHistoryItem: CalculationHistory = {
        id: Math.random().toString(36).slice(2, 9),
        expression: fullExpr,
        result: resStr,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
      setDisplay(resStr);
      setExpression("");
    } catch {
      setDisplay("Error");
    }
  };

  // Keyboard Numpad & Numkeys Input Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in form inputs (e.g. preset fields, search)
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") {
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "." || e.key === ",") {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === "+") {
        e.preventDefault();
        handleOperator("+");
      } else if (e.key === "-") {
        e.preventDefault();
        handleOperator("-");
      } else if (e.key === "*" || e.key === "x" || e.key === "X") {
        e.preventDefault();
        handleOperator("×");
      } else if (e.key === "/") {
        e.preventDefault();
        handleOperator("÷");
      } else if (e.key === "=" || e.key === "Enter") {
        e.preventDefault();
        handleEquals();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Escape" || e.key === "c" || e.key === "C") {
        e.preventDefault();
        handleClear();
      } else if (e.key === "%") {
        e.preventDefault();
        handlePercentage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, expression, activeTab]);

  // Memory Functions
  const handleMemoryStore = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setMemory(val);
      toast.success(`Stored ${formatMoney(val, currency)} in memory`);
    }
  };

  const handleMemoryRecall = () => {
    if (memory !== null) {
      setDisplay(memory.toString());
      toast.info(`Recalled ${formatMoney(memory, currency)}`);
    }
  };

  const handleMemoryClear = () => {
    setMemory(null);
    toast.info("Memory cleared");
  };

  // Import Value Action
  const importValue = (val: number, label: string) => {
    if (isNaN(val)) return;
    const valStr = val.toString();

    if (expression.endsWith("+ ") || expression.endsWith("- ") || expression.endsWith("× ") || expression.endsWith("÷ ")) {
      setDisplay(valStr);
    } else {
      setDisplay(valStr);
    }

    toast.success(`Imported ${formatMoney(val, currency)} (${label})`, {
      icon: "✨",
      style: {
        background: "#0c1410",
        border: "1px solid rgba(61, 220, 151, 0.3)",
        color: "#fff",
      },
    });

    if (isImportOpen) setIsImportOpen(false);
  };

  /* ─────────────────────────────────────────────────────────────
     PRESET FINANCIAL CALCULATORS STATE
  ───────────────────────────────────────────────────────────── */

  // 1. ROI & Margin
  const [roiRev, setRoiRev] = useState("");
  const [roiCost, setRoiCost] = useState("");
  const roiProfit = (parseFloat(roiRev) || 0) - (parseFloat(roiCost) || 0);
  const roiMargin = (parseFloat(roiRev) || 0) > 0 ? (roiProfit / parseFloat(roiRev)) * 100 : 0;
  const roiPercentage = (parseFloat(roiCost) || 0) > 0 ? (roiProfit / parseFloat(roiCost)) * 100 : 0;

  // 2. Tax & Reserve Estimator
  const [taxIncome, setTaxIncome] = useState("");
  const [taxRate, setTaxRate] = useState("25");
  const taxEstimatedAmount = ((parseFloat(taxIncome) || 0) * (parseFloat(taxRate) || 0)) / 100;
  const taxTakeHome = (parseFloat(taxIncome) || 0) - taxEstimatedAmount;

  // 3. Investment Compound Growth
  const [compPrincipal, setCompPrincipal] = useState("10000");
  const [compMonthly, setCompMonthly] = useState("500");
  const [compRate, setCompRate] = useState("8");
  const [compYears, setCompYears] = useState("5");

  const compoundResult = useMemo(() => {
    const P = parseFloat(compPrincipal) || 0;
    const PMT = parseFloat(compMonthly) || 0;
    const r = (parseFloat(compRate) || 0) / 100 / 12;
    const n = (parseFloat(compYears) || 0) * 12;

    if (n <= 0) return { total: P, contributions: P, interest: 0 };

    let total = P;
    let totalContributed = P;

    for (let i = 0; i < n; i++) {
      total = (total + PMT) * (1 + r);
      totalContributed += PMT;
    }

    return {
      total,
      contributions: totalContributed,
      interest: Math.max(0, total - totalContributed),
    };
  }, [compPrincipal, compMonthly, compRate, compYears]);

  // 4. Break-Even Target
  const [beFixed, setBeFixed] = useState("");
  const [bePrice, setBePrice] = useState("");
  const [beCost, setBeCost] = useState("");
  const beMarginPerUnit = (parseFloat(bePrice) || 0) - (parseFloat(beCost) || 0);
  const beUnitsNeeded = beMarginPerUnit > 0 ? Math.ceil((parseFloat(beFixed) || 0) / beMarginPerUnit) : 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-8 font-['Questrial',_sans-serif]">
      {/* ── Page Header & Controls ────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Financial Calculator & Command Suite
            </h1>
            <span className="bg-[#3DDC97]/10 text-[#3DDC97] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#3DDC97]/20 uppercase tracking-widest">
              Live Data
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Perform precision math or pull live figures from your Monthly Tracking and Accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Drawer Trigger for Importer */}
          <div className="md:hidden">
            <Sheet open={isImportOpen} onOpenChange={setIsImportOpen}>
              <SheetTrigger asChild>
                <Button className="bg-[#3DDC97]/15 text-[#3DDC97] border border-[#3DDC97]/30 hover:bg-[#3DDC97]/25 rounded-xl h-10 gap-2 text-xs font-semibold">
                  <Download className="h-4 w-4" /> Import Data
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-[#0b0e0c] border-white/10 text-white rounded-t-[28px] max-h-[85vh] p-6 overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-white text-lg font-display flex items-center gap-2">
                    <Download className="h-5 w-5 text-[#3DDC97]" /> Import Financial Variable
                  </SheetTitle>
                </SheetHeader>
                <ImporterPanel
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  monthlySummary={monthlySummary}
                  monthlyAllocations={monthlyAllocations}
                  accounts={accounts}
                  totalAccountBalance={totalAccountBalance}
                  goals={goals}
                  invoicesSummary={invoicesSummary}
                  currency={currency}
                  onImport={importValue}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="bg-[#111312] p-1 rounded-xl border border-white/10 flex items-center">
            <button
              onClick={() => setActiveTab("standard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === "standard"
                  ? "bg-[#3DDC97] text-black shadow-lg shadow-[#3DDC97]/20"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <CalcIcon className="h-3.5 w-3.5" /> Interactive Calculator
            </button>
            <button
              onClick={() => setActiveTab("presets")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === "presets"
                  ? "bg-[#3DDC97] text-black shadow-lg shadow-[#3DDC97]/20"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Financial Models
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Calculator / Presets + Desktop Data Importer Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left / Main Workspace Area (Span 7 or 8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

          {activeTab === "standard" ? (
            /* ─────────────────────────────────────────────────────────────
               INTERACTIVE APP CALCULATOR
            ───────────────────────────────────────────────────────────── */
            <div className="rounded-[28px] border border-white/10 bg-[#0e1211]/90 backdrop-blur-2xl p-5 md:p-7 shadow-2xl relative overflow-hidden group">
              {/* Top Subtle Ambient Glow */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#3DDC97]/15 blur-[80px] rounded-full pointer-events-none" />

              {/* Calculator Header & Memory Bar */}
              <div className="flex items-center justify-between mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#3DDC97] animate-pulse" />
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                    {currency} Mode
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMemoryStore}
                    className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-white/70 transition-colors"
                    title="Memory Store"
                  >
                    MS
                  </button>
                  <button
                    onClick={handleMemoryRecall}
                    className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                      memory !== null ? "bg-[#3DDC97]/20 text-[#3DDC97]" : "bg-white/5 text-white/30 cursor-not-allowed"
                    }`}
                    title="Memory Recall"
                  >
                    MR {memory !== null && `(${formatCompact(memory)})`}
                  </button>
                  {memory !== null && (
                    <button
                      onClick={handleMemoryClear}
                      className="px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-[10px] font-semibold text-rose-400 transition-colors"
                      title="Clear Memory"
                    >
                      MC
                    </button>
                  )}
                </div>
              </div>

              {/* ── App Display Screen ────────────────────────────── */}
              <div className="bg-[#050807] border border-white/10 rounded-2xl p-4 md:p-6 mb-6 text-right relative overflow-hidden shadow-inner flex flex-col justify-end min-h-[120px] md:min-h-[140px]">
                {/* Expression Trace */}
                <div className="text-xs md:text-sm text-muted-foreground/80 font-mono tracking-wider truncate mb-1 h-5">
                  {expression || "\u00A0"}
                </div>
                {/* Main Number Display */}
                <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-white tracking-tight truncate drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
                  {display}
                </div>
                {/* Live Currency Formatted Preview */}
                {!isNaN(parseFloat(display)) && (
                  <div className="text-[11px] text-[#3DDC97] font-sans font-medium mt-1 tracking-wide">
                    ≈ {formatMoney(parseFloat(display), currency)}
                  </div>
                )}
              </div>

              {/* ── App Keypad Grid ──────────────────────────────── */}
              <div className="grid grid-cols-4 gap-2.5 md:gap-3.5">
                {/* Row 1 */}
                <CalcButton onClick={handleClear} variant="danger" label="AC" />
                <CalcButton onClick={handleBackspace} variant="secondary" icon={Delete} />
                <CalcButton onClick={handlePercentage} variant="secondary" icon={Percent} />
                <CalcButton onClick={() => handleOperator("÷")} variant="operator" label="÷" />

                {/* Row 2 */}
                <CalcButton onClick={() => handleDigit("7")} label="7" />
                <CalcButton onClick={() => handleDigit("8")} label="8" />
                <CalcButton onClick={() => handleDigit("9")} label="9" />
                <CalcButton onClick={() => handleOperator("×")} variant="operator" label="×" />

                {/* Row 3 */}
                <CalcButton onClick={() => handleDigit("4")} label="4" />
                <CalcButton onClick={() => handleDigit("5")} label="5" />
                <CalcButton onClick={() => handleDigit("6")} label="6" />
                <CalcButton onClick={() => handleOperator("-")} variant="operator" label="−" />

                {/* Row 4 */}
                <CalcButton onClick={() => handleDigit("1")} label="1" />
                <CalcButton onClick={() => handleDigit("2")} label="2" />
                <CalcButton onClick={() => handleDigit("3")} label="3" />
                <CalcButton onClick={() => handleOperator("+")} variant="operator" label="+" />

                {/* Row 5 */}
                <CalcButton onClick={handleToggleSign} variant="secondary" label="±" />
                <CalcButton onClick={() => handleDigit("0")} label="0" />
                <CalcButton onClick={handleDecimal} variant="secondary" label="." />
                <CalcButton onClick={handleEquals} variant="equals" label="=" />
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               SMART FINANCIAL PRESET MODELS
            ───────────────────────────────────────────────────────────── */
            <div className="space-y-6">
              {/* 1. ROI & Profit Margin */}
              <div className="rounded-[24px] border border-white/10 bg-[#0e1211] p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#3DDC97]">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">ROI & Profit Margin Model</h3>
                    <p className="text-[11px] text-muted-foreground">Calculate net margin and return on investment</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5 block">
                      Total Revenue ({currency})
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      value={roiRev}
                      onChange={(e) => setRoiRev(e.target.value)}
                      className="bg-black/40 border-white/10 text-white rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5 block">
                      Total Costs ({currency})
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 35000"
                      value={roiCost}
                      onChange={(e) => setRoiCost(e.target.value)}
                      className="bg-black/40 border-white/10 text-white rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Net Profit</span>
                    <span className={`text-base font-bold font-mono mt-1 block ${roiProfit >= 0 ? "text-[#3DDC97]" : "text-rose-400"}`}>
                      {formatMoney(roiProfit, currency)}
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Profit Margin</span>
                    <span className="text-base font-bold font-mono text-cyan-400 mt-1 block">
                      {roiMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">ROI</span>
                    <span className="text-base font-bold font-mono text-purple-400 mt-1 block">
                      {roiPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Tax & Reserve Estimator */}
              <div className="rounded-[24px] border border-white/10 bg-[#0e1211] p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Tax & Reserve Estimator</h3>
                    <p className="text-[11px] text-muted-foreground">Estimate tax withholding and remaining take-home income</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5 block">
                      Gross Income ({currency})
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 100000"
                      value={taxIncome}
                      onChange={(e) => setTaxIncome(e.target.value)}
                      className="bg-black/40 border-white/10 text-white rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5 block">
                      Tax Reserve Rate (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="bg-black/40 border-white/10 text-white rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">
                    <span className="text-[10px] text-rose-300 uppercase font-bold block">Estimated Tax Reserve</span>
                    <span className="text-lg font-bold font-mono text-rose-400 mt-1 block">
                      {formatMoney(taxEstimatedAmount, currency)}
                    </span>
                  </div>
                  <div className="bg-[#3DDC97]/10 rounded-xl p-3 border border-[#3DDC97]/20">
                    <span className="text-[10px] text-[#3DDC97] uppercase font-bold block">Net Take-Home</span>
                    <span className="text-lg font-bold font-mono text-[#3DDC97] mt-1 block">
                      {formatMoney(taxTakeHome, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Compound Investment Projector */}
              <div className="rounded-[24px] border border-white/10 bg-[#0e1211] p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Compound Growth & Wealth Projection</h3>
                    <p className="text-[11px] text-muted-foreground">Project future wealth with recurring contributions</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Initial ({currency})</label>
                    <Input
                      type="number"
                      value={compPrincipal}
                      onChange={(e) => setCompPrincipal(e.target.value)}
                      className="bg-black/40 border-white/10 text-white rounded-xl h-10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Monthly ({currency})</label>
                    <Input
                      type="number"
                      value={compMonthly}
                      onChange={(e) => setCompMonthly(e.target.value)}
                      className="bg-black/40 border-white/10 text-white rounded-xl h-10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Return (%)</label>
                    <Input
                      type="number"
                      value={compRate}
                      onChange={(e) => setCompRate(e.target.value)}
                      className="bg-black/40 border-white/10 text-white rounded-xl h-10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Years</label>
                    <Input
                      type="number"
                      value={compYears}
                      onChange={(e) => setCompYears(e.target.value)}
                      className="bg-black/40 border-white/10 text-white rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 via-[#3DDC97]/10 to-transparent p-4 rounded-2xl border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 block">Projected Portfolio Value</span>
                    <span className="text-2xl font-bold font-mono text-white mt-1 block">
                      {formatMoney(compoundResult.total, currency)}
                    </span>
                  </div>
                  <div className="text-right text-xs space-y-1">
                    <div className="text-muted-foreground">
                      Total Principal: <span className="text-white font-mono">{formatMoney(compoundResult.contributions, currency)}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Interest Earned: <span className="text-[#3DDC97] font-mono">{formatMoney(compoundResult.interest, currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Break-Even Calculator */}
              <div className="rounded-[24px] border border-white/10 bg-[#0e1211] p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Break-Even Units Target</h3>
                    <p className="text-[11px] text-muted-foreground">Number of units required to cover fixed overheads</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Fixed Overhead ({currency})</label>
                    <Input
                      type="number"
                      placeholder="15000"
                      value={beFixed}
                      onChange={(e) => setBeFixed(e.target.value)}
                      className="bg-black/40 border-white/10 text-white rounded-xl h-10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Unit Sale Price ({currency})</label>
                    <Input
                      type="number"
                      placeholder="250"
                      value={bePrice}
                      onChange={(e) => setBePrice(e.target.value)}
                      className="bg-black/40 border-white/10 text-white rounded-xl h-10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Unit Variable Cost ({currency})</label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={beCost}
                      onChange={(e) => setBeCost(e.target.value)}
                      className="bg-black/40 border-white/10 text-white rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">Break-Even Point</span>
                    <span className="text-xl font-bold font-mono text-white mt-1 block">
                      {beUnitsNeeded} Units
                    </span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    Contribution Margin: <span className="text-white font-mono">{formatMoney(beMarginPerUnit, currency)} / unit</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Log Section */}
          <div className="rounded-[24px] border border-white/10 bg-[#0e1211] p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#3DDC97]" />
                <h3 className="text-sm font-bold text-white">Calculation History Log</h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    toast.info("History cleared");
                  }}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No previous calculations saved.
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-mono text-muted-foreground">{item.expression} =</div>
                      <div className="text-sm font-mono font-bold text-white">{item.result}</div>
                    </div>
                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-muted-foreground/60 mr-2">{item.timestamp}</span>
                      <button
                        onClick={() => {
                          setDisplay(item.result);
                          toast.success("Loaded result into display");
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-[#3DDC97]/20 hover:text-[#3DDC97] text-white/70 transition-colors"
                        title="Load into Calculator"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.result);
                          setCopiedId(item.id);
                          toast.success("Copied to clipboard");
                          setTimeout(() => setCopiedId(null), 1500);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                        title="Copy Result"
                      >
                        {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-[#3DDC97]" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Desktop Data Importer Panel (Span 5 or 4) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 rounded-[28px] border border-white/10 bg-[#0e1211] p-5 md:p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-[#3DDC97]" />
                <h3 className="text-sm font-bold text-white">Import Live Financial Data</h3>
              </div>
            </div>

            <ImporterPanel
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              monthlySummary={monthlySummary}
              monthlyAllocations={monthlyAllocations}
              accounts={accounts}
              totalAccountBalance={totalAccountBalance}
              goals={goals}
              invoicesSummary={invoicesSummary}
              currency={currency}
              onImport={importValue}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CALCULATOR BUTTON COMPONENT
───────────────────────────────────────────────────────────── */
function CalcButton({
  label,
  icon: Icon,
  onClick,
  variant = "default",
}: {
  label?: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: "default" | "operator" | "secondary" | "equals" | "danger";
}) {
  let styleClasses = "bg-[#181c1a] text-white hover:bg-[#222825] border-white/5";

  if (variant === "operator") {
    styleClasses = "bg-[#3DDC97]/15 text-[#3DDC97] hover:bg-[#3DDC97]/25 border-[#3DDC97]/20 font-bold";
  } else if (variant === "secondary") {
    styleClasses = "bg-white/5 text-white/80 hover:bg-white/10 border-white/5 font-semibold";
  } else if (variant === "equals") {
    styleClasses = "bg-gradient-to-tr from-[#3DDC97] to-emerald-400 text-black font-bold hover:opacity-90 shadow-lg shadow-[#3DDC97]/20";
  } else if (variant === "danger") {
    styleClasses = "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border-rose-500/20 font-bold";
  }

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`h-12 sm:h-14 md:h-16 rounded-2xl border text-base md:text-xl font-mono flex items-center justify-center transition-all select-none shadow-md ${styleClasses}`}
    >
      {Icon ? <Icon className="h-5 w-5 md:h-6 md:w-6" /> : label}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────────
   IMPORTER PANEL COMPONENT
───────────────────────────────────────────────────────────── */
function ImporterPanel({
  selectedMonth,
  setSelectedMonth,
  monthlySummary,
  monthlyAllocations,
  accounts,
  totalAccountBalance,
  goals,
  invoicesSummary,
  currency,
  onImport,
}: {
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  monthlySummary: any;
  monthlyAllocations: any[];
  accounts: any[];
  totalAccountBalance: number;
  goals: any[];
  invoicesSummary: any;
  currency: string;
  onImport: (val: number, label: string) => void;
}) {
  return (
    <div className="space-y-5 text-xs">
      {/* Month Selector */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block">
          Select Month for Financial Data
        </label>
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-black/40 border-white/10 text-white rounded-xl h-10 text-xs"
        />
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="w-full bg-black/40 border border-white/5 p-1 rounded-xl grid grid-cols-3 h-9">
          <TabsTrigger value="monthly" className="text-[11px] rounded-lg">Monthly</TabsTrigger>
          <TabsTrigger value="accounts" className="text-[11px] rounded-lg">Accounts</TabsTrigger>
          <TabsTrigger value="goals" className="text-[11px] rounded-lg">Goals</TabsTrigger>
        </TabsList>

        {/* Tab 1: Monthly Tracking */}
        <TabsContent value="monthly" className="space-y-3 mt-3">
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Month Summary ({selectedMonth})</p>
            
            <button
              onClick={() => onImport(monthlySummary?.net || 0, `Net Cashflow (${selectedMonth})`)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#3DDC97]/15 border border-white/5 hover:border-[#3DDC97]/30 transition-all text-left group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-[#3DDC97]">Net Cashflow</div>
                <div className="text-[10px] text-muted-foreground">Income minus Expenses</div>
              </div>
              <div className="font-mono font-bold text-white text-xs">
                {formatMoney(monthlySummary?.net || 0, currency)}
              </div>
            </button>

            <button
              onClick={() => onImport(monthlySummary?.income || 0, `Earnings (${selectedMonth})`)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#3DDC97]/15 border border-white/5 hover:border-[#3DDC97]/30 transition-all text-left group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-[#3DDC97]">Total Earnings</div>
                <div className="text-[10px] text-muted-foreground">Gross Monthly Income</div>
              </div>
              <div className="font-mono font-bold text-emerald-400 text-xs">
                {formatMoney(monthlySummary?.income || 0, currency)}
              </div>
            </button>

            <button
              onClick={() => onImport(monthlySummary?.expenses || 0, `Expenses (${selectedMonth})`)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-rose-500/15 border border-white/5 hover:border-rose-500/30 transition-all text-left group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-rose-300">Total Expenses</div>
                <div className="text-[10px] text-muted-foreground">Outflow Expenditures</div>
              </div>
              <div className="font-mono font-bold text-rose-400 text-xs">
                {formatMoney(monthlySummary?.expenses || 0, currency)}
              </div>
            </button>
          </div>

          {/* Allocation Breakdown */}
          {monthlyAllocations.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Allocations ({monthlyAllocations.length})</p>
              <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                {monthlyAllocations.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onImport(Number(item.amount || 0), `${item.category}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/10 border border-white/5 transition-all text-left"
                  >
                    <div className="truncate mr-2">
                      <span className="font-medium text-white/90 truncate block">{item.category}</span>
                      {item.description && <span className="text-[9px] text-muted-foreground truncate block">{item.description}</span>}
                    </div>
                    <span className="font-mono font-semibold text-white shrink-0 text-xs">
                      {formatMoney(Number(item.amount || 0), currency)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Accounts */}
        <TabsContent value="accounts" className="space-y-3 mt-3">
          <button
            onClick={() => onImport(totalAccountBalance, "Total Accounts Balance")}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#3DDC97]/15 to-cyan-500/15 border border-[#3DDC97]/30 transition-all text-left"
          >
            <div>
              <div className="font-bold text-white">All Accounts Total</div>
              <div className="text-[10px] text-muted-foreground">Combined Liquid Balance</div>
            </div>
            <div className="font-mono font-bold text-[#3DDC97] text-sm">
              {formatMoney(totalAccountBalance, currency)}
            </div>
          </button>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => onImport(Number(acc.opening_balance || 0), acc.name)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-white">{acc.name}</span>
                </div>
                <span className="font-mono font-semibold text-white text-xs">
                  {formatMoney(Number(acc.opening_balance || 0), currency)}
                </span>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Goals & Invoices */}
        <TabsContent value="goals" className="space-y-3 mt-3">
          {invoicesSummary && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Invoices Summary</p>
              <button
                onClick={() => onImport(invoicesSummary.pending, "Pending Invoices")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-amber-500/15 border border-white/5 hover:border-amber-500/30 transition-all text-left"
              >
                <span className="font-semibold text-white">Pending Invoices</span>
                <span className="font-mono font-bold text-amber-400 text-xs">
                  {formatMoney(invoicesSummary.pending, currency)}
                </span>
              </button>
            </div>
          )}

          {goals.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Target Goals</p>
              <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => onImport(Number(g.target_amount || 0), `Goal: ${g.title}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5 transition-all text-left"
                  >
                    <span className="font-medium text-white truncate mr-2">{g.title}</span>
                    <span className="font-mono font-semibold text-white text-xs shrink-0">
                      {formatMoney(Number(g.target_amount || 0), currency)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
