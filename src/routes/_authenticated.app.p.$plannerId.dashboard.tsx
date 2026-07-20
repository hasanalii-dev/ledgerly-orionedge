import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney, formatDate } from "@/lib/format";
import {
  AreaChart as RAreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart as RPieChart, Pie, Cell, BarChart as RBarChart, Bar
} from "recharts";
import { Clock, TrendingUp, TrendingDown, Wallet, Activity, Target, PieChart, PiggyBank, Flame, Calendar, Crown, ShieldCheck, Sparkles, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, startOfYear } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/dashboard")({
  component: DashboardPage,
});

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, fill, name } = props;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
  const initial = name ? name.charAt(0).toUpperCase() : "O";

  return (
    <g transform={`translate(${x}, ${y})`} style={{ pointerEvents: 'none' }}>
      <circle cx="0" cy="0" r="14" fill="#030808" stroke={fill} strokeWidth="3" />
      <text x="0" y="0" dy="4" textAnchor="middle" fill={fill} fontSize="12" fontWeight="900" fontFamily="sans-serif">
        {initial}
      </text>
    </g>
  );
};

function KpiCard({ icon: Icon, label, value, compactValue, sub, accent }: { icon: React.ElementType; label: string; value: string; compactValue?: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-hairline bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <div className="p-2 bg-muted/50 rounded-full">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="text-3xl font-display font-medium tracking-tight truncate text-foreground" title={value}>
        {compactValue || value}
      </div>
      {sub && (
        <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" /> {sub}
        </div>
      )}
    </div>
  );
}

function DashboardPage() {
  const { plannerId } = Route.useParams();

  const { data: planner } = useQuery({
    queryKey: ["planner", plannerId],
    queryFn: async () => (await supabase.from("planners").select("*").eq("id", plannerId).single()).data,
  });
  const currency = planner?.currency ?? "USD";

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { ...data, email: user.email };
    },
  });



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

  const { data: pendingInvites = [], refetch: refetchInvites } = useQuery({
    queryKey: ["pending_invites", profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      return (await supabase.from("planner_invites").select("*, planners(name)").eq("invitee_email", profile.email).eq("status", "pending")).data ?? [];
    },
    enabled: !!profile?.email,
  });

  const handleInviteAction = async (inviteId: string, action: 'accepted' | 'declined') => {
    const { error } = await supabase.from("planner_invites").update({ status: action }).eq("id", inviteId);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (action === 'accepted') {
      const invite = pendingInvites.find(i => i.id === inviteId);
      if (invite) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("planner_collaborators").insert({
          planner_id: invite.planner_id,
          user_id: user?.id,
          role: invite.role,
        });
      }
    }
    toast.success(`Invite ${action}`);
    refetchInvites();
  };

  const totalIncome = income.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, r) => s + Number(r.amount || 0), 0);
  const net = totalIncome - totalExpenses;
  const balance = accounts.reduce((s, a) => s + Number(a.opening_balance || 0), 0) + net;

  const yearStart = startOfYear(new Date());
  const monthsSinceYear = Math.max(1, new Date().getMonth() + 1);
  const yearIncome = income.filter((i) => new Date(i.date) >= yearStart).reduce((s, r) => s + Number(r.amount || 0), 0);
  const avgMonthlyIncome = yearIncome / monthsSinceYear;
  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const monthIncome = income.filter((i) => new Date(i.date) >= thisMonthStart && new Date(i.date) <= thisMonthEnd).reduce((s, r) => s + Number(r.amount || 0), 0);
  const monthExpenses = expenses.filter((i) => new Date(i.date) >= thisMonthStart && new Date(i.date) <= thisMonthEnd).reduce((s, r) => s + Number(r.amount || 0), 0);
  const monthProfit = monthIncome - monthExpenses;

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

  const cashflow: { month: string; income: number; expense: number; net: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = subMonths(new Date(), 5 - i);
    const start = startOfMonth(d), end = endOfMonth(d);
    const inc = income.filter((x) => new Date(x.date) >= start && new Date(x.date) <= end).reduce((s, r) => s + Number(r.amount || 0), 0);
    const exp = expenses.filter((x) => new Date(x.date) >= start && new Date(x.date) <= end).reduce((s, r) => s + Number(r.amount || 0), 0);
    cashflow.push({ month: format(d, "MMM"), income: inc, expense: exp, net: inc - exp });
  }

  const pieColors = ["#3DDC97", "#00E5FF", "#00F0B5", "#FFD166", "#14B8A6", "#10B981", "#06B6D4", "#FBBF24"];
  const expensePie = Object.entries(catTotals).slice(0, 8).map(([name, value]) => ({ name, value }));

  const recentTx = [...income.map((i) => ({ ...i, kind: "income" as const })), ...expenses.map((e) => ({ ...e, kind: "expense" as const }))]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="relative z-10 space-y-6 max-w-[1600px] mx-auto pb-20 pt-4">


        {/* Mobile App Header (Centered Avatar + Welcome) */}
        <div className="flex flex-col items-center text-center md:hidden px-4 pt-6 pb-4">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-2 border-white/10 ring-2 ring-[#101311] shadow-xl">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-[#111312] text-white text-3xl font-medium border border-white/5">
                {(profile?.display_name || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              size="icon" 
              asChild 
              className="absolute top-0 -right-2 rounded-full h-8 w-8 z-10 bg-[#1A1A1A] backdrop-blur-md shadow-xl border border-white/10"
            >
              <Link to="/app/p/$plannerId/notifications" params={{ plannerId }}>
                <Bell className="h-3.5 w-3.5 text-white/80" />
                {pendingInvites.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-[#3DDC97] rounded-full border border-background" />
                )}
              </Link>
            </Button>
          </div>
          <h1 className="text-[28px] font-display font-bold tracking-tight text-white mb-1">
            Welcome back, {profile?.display_name?.split(' ')[0] || "there"}
          </h1>
          <p className="text-sm text-muted-foreground">Snapshot of {planner?.name ?? "your planner"}</p>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex md:items-center justify-between gap-4 md:gap-0">
          <div className="text-left">
            <h1 className="text-3xl font-display tracking-tight">
              Welcome back, {profile?.display_name?.split(' ')[0] || "there"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Snapshot of {planner?.name ?? "your planner"}</p>
          </div>
          
          <div className="flex items-center relative">
            <Avatar className="h-20 w-20 border-2 border-white/10 ring-2 ring-primary/20 shadow-xl">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-primary text-3xl font-medium">
                {(profile?.display_name || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              size="icon" 
              asChild 
              className="absolute -top-1 -right-1 rounded-full h-9 w-9 z-10 bg-background/95 backdrop-blur-md shadow-lg border-white/20 hover:scale-110 transition-transform"
            >
              <Link to="/app/p/$plannerId/notifications" params={{ plannerId }}>
                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                  transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
                >
                  <Bell className="h-4 w-4 text-foreground" />
                </motion.div>
                {pendingInvites.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-white text-[9px] font-bold rounded-full border-2 border-background flex items-center justify-center animate-pulse">
                    {pendingInvites.length}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
        {/* KPI Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0 mt-6 md:mt-0">
          <KpiCard icon={TrendingUp} label="Total Income" value={formatMoney(totalIncome, currency)} compactValue={formatMoney(totalIncome, currency, true)} accent />
          <KpiCard icon={TrendingDown} label="Total Expenses" value={formatMoney(totalExpenses, currency)} compactValue={formatMoney(totalExpenses, currency, true)} />
          <KpiCard icon={Sparkles} label="Net Cash Flow" value={formatMoney(net, currency)} compactValue={formatMoney(net, currency, true)} sub={net >= 0 ? "In the green" : "In the red"} />
          <KpiCard icon={Wallet} label="Current Balance" value={formatMoney(balance, currency)} compactValue={formatMoney(balance, currency, true)} />
          <KpiCard icon={PiggyBank} label="This Month Profit" value={formatMoney(monthProfit, currency)} compactValue={formatMoney(monthProfit, currency, true)} />
          <KpiCard icon={Calendar} label="Avg Monthly Income" value={formatMoney(avgMonthlyIncome, currency)} compactValue={formatMoney(avgMonthlyIncome, currency, true)} />
          <KpiCard icon={ShieldCheck} label="Tax Reserve" value={formatMoney(yearIncome * 0.25, currency)} compactValue={formatMoney(yearIncome * 0.25, currency, true)} />
          <KpiCard icon={Flame} label="Pending Invoices" value={String(pendingInvoiceCount)} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 px-4 md:px-0">
          <div className="lg:col-span-2 rounded-[24px] border border-white/5 bg-[#111312] p-5 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-display font-bold text-white text-lg tracking-wide">HYPER CHARTS</h3>
                <p className="text-xs text-[#3DDC97] uppercase tracking-widest font-semibold mt-1">Cash flow · Bar Charts</p>
              </div>
            </div>
            <div className="h-64 mt-4 relative z-10">
                <ResponsiveContainer>
                  <RBarChart data={cashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
                    <defs>
                      <linearGradient id="barIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3DDC97" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#3DDC97" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="barExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF3366" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#FF3366" stopOpacity={0.2}/>
                      </linearGradient>
                      <filter id="hyperGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} dx={-10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(val: number) => formatMoney(val, currency)}
                      contentStyle={{ backgroundColor: "#111312", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} 
                      itemStyle={{ color: "white", fontWeight: 600, padding: "2px 0" }}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar dataKey="income" fill="url(#barIncome)" radius={[4, 4, 0, 0]} barSize={10} filter="url(#hyperGlow)" />
                    <Bar dataKey="expense" fill="url(#barExpense)" radius={[4, 4, 0, 0]} barSize={10} filter="url(#hyperGlow)" />
                  </RBarChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 hover:bg-card/60 transition-colors duration-300 shadow-sm">
            <h3 className="font-display text-lg mb-1">Expense breakdown</h3>
            <p className="text-xs text-muted-foreground mb-4">By category</p>
            {expensePie.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground text-center border border-dashed border-white/10 rounded-xl mt-4">No expenses to display</div>
            ) : (
              <div className="relative h-72 mt-2">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className="absolute w-[150px] h-[150px] rounded-full border-[1.5px] border-white/10" />
                  <div className="flex flex-col items-center justify-center relative">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1">Expenses</span>
                    <span className={`text-[28px] font-display font-bold tracking-tight text-white`}>
                      {formatMoney(totalExpenses, currency, true)}
                    </span>
                  </div>
                </div>
                
                <div className="relative z-10 w-full h-full">
                  <ResponsiveContainer>
                    <RPieChart>
                      <defs>
                        <filter id="pieGlowDashboard" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie 
                        data={expensePie} 
                        dataKey="value" 
                        nameKey="name" 
                        innerRadius={85} 
                        outerRadius={105} 
                        paddingAngle={10} 
                        cornerRadius={20} 
                        stroke="none" 
                        filter="url(#pieGlowDashboard)"
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {expensePie.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                      </Pie>
                      <Tooltip 
                        formatter={(val: number, name: string) => {
                          const total = expensePie.reduce((acc, curr) => acc + curr.value, 0);
                          const percent = total > 0 ? `(${(val / total * 100).toFixed(1)}%)` : '';
                          return [`${formatMoney(val, currency)} ${percent}`, name];
                        }}
                        wrapperStyle={{ zIndex: 50 }}
                        contentStyle={{ backgroundColor: "#111312", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} 
                        itemStyle={{ color: "white", fontWeight: 600, padding: "2px 0" }}
                      />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 hover:bg-card/60 transition-colors duration-300 group">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2"><div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors"><Crown className="h-3.5 w-3.5" /></div> Biggest client</div>
            <div className="mt-4 text-xl font-display font-medium truncate">{biggestClient?.[0] ?? "—"}</div>
            <div className="mt-1 text-sm text-primary">{biggestClient ? formatMoney(biggestClient[1], currency) : "—"}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 hover:bg-card/60 transition-colors duration-300 group">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2"><div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors"><Flame className="h-3.5 w-3.5" /></div> Highest expense</div>
            <div className="mt-4 text-xl font-display font-medium truncate">{topCat?.[0] ?? "—"}</div>
            <div className="mt-1 text-sm text-primary">{topCat ? formatMoney(topCat[1], currency) : "—"}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 hover:bg-card/60 transition-colors duration-300 group">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2"><div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors"><Wallet className="h-3.5 w-3.5" /></div> Accounts</div>
            <div className="mt-3 text-xl font-display">{accounts.length}</div>
            <div className="mt-1 text-sm text-muted-foreground">{formatMoney(balance, currency)} across all</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-2 md:mt-0">
          <div className="rounded-2xl md:border md:border-hairline md:bg-card overflow-hidden">
            <div className="px-4 md:px-5 py-2 md:py-4 flex items-center justify-between md:border-b md:border-hairline">
              <h3 className="font-display text-lg md:text-base font-semibold md:font-normal">Transactions</h3>
              <Button variant="ghost" className="md:hidden text-muted-foreground text-sm h-auto p-0">See all</Button>
            </div>
            <div className="flex flex-col gap-2 md:gap-0 px-4 md:px-0 md:divide-y md:divide-hairline">
              {recentTx.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No transactions yet</div>}
              {recentTx.map((t, index) => (
                <div key={`${t.kind}-${t.id || index}`} className="md:px-5 py-3 flex items-center justify-between rounded-2xl md:rounded-none bg-white/5 md:bg-transparent px-4 md:hover:bg-elevated">
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 md:h-8 md:w-8 rounded-full md:rounded-lg flex items-center justify-center ${t.kind === "income" ? "bg-primary/20 text-primary" : "bg-white/10 text-white"}`}>
                      {t.kind === "income" ? <ArrowDownLeft className="h-5 w-5 md:h-4 md:w-4" /> : <ArrowUpRight className="h-5 w-5 md:h-4 md:w-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{t.description ?? (t.kind === "income" ? "Income" : "Expense")}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{formatDate(t.date)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold md:font-medium ${t.kind === "income" ? "text-primary" : "text-foreground"}`}>
                      {t.kind === "income" ? "+" : "−"}{formatMoney(t.amount, t.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 hover:bg-card/60 transition-colors duration-300 shadow-sm overflow-hidden">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-display">Recent activity</h3>
            </div>
            <div className="space-y-1">
              {activity.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Nothing yet</div>}
              {activity.map((a) => (
                <div key={a.id} className="px-3 py-2 -mx-2 flex items-start gap-3 hover:bg-white/5 rounded-xl transition-colors group/item">
                  <div className="p-2 rounded-xl bg-white/5 group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors shrink-0">
                    <Activity className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate text-foreground/90 group-hover/item:text-foreground">{a.title}</div>
                    <div className="text-xs text-muted-foreground truncate flex items-center gap-2 mt-0.5">
                      <Clock className="h-3 w-3" /> {formatDate(a.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
