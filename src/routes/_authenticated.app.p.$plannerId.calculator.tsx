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
  Plus, Minus, Divide, Equal, Bookmark, HelpCircle, ShieldCheck, ArrowUpRight,
  PieChart as PieIcon, Coins, RefreshCw, BarChart2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        .select("id, name, target_amount, saved_amount")
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
    const cleanExpr = exprString
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/[^0-9+\-*/.() ]/g, "");

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

    setDisplay(valStr);

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

  // 1. ROI & Margin Model
  const [roiRev, setRoiRev] = useState("50000");
  const [roiCost, setRoiCost] = useState("32000");
  const roiProfit = (parseFloat(roiRev) || 0) - (parseFloat(roiCost) || 0);
  const roiMargin = (parseFloat(roiRev) || 0) > 0 ? (roiProfit / parseFloat(roiRev)) * 100 : 0;
  const roiPercentage = (parseFloat(roiCost) || 0) > 0 ? (roiProfit / parseFloat(roiCost)) * 100 : 0;

  // 2. Tax & Reserve Estimator Model
  const [taxIncome, setTaxIncome] = useState("85000");
  const [taxRate, setTaxRate] = useState("25");
  const taxEstimatedAmount = ((parseFloat(taxIncome) || 0) * (parseFloat(taxRate) || 0)) / 100;
  const taxTakeHome = (parseFloat(taxIncome) || 0) - taxEstimatedAmount;

  // 3. Investment Compound Growth Model
  const [compPrincipal, setCompPrincipal] = useState("10000");
  const [compMonthly, setCompMonthly] = useState("750");
  const [compRate, setCompRate] = useState("9");
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

  // 4. Break-Even Target Model
  const [beFixed, setBeFixed] = useState("18000");
  const [bePrice, setBePrice] = useState("300");
  const [beCost, setBeCost] = useState("120");
  const beMarginPerUnit = (parseFloat(bePrice) || 0) - (parseFloat(beCost) || 0);
  const beUnitsNeeded = beMarginPerUnit > 0 ? Math.ceil((parseFloat(beFixed) || 0) / beMarginPerUnit) : 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-8 font-['Questrial',_sans-serif]">
      {/* ── Page Header & Controls ────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full overflow-hidden">
        <div className="min-w-0 flex-1">
          <h1 className="font-['Samsung_Sharp_Sans',_sans-serif] text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent break-words">
            Financial Command & Calculator Suite
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 font-['Questrial',_sans-serif]">
            Precision financial modeling & live data import from Monthly Tracking and Accounts.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto shrink-0">
          {/* Mobile Drawer Trigger for Importer */}
          <div className="md:hidden w-full sm:w-auto">
            <Sheet open={isImportOpen} onOpenChange={setIsImportOpen}>
              <SheetTrigger asChild>
                <Button className="w-full sm:w-auto bg-[#3DDC97]/15 text-[#3DDC97] border border-[#3DDC97]/30 hover:bg-[#3DDC97]/25 rounded-xl h-10 gap-2 text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold whitespace-nowrap">
                  <Download className="h-4 w-4" /> Import Data
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-[#0b0e0c] border-white/10 text-white rounded-t-[32px] max-h-[85vh] p-6 overflow-y-auto font-['Questrial',_sans-serif]">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-white text-lg font-['Samsung_Sharp_Sans',_sans-serif] font-bold flex items-center gap-2">
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
          <div className="bg-[#0f1412] p-1.5 rounded-2xl border border-white/10 flex items-center shrink-0 shadow-lg w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setActiveTab("standard")}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                activeTab === "standard"
                  ? "bg-[#3DDC97] text-black shadow-lg shadow-[#3DDC97]/25"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <CalcIcon className="h-3.5 w-3.5 shrink-0" /> Interactive Calculator
            </button>
            <button
              onClick={() => setActiveTab("presets")}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                activeTab === "presets"
                  ? "bg-[#3DDC97] text-black shadow-lg shadow-[#3DDC97]/25"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" /> Financial Models
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Calculator / Presets + Desktop Data Importer Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left / Main Workspace Area */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

          {activeTab === "standard" ? (
            /* ─────────────────────────────────────────────────────────────
               INTERACTIVE APP CALCULATOR
            ───────────────────────────────────────────────────────────── */
            <div className="rounded-[32px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden group">
              {/* Top Ambient Green Glow */}
              <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[420px] h-36 bg-[#3DDC97]/15 blur-[90px] rounded-full pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3DDC97]/30 to-transparent" />

              {/* Calculator Header & Memory Bar */}
              <div className="flex items-center justify-between mb-5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#3DDC97] animate-pulse" />
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-['Samsung_Sharp_Sans',_sans-serif] font-bold">
                    {currency} Operational Mode
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMemoryStore}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/70 transition-colors"
                    title="Memory Store"
                  >
                    MS
                  </button>
                  <button
                    onClick={handleMemoryRecall}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-['Samsung_Sharp_Sans',_sans-serif] font-bold transition-colors ${
                      memory !== null ? "bg-[#3DDC97]/20 text-[#3DDC97]" : "bg-white/5 text-white/30 cursor-not-allowed"
                    }`}
                    title="Memory Recall"
                  >
                    MR {memory !== null && `(${formatCompact(memory)})`}
                  </button>
                  {memory !== null && (
                    <button
                      onClick={handleMemoryClear}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[10px] font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-rose-400 transition-colors"
                      title="Clear Memory"
                    >
                      MC
                    </button>
                  )}
                </div>
              </div>

              {/* ── App Display Screen ────────────────────────────── */}
              <div className="bg-[#050807] border border-white/10 rounded-2xl p-5 md:p-6 mb-6 text-right relative overflow-hidden shadow-inner flex flex-col justify-end min-h-[130px] md:min-h-[150px]">
                {/* Expression Trace */}
                <div className="text-xs md:text-sm text-muted-foreground/80 font-['Samsung_Sharp_Sans',_sans-serif] font-medium tracking-wider truncate mb-1.5 h-6">
                  {expression || "\u00A0"}
                </div>
                {/* Main Number Display */}
                <div className="text-3xl sm:text-4xl md:text-5xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white tracking-tight truncate drop-shadow-[0_2px_12px_rgba(255,255,255,0.1)]">
                  {display}
                </div>
                {/* Live Currency Formatted Preview */}
                {!isNaN(parseFloat(display)) && (
                  <div className="text-xs text-[#3DDC97] font-['Questrial',_sans-serif] font-medium mt-1.5 tracking-wide">
                    ≈ {formatMoney(parseFloat(display), currency)}
                  </div>
                )}
              </div>

              {/* ── App Keypad Grid ──────────────────────────────── */}
              <div className="grid grid-cols-4 gap-3 md:gap-4">
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
               IMPROVED FINANCIAL MODEL CARDS (SAMSUNG SHARP SANS + QUESTRUCTION)
            ───────────────────────────────────────────────────────────── */
            <div className="space-y-6">

              {/* 1. ROI & PROFIT MARGIN MODEL CARD */}
              <div className="rounded-[32px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl p-6 md:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#3DDC97]/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3DDC97]/40 to-transparent" />

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#3DDC97]/10 border border-[#3DDC97]/20 text-[#3DDC97] shadow-lg">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-['Samsung_Sharp_Sans',_sans-serif] text-base md:text-lg font-bold text-white tracking-wide">
                        ROI & Profit Margin Model
                      </h3>
                      <p className="font-['Questrial',_sans-serif] text-xs text-muted-foreground mt-0.5">
                        Calculate net yield, profit margins, and return on investment capital.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex bg-white/5 text-white/70 font-['Samsung_Sharp_Sans',_sans-serif] text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">
                    Profit Metrics
                  </span>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
                  <div className="space-y-1.5">
                    <label className="font-['Questrial',_sans-serif] text-xs text-muted-foreground uppercase tracking-widest font-semibold block">
                      Total Revenue ({currency})
                    </label>
                    <Input
                      type="number"
                      value={roiRev}
                      onChange={(e) => setRoiRev(e.target.value)}
                      className="bg-black/50 border-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-2xl h-12 text-sm px-4 focus:border-[#3DDC97]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-['Questrial',_sans-serif] text-xs text-muted-foreground uppercase tracking-widest font-semibold block">
                      Total Operating Costs ({currency})
                    </label>
                    <Input
                      type="number"
                      value={roiCost}
                      onChange={(e) => setRoiCost(e.target.value)}
                      className="bg-black/50 border-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-2xl h-12 text-sm px-4 focus:border-[#3DDC97]/50"
                    />
                  </div>
                </div>

                {/* Visual Split Bar */}
                <div className="space-y-2 relative z-10 pt-1">
                  <div className="flex justify-between text-xs font-['Questrial',_sans-serif]">
                    <span className="text-muted-foreground">Costs Ratio: {Math.max(0, 100 - roiMargin).toFixed(1)}%</span>
                    <span className="text-[#3DDC97] font-semibold">Net Profit Margin: {roiMargin.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-black/60 rounded-full border border-white/5 overflow-hidden flex p-0.5">
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, 100 - roiMargin))}%` }}
                      className="h-full bg-white/20 rounded-l-full transition-all duration-500"
                    />
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, roiMargin))}%` }}
                      className="h-full bg-[#3DDC97] rounded-r-full shadow-[0_0_12px_#3DDC97] transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Metric Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10 pt-2">
                  <div className="bg-[#121815] rounded-2xl p-4 border border-white/5 space-y-1 shadow-md">
                    <span className="font-['Questrial',_sans-serif] text-[11px] text-muted-foreground uppercase font-bold block">
                      Net Profit
                    </span>
                    <span className={`font-['Samsung_Sharp_Sans',_sans-serif] text-xl font-bold block ${roiProfit >= 0 ? "text-[#3DDC97]" : "text-rose-400"}`}>
                      {formatMoney(roiProfit, currency)}
                    </span>
                  </div>
                  <div className="bg-[#121815] rounded-2xl p-4 border border-white/5 space-y-1 shadow-md">
                    <span className="font-['Questrial',_sans-serif] text-[11px] text-muted-foreground uppercase font-bold block">
                      Profit Margin
                    </span>
                    <span className="font-['Samsung_Sharp_Sans',_sans-serif] text-xl font-bold text-cyan-400 block">
                      {roiMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-[#121815] rounded-2xl p-4 border border-white/5 space-y-1 shadow-md">
                    <span className="font-['Questrial',_sans-serif] text-[11px] text-muted-foreground uppercase font-bold block">
                      ROI Ratio
                    </span>
                    <span className="font-['Samsung_Sharp_Sans',_sans-serif] text-xl font-bold text-purple-400 block">
                      {roiPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. TAX & RESERVE ESTIMATOR MODEL CARD */}
              <div className="rounded-[32px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl p-6 md:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-lg">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-['Samsung_Sharp_Sans',_sans-serif] text-base md:text-lg font-bold text-white tracking-wide">
                        Tax & Reserve Withholding Estimator
                      </h3>
                      <p className="font-['Questrial',_sans-serif] text-xs text-muted-foreground mt-0.5">
                        Estimate required tax reserves and calculate true take-home earnings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inputs & Slider */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
                  <div className="space-y-1.5">
                    <label className="font-['Questrial',_sans-serif] text-xs text-muted-foreground uppercase tracking-widest font-semibold block">
                      Gross Income ({currency})
                    </label>
                    <Input
                      type="number"
                      value={taxIncome}
                      onChange={(e) => setTaxIncome(e.target.value)}
                      className="bg-black/50 border-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-2xl h-12 text-sm px-4 focus:border-purple-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-['Questrial',_sans-serif] text-xs text-muted-foreground uppercase tracking-widest font-semibold block">
                        Tax Withholding Rate
                      </label>
                      <span className="font-['Samsung_Sharp_Sans',_sans-serif] text-xs font-bold text-purple-400">
                        {taxRate}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full accent-purple-400 h-2 bg-black/60 rounded-lg cursor-pointer mt-3"
                    />
                  </div>
                </div>

                {/* Dual Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 pt-2">
                  <div className="bg-rose-500/10 rounded-2xl p-5 border border-rose-500/20 space-y-1 shadow-lg">
                    <span className="font-['Questrial',_sans-serif] text-[11px] text-rose-300 uppercase font-bold tracking-wider block">
                      Estimated Tax Reserve
                    </span>
                    <span className="font-['Samsung_Sharp_Sans',_sans-serif] text-2xl font-bold text-rose-400 block">
                      {formatMoney(taxEstimatedAmount, currency)}
                    </span>
                    <span className="font-['Questrial',_sans-serif] text-[10px] text-muted-foreground block mt-1">
                      Set aside into tax vault account
                    </span>
                  </div>
                  <div className="bg-[#3DDC97]/10 rounded-2xl p-5 border border-[#3DDC97]/20 space-y-1 shadow-lg">
                    <span className="font-['Questrial',_sans-serif] text-[11px] text-[#3DDC97] uppercase font-bold tracking-wider block">
                      Net Take-Home Earnings
                    </span>
                    <span className="font-['Samsung_Sharp_Sans',_sans-serif] text-2xl font-bold text-[#3DDC97] block">
                      {formatMoney(taxTakeHome, currency)}
                    </span>
                    <span className="font-['Questrial',_sans-serif] text-[10px] text-muted-foreground block mt-1">
                      Post-tax disposable capital
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. COMPOUND WEALTH PROJECTOR MODEL CARD */}
              <div className="rounded-[32px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl p-6 md:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-lg">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-['Samsung_Sharp_Sans',_sans-serif] text-base md:text-lg font-bold text-white tracking-wide">
                        Compound Growth & Wealth Projection
                      </h3>
                      <p className="font-['Questrial',_sans-serif] text-xs text-muted-foreground mt-0.5">
                        Project long-term asset accumulation with recurring monthly contributions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <label className="font-['Questrial',_sans-serif] text-[11px] text-muted-foreground uppercase font-semibold block">
                      Initial ({currency})
                    </label>
                    <Input
                      type="number"
                      value={compPrincipal}
                      onChange={(e) => setCompPrincipal(e.target.value)}
                      className="bg-black/50 border-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-xl h-11 text-xs px-3"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-['Questrial',_sans-serif] text-[11px] text-muted-foreground uppercase font-semibold block">
                      Monthly ({currency})
                    </label>
                    <Input
                      type="number"
                      value={compMonthly}
                      onChange={(e) => setCompMonthly(e.target.value)}
                      className="bg-black/50 border-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-xl h-11 text-xs px-3"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-['Questrial',_sans-serif] text-[11px] text-muted-foreground uppercase font-semibold block">
                      Return (%)
                    </label>
                    <Input
                      type="number"
                      value={compRate}
                      onChange={(e) => setCompRate(e.target.value)}
                      className="bg-black/50 border-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-xl h-11 text-xs px-3"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-['Questrial',_sans-serif] text-[11px] text-muted-foreground uppercase font-semibold block">
                      Horizon (Years)
                    </label>
                    <Input
                      type="number"
                      value={compYears}
                      onChange={(e) => setCompYears(e.target.value)}
                      className="bg-black/50 border-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-xl h-11 text-xs px-3"
                    />
                  </div>
                </div>

                {/* Main Hero Result Box */}
                <div className="bg-gradient-to-r from-cyan-500/15 via-[#3DDC97]/15 to-transparent p-5 rounded-2xl border border-cyan-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 shadow-lg">
                  <div>
                    <span className="font-['Questrial',_sans-serif] text-xs uppercase font-bold tracking-widest text-cyan-400 block">
                      Projected Portfolio Value
                    </span>
                    <span className="font-['Samsung_Sharp_Sans',_sans-serif] text-2xl md:text-3xl font-bold text-white mt-1 block">
                      {formatMoney(compoundResult.total, currency)}
                    </span>
                  </div>
                  <div className="text-left sm:text-right font-['Questrial',_sans-serif] text-xs space-y-1 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0 w-full sm:w-auto">
                    <div className="text-muted-foreground">
                      Principal Invested: <span className="font-['Samsung_Sharp_Sans',_sans-serif] text-white font-bold">{formatMoney(compoundResult.contributions, currency)}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Compound Interest: <span className="font-['Samsung_Sharp_Sans',_sans-serif] text-[#3DDC97] font-bold">{formatMoney(compoundResult.interest, currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. BREAK-EVEN TARGET MODEL CARD */}
              <div className="rounded-[32px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl p-6 md:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-lg">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-['Samsung_Sharp_Sans',_sans-serif] text-base md:text-lg font-bold text-white tracking-wide">
                        Break-Even Units Target Model
                      </h3>
                      <p className="font-['Questrial',_sans-serif] text-xs text-muted-foreground mt-0.5">
                        Calculate sales volume required to cover fixed overhead expenses.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <label className="font-['Questrial',_sans-serif] text-xs text-muted-foreground uppercase font-semibold block">
                      Fixed Overhead ({currency})
                    </label>
                    <Input
                      type="number"
                      value={beFixed}
                      onChange={(e) => setBeFixed(e.target.value)}
                      className="bg-black/50 border-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-xl h-11 text-xs px-3"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-['Questrial',_sans-serif] text-xs text-muted-foreground uppercase font-semibold block">
                      Unit Sale Price ({currency})
                    </label>
                    <Input
                      type="number"
                      value={bePrice}
                      onChange={(e) => setBePrice(e.target.value)}
                      className="bg-black/50 border-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-xl h-11 text-xs px-3"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-['Questrial',_sans-serif] text-xs text-muted-foreground uppercase font-semibold block">
                      Unit Variable Cost ({currency})
                    </label>
                    <Input
                      type="number"
                      value={beCost}
                      onChange={(e) => setBeCost(e.target.value)}
                      className="bg-black/50 border-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-xl h-11 text-xs px-3"
                    />
                  </div>
                </div>

                <div className="bg-[#151a17] p-5 rounded-2xl border border-white/5 flex items-center justify-between relative z-10 shadow-md">
                  <div>
                    <span className="font-['Questrial',_sans-serif] text-xs uppercase font-bold tracking-widest text-amber-400 block">
                      Break-Even Point
                    </span>
                    <span className="font-['Samsung_Sharp_Sans',_sans-serif] text-2xl font-bold text-white mt-1 block">
                      {beUnitsNeeded} Units Needed
                    </span>
                  </div>
                  <div className="text-right font-['Questrial',_sans-serif] text-xs text-muted-foreground">
                    Contribution Margin: <span className="font-['Samsung_Sharp_Sans',_sans-serif] text-white font-bold">{formatMoney(beMarginPerUnit, currency)} / unit</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* History Log Section */}
          <div className="rounded-[32px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl p-6 md:p-8 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <History className="h-4 w-4 text-[#3DDC97]" />
                <h3 className="font-['Samsung_Sharp_Sans',_sans-serif] text-sm md:text-base font-bold text-white">
                  Calculation History Log
                </h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    toast.info("History cleared");
                  }}
                  className="text-xs font-['Questrial',_sans-serif] text-rose-400 hover:underline"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-8 text-center text-xs font-['Questrial',_sans-serif] text-muted-foreground">
                No previous calculations saved.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] text-muted-foreground">{item.expression} =</div>
                      <div className="text-sm font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white">{item.result}</div>
                    </div>
                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-['Questrial',_sans-serif] text-muted-foreground/60 mr-2">{item.timestamp}</span>
                      <button
                        onClick={() => {
                          setDisplay(item.result);
                          toast.success("Loaded result into display");
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-[#3DDC97]/20 hover:text-[#3DDC97] text-white/70 transition-colors"
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
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
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

        {/* Right Desktop Data Importer Panel */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 rounded-[32px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl p-6 md:p-7 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <Download className="h-4 w-4 text-[#3DDC97]" />
                <h3 className="font-['Samsung_Sharp_Sans',_sans-serif] text-sm md:text-base font-bold text-white">
                  Import Live Financial Data
                </h3>
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
  let styleClasses = "bg-[#161c19] text-white hover:bg-[#202824] border-white/5 shadow-md";

  if (variant === "operator") {
    styleClasses = "bg-[#3DDC97]/15 text-[#3DDC97] hover:bg-[#3DDC97]/25 border-[#3DDC97]/30 font-bold shadow-[0_0_15px_rgba(61,220,151,0.1)]";
  } else if (variant === "secondary") {
    styleClasses = "bg-white/5 text-white/80 hover:bg-white/10 border-white/5 font-semibold";
  } else if (variant === "equals") {
    styleClasses = "bg-gradient-to-tr from-[#3DDC97] to-emerald-400 text-black font-bold hover:opacity-90 shadow-lg shadow-[#3DDC97]/25 border-none";
  } else if (variant === "danger") {
    styleClasses = "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border-rose-500/25 font-bold";
  }

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`h-12 sm:h-14 md:h-16 rounded-2xl border text-base md:text-xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold flex items-center justify-center transition-all select-none ${styleClasses}`}
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
    <div className="space-y-5 text-xs font-['Questrial',_sans-serif]">
      {/* Month Selector */}
      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block font-['Questrial',_sans-serif]">
          Select Month for Financial Data
        </label>
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-black/50 border-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-2xl h-11 text-xs"
        />
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="w-full bg-black/50 border border-white/5 p-1.5 rounded-2xl grid grid-cols-3 h-10">
          <TabsTrigger value="monthly" className="text-[11px] font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-xl">Monthly</TabsTrigger>
          <TabsTrigger value="accounts" className="text-[11px] font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-xl">Accounts</TabsTrigger>
          <TabsTrigger value="goals" className="text-[11px] font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-xl">Goals</TabsTrigger>
        </TabsList>

        {/* Tab 1: Monthly Tracking */}
        <TabsContent value="monthly" className="space-y-3 mt-4">
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Month Summary ({selectedMonth})</p>
            
            <button
              onClick={() => onImport(monthlySummary?.net || 0, `Net Cashflow (${selectedMonth})`)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-[#3DDC97]/15 border border-white/5 hover:border-[#3DDC97]/30 transition-all text-left group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-[#3DDC97]">Net Cashflow</div>
                <div className="text-[10px] text-muted-foreground">Income minus Expenses</div>
              </div>
              <div className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white text-xs">
                {formatMoney(monthlySummary?.net || 0, currency)}
              </div>
            </button>

            <button
              onClick={() => onImport(monthlySummary?.income || 0, `Earnings (${selectedMonth})`)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-[#3DDC97]/15 border border-white/5 hover:border-[#3DDC97]/30 transition-all text-left group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-[#3DDC97]">Total Earnings</div>
                <div className="text-[10px] text-muted-foreground">Gross Monthly Income</div>
              </div>
              <div className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-emerald-400 text-xs">
                {formatMoney(monthlySummary?.income || 0, currency)}
              </div>
            </button>

            <button
              onClick={() => onImport(monthlySummary?.expenses || 0, `Expenses (${selectedMonth})`)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-rose-500/15 border border-white/5 hover:border-rose-500/30 transition-all text-left group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-rose-300">Total Expenses</div>
                <div className="text-[10px] text-muted-foreground">Outflow Expenditures</div>
              </div>
              <div className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-rose-400 text-xs">
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
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/10 border border-white/5 transition-all text-left"
                  >
                    <div className="truncate mr-2">
                      <span className="font-medium text-white/90 truncate block">{item.category}</span>
                      {item.description && <span className="text-[9px] text-muted-foreground truncate block">{item.description}</span>}
                    </div>
                    <span className="font-['Samsung_Sharp_Sans',_sans-serif] font-semibold text-white shrink-0 text-xs">
                      {formatMoney(Number(item.amount || 0), currency)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Accounts */}
        <TabsContent value="accounts" className="space-y-3 mt-4">
          <button
            onClick={() => onImport(totalAccountBalance, "Total Accounts Balance")}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#3DDC97]/15 to-cyan-500/15 border border-[#3DDC97]/30 transition-all text-left"
          >
            <div>
              <div className="font-bold text-white">All Accounts Total</div>
              <div className="text-[10px] text-muted-foreground">Combined Liquid Balance</div>
            </div>
            <div className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-[#3DDC97] text-sm">
              {formatMoney(totalAccountBalance, currency)}
            </div>
          </button>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => onImport(Number(acc.opening_balance || 0), acc.name)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/5 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-white">{acc.name}</span>
                </div>
                <span className="font-['Samsung_Sharp_Sans',_sans-serif] font-semibold text-white text-xs">
                  {formatMoney(Number(acc.opening_balance || 0), currency)}
                </span>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Goals & Invoices */}
        <TabsContent value="goals" className="space-y-3 mt-4">
          {invoicesSummary && (
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Invoices Summary</p>
              <button
                onClick={() => onImport(invoicesSummary.pending, "Pending Invoices")}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-amber-500/15 border border-white/5 hover:border-amber-500/30 transition-all text-left"
              >
                <span className="font-semibold text-white">Pending Invoices</span>
                <span className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-amber-400 text-xs">
                  {formatMoney(invoicesSummary.pending, currency)}
                </span>
              </button>
            </div>
          )}

          {goals.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Target Goals</p>
              <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => onImport(Number(g.target_amount || 0), `Goal: ${g.name}`)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/5 transition-all text-left"
                  >
                    <span className="font-medium text-white truncate mr-2">{g.name}</span>
                    <span className="font-['Samsung_Sharp_Sans',_sans-serif] font-semibold text-white text-xs shrink-0">
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
