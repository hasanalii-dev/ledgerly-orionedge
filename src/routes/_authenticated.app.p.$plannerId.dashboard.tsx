import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney, formatDate } from "@/lib/format";
import {
  LineChart as RLineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart as RPieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, ShieldCheck, Sparkles, Crown, Flame, Calendar,
  Clock, Activity,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, startOfYear } from "date-fns";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/dashboard")({
  component: Dashboard,
});

function KpiCard({ icon: Icon, label, value, compactValue, sub, accent }: { icon: React.ElementType; label: string; value: string; compactValue?: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-primary/30 bg-card glow-emerald" : "border-hairline bg-card"}`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : ""}`} />
      </div>
      <div className={`mt-3 text-3xl font-display tracking-tight truncate ${accent ? "text-primary" : ""}`} title={value}>{compactValue || value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Dashboard() {
  const { plannerId } = Route.useParams();

  const { data: planner } = useQuery({
    queryKey: ["planner", plannerId],
    queryFn: async () => (await supabase.from("planners").select("*").eq("id", plannerId).single()).data,
  });
  const currency = planner?.currency ?? "USD";

  const { data: income = [] } = useQuery({
    queryKey: ["income", plannerId],
    queryFn: async () => (await supabase.from("income_entries").select("*, clients(name)").eq("planner_id", plannerId).order("date", { ascending: false })).data ?? [],
  });
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses", plannerId],
    queryFn: async () => (await supabase.from("expense_entries").select("*, expense_categories(name, color)").eq("planner_id", plannerId).order("date", { ascending: false })).data ?? [],
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", plannerId],
    queryFn: async () => (await supabase.from("accounts").select("*").eq("planner_id", plannerId)).data ?? [],
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices", plannerId],
    queryFn: async () => (await supabase.from("invoices").select("*").eq("planner_id", plannerId)).data ?? [],
  });
  const { data: activity = [] } = useQuery({
    queryKey: ["activity", plannerId],
    queryFn: async () => (await supabase.from("activity_events").select("*").eq("planner_id", plannerId).order("created_at", { ascending: false }).limit(8)).data ?? [],
  });

  const totalIncome = income.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, r) => s + Number(r.amount || 0), 0);
  const net = totalIncome - totalExpenses;
  const balance = accounts.reduce((s, a) => s + Number(a.opening_balance || 0), 0) + net;

  const yearStart = startOfYear(new Date());
  const monthsAgo6 = subMonths(new Date(), 5);
  const monthsSinceYear = Math.max(1, new Date().getMonth() + 1);
  const yearIncome = income.filter((i) => new Date(i.date) >= yearStart).reduce((s, r) => s + Number(r.amount || 0), 0);
  const avgMonthlyIncome = yearIncome / monthsSinceYear;
  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const monthIncome = income.filter((i) => new Date(i.date) >= thisMonthStart && new Date(i.date) <= thisMonthEnd).reduce((s, r) => s + Number(r.amount || 0), 0);
  const monthExpenses = expenses.filter((i) => new Date(i.date) >= thisMonthStart && new Date(i.date) <= thisMonthEnd).reduce((s, r) => s + Number(r.amount || 0), 0);
  const monthProfit = monthIncome - monthExpenses;

  // Biggest client
  const clientTotals: Record<string, number> = {};
  income.forEach((i) => {
    const key = (i as { clients?: { name?: string } }).clients?.name ?? "Unassigned";
    clientTotals[key] = (clientTotals[key] ?? 0) + Number(i.amount || 0);
  });
  const biggestClient = Object.entries(clientTotals).sort((a, b) => b[1] - a[1])[0];

  const catTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    const key = (e as { expense_categories?: { name?: string } }).expense_categories?.name ?? "Uncategorized";
    catTotals[key] = (catTotals[key] ?? 0) + Number(e.amount || 0);
  });
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  const pendingInvoiceCount = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").length;

  // Cash flow last 6 months
  const cashflow: { month: string; income: number; expense: number; net: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = subMonths(new Date(), 5 - i);
    const start = startOfMonth(d), end = endOfMonth(d);
    const inc = income.filter((x) => new Date(x.date) >= start && new Date(x.date) <= end).reduce((s, r) => s + Number(r.amount || 0), 0);
    const exp = expenses.filter((x) => new Date(x.date) >= start && new Date(x.date) <= end).reduce((s, r) => s + Number(r.amount || 0), 0);
    cashflow.push({ month: format(d, "MMM"), income: inc, expense: exp, net: inc - exp });
  }

  const pieColors = ["#3DDC97", "#7CC4FF", "#FFB86B", "#B794F4", "#F687B3", "#68D391", "#F6AD55", "#9F7AEA"];
  const expensePie = Object.entries(catTotals).slice(0, 8).map(([name, value]) => ({ name, value }));

  const recentTx = [...income.map((i) => ({ ...i, kind: "income" as const })), ...expenses.map((e) => ({ ...e, kind: "expense" as const }))]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  void monthsAgo6;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-display tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Snapshot of {planner?.name ?? "your planner"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={TrendingUp} label="Total Income" value={formatMoney(totalIncome, currency)} compactValue={formatMoney(totalIncome, currency, true)} accent />
        <KpiCard icon={TrendingDown} label="Total Expenses" value={formatMoney(totalExpenses, currency)} compactValue={formatMoney(totalExpenses, currency, true)} />
        <KpiCard icon={Sparkles} label="Net Cash Flow" value={formatMoney(net, currency)} compactValue={formatMoney(net, currency, true)} sub={net >= 0 ? "In the green" : "In the red"} />
        <KpiCard icon={Wallet} label="Current Balance" value={formatMoney(balance, currency)} compactValue={formatMoney(balance, currency, true)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={PiggyBank} label="This Month Profit" value={formatMoney(monthProfit, currency)} compactValue={formatMoney(monthProfit, currency, true)} />
        <KpiCard icon={Calendar} label="Avg Monthly Income" value={formatMoney(avgMonthlyIncome, currency)} compactValue={formatMoney(avgMonthlyIncome, currency, true)} />
        <KpiCard icon={ShieldCheck} label="Tax Reserve (est. 25%)" value={formatMoney(yearIncome * 0.25, currency)} compactValue={formatMoney(yearIncome * 0.25, currency, true)} />
        <KpiCard icon={Flame} label="Pending Invoices" value={String(pendingInvoiceCount)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-hairline bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg">Cash flow · Last 6 months</h3>
              <p className="text-xs text-muted-foreground">Income vs expenses</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <RLineChart data={cashflow}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.66 0.02 155)" fontSize={12} />
                <YAxis stroke="oklch(0.66 0.02 155)" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val: number) => formatMoney(val, currency)}
                  contentStyle={{ background: "oklch(0.22 0.008 155)", border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: 12, color: "white" }} 
                  itemStyle={{ color: "white" }}
                />
                <Line type="monotone" dataKey="income" stroke="#3DDC97" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expense" stroke="#F56565" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="net" stroke="#7CC4FF" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
              </RLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-card p-5">
          <h3 className="font-display text-lg mb-1">Expense breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">By category</p>
          {expensePie.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No expenses yet</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <RPieChart>
                  <Pie data={expensePie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {expensePie.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => formatMoney(val, currency)}
                    contentStyle={{ background: "oklch(0.22 0.008 155)", border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: 12, color: "white" }} 
                    itemStyle={{ color: "white" }}
                  />
                </RPieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-hairline bg-card p-5">
          <div className="text-xs text-muted-foreground flex items-center gap-2"><Crown className="h-3.5 w-3.5" /> Biggest client</div>
          <div className="mt-3 text-xl font-display truncate">{biggestClient?.[0] ?? "—"}</div>
          <div className="mt-1 text-sm text-primary">{biggestClient ? formatMoney(biggestClient[1], currency) : "—"}</div>
        </div>
        <div className="rounded-2xl border border-hairline bg-card p-5">
          <div className="text-xs text-muted-foreground flex items-center gap-2"><Flame className="h-3.5 w-3.5" /> Highest expense</div>
          <div className="mt-3 text-xl font-display truncate">{topCat?.[0] ?? "—"}</div>
          <div className="mt-1 text-sm text-primary">{topCat ? formatMoney(topCat[1], currency) : "—"}</div>
        </div>
        <div className="rounded-2xl border border-hairline bg-card p-5">
          <div className="text-xs text-muted-foreground flex items-center gap-2"><Wallet className="h-3.5 w-3.5" /> Accounts</div>
          <div className="mt-3 text-xl font-display">{accounts.length}</div>
          <div className="mt-1 text-sm text-muted-foreground">{formatMoney(balance, currency)} across all</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-hairline bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-hairline flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-display">Recent transactions</h3>
          </div>
          <div className="divide-y divide-hairline">
            {recentTx.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No transactions yet</div>}
            {recentTx.map((t) => (
              <div key={`${t.kind}-${t.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-elevated">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${t.kind === "income" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                    {t.kind === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium truncate">{t.description ?? (t.kind === "income" ? "Income" : "Expense")}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(t.date)}</div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${t.kind === "income" ? "text-primary" : "text-foreground"}`}>
                  {t.kind === "income" ? "+" : "−"}{formatMoney(t.amount, t.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-hairline flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-display">Recent activity</h3>
          </div>
          <div className="divide-y divide-hairline">
            {activity.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Nothing yet</div>}
            {activity.map((a) => (
              <div key={a.id} className="px-5 py-3">
                <div className="text-sm truncate">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.subtitle} · {formatDate(a.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
