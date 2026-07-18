import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney, formatDate } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  Calendar, TrendingUp, TrendingDown, Wallet, Clock, Download, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  startOfMonth, endOfMonth, startOfYear, endOfYear, subYears, format, parseISO, isValid,
} from "date-fns";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/reports")({
  component: ReportsPage,
});

type Period = "month" | "year" | "5years" | "all" | "custom";

interface PeriodDef {
  label: string;
  from: Date;
  to: Date;
}

function usePeriod(period: Period, customFrom: string, customTo: string): PeriodDef {
  const now = new Date();
  switch (period) {
    case "month":
      return { label: "This month", from: startOfMonth(now), to: endOfMonth(now) };
    case "year":
      return { label: "This year", from: startOfYear(now), to: endOfYear(now) };
    case "5years":
      return { label: "Last 5 years", from: subYears(startOfYear(now), 4), to: endOfYear(now) };
    case "custom": {
      const from = parseISO(customFrom);
      const to = parseISO(customTo);
      return {
        label: isValid(from) && isValid(to) ? `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}` : "Custom range",
        from: isValid(from) ? from : new Date(0),
        to: isValid(to) ? to : now,
      };
    }
    case "all":
    default:
      return { label: "All time", from: new Date(0), to: now };
  }
}

function KpiCard({
  icon: Icon, label, value, compactValue, sub, tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  compactValue?: string;
  sub?: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const isColored = tone === "positive" || tone === "negative";
  const wrapperClass = tone === "positive" 
    ? "p-[1px] bg-gradient-to-br from-primary/50 via-white/5 to-white/5" 
    : tone === "negative" 
    ? "p-[1px] bg-gradient-to-br from-destructive/50 via-white/5 to-white/5" 
    : "border border-white/5 bg-card/40 hover:bg-card/60 hover:border-white/10";

  return (
    <div className={`group relative rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${wrapperClass}`}>
      <div className={`relative h-full w-full rounded-[15px] overflow-hidden p-5 ${isColored ? "bg-card" : ""}`}>
        {tone === "positive" && (
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/40 blur-[40px] rounded-full pointer-events-none" />
        )}
        {tone === "negative" && (
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-destructive/40 blur-[40px] rounded-full pointer-events-none" />
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground relative z-10">
          <span className={tone === "positive" ? "text-primary/80 font-medium" : tone === "negative" ? "text-destructive/80 font-medium" : "text-muted-foreground"}>{label}</span>
          <div className={`p-1.5 rounded-lg ${tone === "positive" ? "bg-primary/10 text-primary border border-primary/20" : tone === "negative" ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-white/5"} relative`}>
            <Icon className="h-3.5 w-3.5 relative z-10" />
          </div>
        </div>
        <div className={`mt-3 text-2xl font-display truncate relative z-10 ${isColored ? "text-white" : ""}`} title={value}>{compactValue || value}</div>
        {sub && <div className="mt-1.5 text-xs text-muted-foreground relative z-10">{sub}</div>}
      </div>
    </div>
  );
}

function ReportsPage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);
  const [period, setPeriod] = useState<Period>("month");
  const [customFrom, setCustomFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));

  const periodDef = usePeriod(period, customFrom, customTo);

  const { data: income = [] } = useQuery({
    queryKey: ["income", plannerId],
    queryFn: async () => (await supabase.from("income_entries").select("*, clients(name)").eq("planner_id", plannerId).order("date", { ascending: false })).data ?? [],
  });
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses", plannerId],
    queryFn: async () => (await supabase.from("expense_entries").select("*, expense_categories(name, color)").eq("planner_id", plannerId).order("date", { ascending: false })).data ?? [],
  });

  const filteredIncome = income.filter((i) => {
    const d = new Date(i.date);
    return d >= periodDef.from && d <= periodDef.to;
  });
  const filteredExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= periodDef.from && d <= periodDef.to;
  });

  const totalIncome = filteredIncome.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((s, r) => s + Number(r.amount || 0), 0);
  const net = totalIncome - totalExpenses;

  const monthCount = Math.max(1, Math.ceil((periodDef.to.getTime() - periodDef.from.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const avgIncome = totalIncome / monthCount;
  const avgExpense = totalExpenses / monthCount;

  const categoryTotals: Record<string, { name: string; color?: string; amount: number }> = {};
  filteredExpenses.forEach((e) => {
    const cat = (e as { expense_categories?: { name?: string; color?: string } }).expense_categories;
    const key = cat?.name ?? "Uncategorized";
    if (!categoryTotals[key]) categoryTotals[key] = { name: key, color: cat?.color, amount: 0 };
    categoryTotals[key].amount += Number(e.amount || 0);
  });
  const topCategories = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount).slice(0, 8);

  const clientTotals: Record<string, { name: string; amount: number }> = {};
  filteredIncome.forEach((i) => {
    const client = (i as { clients?: { name?: string } }).clients;
    const key = client?.name ?? "Unassigned";
    if (!clientTotals[key]) clientTotals[key] = { name: key, amount: 0 };
    clientTotals[key].amount += Number(i.amount || 0);
  });
  const topClients = Object.values(clientTotals).sort((a, b) => b.amount - a.amount).slice(0, 8);

  // Monthly aggregation for the bar chart
  const monthlyMap = new Map<string, { label: string; income: number; expenses: number }>();
  for (let d = new Date(periodDef.from); d <= periodDef.to; d = new Date(d.setMonth(d.getMonth() + 1))) {
    const key = format(d, "yyyy-MM");
    monthlyMap.set(key, { label: format(d, "MMM yy"), income: 0, expenses: 0 });
  }
  filteredIncome.forEach((i) => {
    const key = (i.date ?? "").slice(0, 7);
    const c = monthlyMap.get(key);
    if (c) c.income += Number(i.amount || 0);
  });
  filteredExpenses.forEach((e) => {
    const key = (e.date ?? "").slice(0, 7);
    const c = monthlyMap.get(key);
    if (c) c.expenses += Number(e.amount || 0);
  });
  const monthly = Array.from(monthlyMap.values());

  const csvRows = [
    ["Type", "Date", "Description", "Category/Client", "Amount", "Currency"],
    ...filteredIncome.map((i) => ["Income", i.date, i.description ?? "", (i as { clients?: { name?: string } }).clients?.name ?? "", String(i.amount), i.currency ?? currency]),
    ...filteredExpenses.map((e) => ["Expense", e.date, e.description ?? "", (e as { expense_categories?: { name?: string } }).expense_categories?.name ?? "", String(e.amount), e.currency ?? currency]),
  ];
  const csv = csvRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
  const downloadCsv = () => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumen-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {periodDef.label} · {formatDate(periodDef.from)} – {formatDate(periodDef.to)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-hairline bg-card hover:bg-accent">
                <Calendar className="h-4 w-4 mr-2" />
                {period === "month" && "This month"}
                {period === "year" && "This year"}
                {period === "5years" && "Last 5 years"}
                {period === "all" && "All time"}
                {period === "custom" && "Custom range"}
                <ChevronDown className="h-4 w-4 ml-2 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setPeriod("month")}>This month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("year")}>This year</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("5years")}>Last 5 years</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("all")}>All time</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("custom")}>Custom range</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={downloadCsv} variant="outline" className="border-hairline bg-card hover:bg-accent">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {period === "custom" && (
        <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-hairline bg-card p-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground">From</label>
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="bg-input border-hairline" />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground">To</label>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="bg-input border-hairline" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={TrendingUp} label="Total Earned" value={formatMoney(totalIncome, currency)} compactValue={formatMoney(totalIncome, currency, true)} tone="positive" />
        <KpiCard icon={TrendingDown} label="Total Spent" value={formatMoney(totalExpenses, currency)} compactValue={formatMoney(totalExpenses, currency, true)} tone="negative" />
        <KpiCard icon={Wallet} label="Net" value={formatMoney(net, currency)} compactValue={formatMoney(net, currency, true)} tone={net >= 0 ? "positive" : "negative"} />
        <KpiCard icon={Clock} label="Transactions" value={String(filteredIncome.length + filteredExpenses.length)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Calendar} label="Avg monthly income" value={formatMoney(avgIncome, currency)} compactValue={formatMoney(avgIncome, currency, true)} />
        <KpiCard icon={Calendar} label="Avg monthly spend" value={formatMoney(avgExpense, currency)} compactValue={formatMoney(avgExpense, currency, true)} />
        <KpiCard icon={TrendingUp} label="Income transactions" value={String(filteredIncome.length)} />
        <KpiCard icon={TrendingDown} label="Expense transactions" value={String(filteredExpenses.length)} />
      </div>

      <div className="rounded-2xl border border-hairline bg-card p-5">
        <div className="mb-4">
          <h3 className="font-display text-lg">Income vs Spend</h3>
          <p className="text-xs text-muted-foreground">Monthly breakdown for the selected period</p>
        </div>
        <div className="h-72">
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <filter id="glowBarReports" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} axisLine={false} tickLine={false} dx={-10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val: number) => formatMoney(val, currency)}
                  contentStyle={{ backgroundColor: "rgba(3, 8, 8, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", color: "white" }} 
                  itemStyle={{ color: "white", fontWeight: 500, padding: "2px 0" }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: "4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, opacity: 0.8, paddingTop: 10 }} />
                <Bar dataKey="income" name="Earned" fill="#3DDC97" radius={[6, 6, 0, 0]} filter="url(#glowBarReports)" />
                <Bar dataKey="expenses" name="Spent" fill="#F56565" radius={[6, 6, 0, 0]} filter="url(#glowBarReports)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No transactions in this period</div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-hairline bg-card p-5">
          <h3 className="font-display text-lg mb-1">Top clients</h3>
          <p className="text-xs text-muted-foreground mb-4">By income in this period</p>
          {topClients.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">No income recorded</div>
          ) : (
            <div className="space-y-3">
              {topClients.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="text-sm truncate">{c.name}</span>
                  <span className="text-sm font-medium text-primary">{formatMoney(c.amount, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-hairline bg-card p-5">
          <h3 className="font-display text-lg mb-1">Top expense categories</h3>
          <p className="text-xs text-muted-foreground mb-4">By spend in this period</p>
          {topCategories.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">No expenses recorded</div>
          ) : (
            <div className="space-y-3">
              {topCategories.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {c.color && <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />}
                    <span className="text-sm truncate">{c.name}</span>
                  </div>
                  <span className="text-sm font-medium">{formatMoney(c.amount, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-hairline bg-card p-5">
        <h3 className="font-display text-lg mb-1">Recent transactions</h3>
        <p className="text-xs text-muted-foreground mb-4">In this period</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-hairline">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Source/Category</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {[...filteredIncome.map((i) => ({ ...i, kind: "income" as const })), ...filteredExpenses.map((e) => ({ ...e, kind: "expense" as const }))]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 20)
                .map((t) => (
                  <tr key={`${t.kind}-${t.id}`} className="hover:bg-elevated">
                    <td className="py-3 text-muted-foreground">{formatDate(t.date)}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${t.kind === "income" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                        {t.kind === "income" ? "Earned" : "Spent"}
                      </span>
                    </td>
                    <td className="py-3 truncate max-w-[200px]">{t.description ?? "—"}</td>
                    <td className="py-3 text-muted-foreground">
                      {t.kind === "income"
                        ? (t as { clients?: { name?: string } }).clients?.name ?? "—"
                        : (t as { expense_categories?: { name?: string } }).expense_categories?.name ?? "—"}
                    </td>
                    <td className={`py-3 text-right font-medium ${t.kind === "income" ? "text-primary" : ""}`}>
                      {t.kind === "income" ? "+" : "−"}{formatMoney(t.amount, t.currency ?? currency)}
                    </td>
                  </tr>
                ))}
              {filteredIncome.length === 0 && filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No transactions in this period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
