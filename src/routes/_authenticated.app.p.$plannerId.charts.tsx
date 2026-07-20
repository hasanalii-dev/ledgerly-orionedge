import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, LineChart, Line,
  ComposedChart, ReferenceLine
} from "recharts";
import { formatMoney, formatCompact } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieIcon, Activity, Layers, CandlestickChart, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/charts")({
  component: ChartsPage,
});

const PALETTE = [
  "#3DDC97", "#00E5FF", "#7C3AED", "#FF6B6B", "#FFD166", 
  "#14B8A6", "#F472B6", "#06B6D4", "#FBBF24", "#A78BFA"
];

/* ── Glass Tooltip ─────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, currency, valuePrefix }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="relative" style={{ zIndex: 9999 }}>
      {/* Outer glow ring */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/20 via-white/5 to-white/10 pointer-events-none" />
      <div className="relative bg-[#0c1210]/80 backdrop-blur-3xl rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] min-w-[180px]">
        <p className="text-[10px] text-white/50 font-semibold uppercase tracking-widest mb-2.5 border-b border-white/5 pb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-6 py-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full ring-2 ring-offset-1 ring-offset-transparent" style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}` }} />
              <span className="text-[11px] text-white/60 capitalize font-medium">{entry.name}</span>
            </div>
            <span className="text-[11px] font-bold text-white tabular-nums">{valuePrefix}{formatMoney(entry.value, currency, true)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieTooltip({ active, payload, currency, total }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0";
  return (
    <div className="relative" style={{ zIndex: 9999 }}>
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/20 via-white/5 to-white/10 pointer-events-none" />
      <div className="relative bg-[#0c1210]/80 backdrop-blur-3xl rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] min-w-[160px]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.fill || entry.payload.color, boxShadow: `0 0 8px ${entry.payload.fill || entry.payload.color}` }} />
          <span className="text-[11px] font-semibold text-white">{entry.name}</span>
        </div>
        <div className="text-sm font-bold text-white tabular-nums">{formatMoney(entry.value, currency)}</div>
        <div className="text-[10px] text-white/40 mt-0.5 font-medium">{pct}% of total</div>
      </div>
    </div>
  );
}

function CandlestickTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="relative" style={{ zIndex: 9999 }}>
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/20 via-white/5 to-white/10 pointer-events-none" />
      <div className="relative bg-[#0c1210]/80 backdrop-blur-3xl rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] min-w-[200px]">
        <p className="text-[10px] text-white/50 font-semibold uppercase tracking-widest mb-2 border-b border-white/5 pb-2">{d.month}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[11px] text-white/50 font-medium">Open (Expenses)</span>
            <span className="text-[11px] font-bold text-[#FF6B6B] tabular-nums">{formatMoney(d.open, currency, true)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/50 font-medium">Close (Income)</span>
            <span className="text-[11px] font-bold text-[#3DDC97] tabular-nums">{formatMoney(d.close, currency, true)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/50 font-medium">High</span>
            <span className="text-[11px] font-bold text-white tabular-nums">{formatMoney(d.high, currency, true)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/50 font-medium">Low</span>
            <span className="text-[11px] font-bold text-white tabular-nums">{formatMoney(d.low, currency, true)}</span>
          </div>
          <div className="border-t border-white/5 pt-1.5 flex justify-between">
            <span className="text-[11px] text-white/50 font-medium">Net</span>
            <span className={`text-[11px] font-bold tabular-nums ${d.close >= d.open ? 'text-[#3DDC97]' : 'text-[#FF6B6B]'}`}>
              {d.close >= d.open ? '+' : ''}{formatMoney(d.close - d.open, currency, true)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Donut Label ───────────────────────────────────────────── */
const renderDonutLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, fill, name } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  return (
    <text x={x} y={y} fill={fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
      {name?.length > 10 ? name.slice(0, 10) + '…' : name}
    </text>
  );
};

/* ── Chart Card Wrapper ────────────────────────────────────── */
function ChartCard({ title, subtitle, icon: Icon, children, className = "" }: { title: string; subtitle: string; icon: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[24px] border border-white/5 bg-[#0e1211] p-5 md:p-6 relative overflow-hidden group transition-all duration-300 hover:border-white/10 ${className}`}>
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/8 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="flex items-start gap-3 mb-5 relative z-10">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-[15px] tracking-wide">{title}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ── Stat Pill ─────────────────────────────────────────────── */
function StatPill({ label, value, trend }: { label: string; value: string; trend?: "up" | "down" }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-3 py-1.5">
      {trend === "up" && <TrendingUp className="h-3 w-3 text-primary" />}
      {trend === "down" && <TrendingDown className="h-3 w-3 text-rose-400" />}
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
      <span className="text-xs font-bold text-white">{value}</span>
    </div>
  );
}

/* ── Custom Candlestick Shape ──────────────────────────────── */
function CandlestickShape(props: any) {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? '#3DDC97' : '#FF6B6B';
  const glowColor = isUp ? 'rgba(61,220,151,0.4)' : 'rgba(255,107,107,0.4)';
  
  // Calculate positions
  const barX = x;
  const barWidth = Math.max(width * 0.6, 6);
  const barOffset = (width - barWidth) / 2;
  const centerX = x + width / 2;
  
  // Y-axis scale: we need to map values to pixels
  // The y and height from recharts Bar represent the body
  const bodyTop = y;
  const bodyHeight = Math.max(height, 2);
  
  return (
    <g>
      {/* Glow behind the candle */}
      <rect 
        x={barX + barOffset - 2} 
        y={bodyTop - 2} 
        width={barWidth + 4} 
        height={bodyHeight + 4} 
        rx={3}
        fill={glowColor}
        filter="url(#candleGlow)"
      />
      {/* Wick (high-low line) */}
      <line 
        x1={centerX} 
        y1={bodyTop - (bodyHeight > 0 ? bodyHeight * 0.3 : 8)} 
        x2={centerX} 
        y2={bodyTop + bodyHeight + (bodyHeight > 0 ? bodyHeight * 0.3 : 8)}
        stroke={color} 
        strokeWidth={1.5} 
        opacity={0.6}
      />
      {/* Body */}
      <rect 
        x={barX + barOffset} 
        y={bodyTop} 
        width={barWidth} 
        height={Math.max(bodyHeight, 3)} 
        rx={2}
        fill={color}
        opacity={0.9}
      />
      {/* Top highlight */}
      <rect 
        x={barX + barOffset} 
        y={bodyTop} 
        width={barWidth} 
        height={2} 
        rx={1}
        fill="white"
        opacity={0.2}
      />
    </g>
  );
}

function ChartsPage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);

  /* ── Data Queries ──────────────────────────────────────── */
  const { data: monthly = [] } = useQuery({
    queryKey: ["charts_monthly", plannerId],
    queryFn: async () => {
      const [{ data: inc }, { data: exp }] = await Promise.all([
        supabase.from("income_entries").select("date, amount").eq("planner_id", plannerId),
        supabase.from("expense_entries").select("date, amount").eq("planner_id", plannerId),
      ]);
      const m = new Map<string, { income: number; expenses: number }>();
      (inc ?? []).forEach((r) => { const k = (r.date ?? "").slice(0, 7); const c = m.get(k) ?? { income: 0, expenses: 0 }; c.income += Number(r.amount); m.set(k, c); });
      (exp ?? []).forEach((r) => { const k = (r.date ?? "").slice(0, 7); const c = m.get(k) ?? { income: 0, expenses: 0 }; c.expenses += Number(r.amount); m.set(k, c); });
      return Array.from(m.entries()).sort().map(([month, v]) => ({ month, ...v, net: v.income - v.expenses }));
    },
  });

  const { data: byCat = [] } = useQuery({
    queryKey: ["charts_bycat", plannerId],
    queryFn: async () => {
      const [{ data: exp }, { data: cats }] = await Promise.all([
        supabase.from("expense_entries").select("category_id, amount").eq("planner_id", plannerId),
        supabase.from("expense_categories").select("id, name, color").eq("planner_id", plannerId),
      ]);
      const map = new Map<string, number>();
      (exp ?? []).forEach((r) => { if (r.category_id) map.set(r.category_id, (map.get(r.category_id) ?? 0) + Number(r.amount)); });
      return (cats ?? []).map((c) => ({ name: c.name, value: map.get(c.id) ?? 0, color: c.color ?? "" })).filter((x) => x.value > 0);
    },
  });

  const { data: byClient = [] } = useQuery({
    queryKey: ["charts_byclient", plannerId],
    queryFn: async () => {
      const [{ data: inc }, { data: clients }] = await Promise.all([
        supabase.from("income_entries").select("client_id, amount").eq("planner_id", plannerId),
        supabase.from("clients").select("id, name").eq("planner_id", plannerId),
      ]);
      const clientMap = new Map<string, string>();
      (clients ?? []).forEach((c) => clientMap.set(c.id, c.name));
      const map = new Map<string, number>();
      (inc ?? []).forEach((r) => {
        const name = (r.client_id && clientMap.get(r.client_id)) || "Unknown";
        map.set(name, (map.get(name) ?? 0) + Number(r.amount));
      });
      return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
    },
  });

  /* ── Derived Data ──────────────────────────────────────── */
  const totalIncome = monthly.reduce((acc, m) => acc + m.income, 0);
  const totalExpenses = monthly.reduce((acc, m) => acc + m.expenses, 0);
  const totalExpensesByCat = byCat.reduce((acc, curr) => acc + curr.value, 0);

  const radarData = monthly.slice(-6).map(m => ({
    month: m.month.slice(5),
    Income: m.income,
    Expenses: m.expenses,
  }));

  const monthlyWithCumulative = monthly.reduce((acc: any[], m, i) => {
    const prevCum = i > 0 ? acc[i - 1].cumulative : 0;
    acc.push({ ...m, cumulative: prevCum + m.net });
    return acc;
  }, []);

  // Candlestick data: treat each month as a candle
  // Open = expenses, Close = income, High = max(income, expenses) * 1.1, Low = min * 0.9
  const candlestickData = monthly.map(m => {
    const open = m.expenses;
    const close = m.income;
    const high = Math.max(open, close) * 1.15;
    const low = Math.min(open, close) * 0.85;
    const body = Math.abs(close - open);
    return {
      month: m.month.slice(5),
      fullMonth: m.month,
      open, close, high, low,
      body,
      isUp: close >= open,
    };
  });

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ── Header ──────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          Advanced Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Deep analytical views of your financial data.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <StatPill label="Income" value={formatMoney(totalIncome, currency, true)} trend="up" />
          <StatPill label="Expenses" value={formatMoney(totalExpenses, currency, true)} trend="down" />
          <StatPill label="Net" value={formatMoney(totalIncome - totalExpenses, currency, true)} trend={totalIncome >= totalExpenses ? "up" : "down"} />
        </div>
      </div>

      {/* ── SVG Defs (shared gradients & filters) ────── */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="chartGradIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3DDC97" stopOpacity={1}/>
            <stop offset="100%" stopColor="#3DDC97" stopOpacity={0.15}/>
          </linearGradient>
          <linearGradient id="chartGradExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B6B" stopOpacity={1}/>
            <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0.15}/>
          </linearGradient>
          <linearGradient id="chartAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3DDC97" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3DDC97" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="chartGradNet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.35}/>
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
          </linearGradient>
          <filter id="chartGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="candleGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6">

        {/* ─────── 1. Cashflow Lines ──────────────────── */}
        <ChartCard 
          title="Cashflow Overview" 
          subtitle="Cash Inflows · Cash Outflows · Net Cashflow" 
          icon={Activity}
          className="xl:col-span-2"
        >
          <div className="h-[300px] md:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="cashflowInFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3DDC97" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3DDC97" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="cashflowOutFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  fontWeight={600}
                  axisLine={false} 
                  tickLine={false} 
                  dy={10} 
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  dx={-5} 
                  tickFormatter={(v) => formatCompact(v)}
                />
                <Tooltip content={<ChartTooltip currency={currency} />} />
                <Area 
                  type="monotone" 
                  name="Cash Inflows"
                  dataKey="income" 
                  stroke="#3DDC97" 
                  strokeWidth={2.5} 
                  fillOpacity={1}
                  fill="url(#cashflowInFill)"
                  filter="url(#chartGlow)"
                  dot={{ r: 4, fill: '#3DDC97', stroke: '#0e1211', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#3DDC97', stroke: '#0e1211', strokeWidth: 3 }}
                />
                <Area 
                  type="monotone" 
                  name="Cash Outflows"
                  dataKey="expenses" 
                  stroke="#FF6B6B" 
                  strokeWidth={2.5} 
                  fillOpacity={1}
                  fill="url(#cashflowOutFill)"
                  dot={{ r: 4, fill: '#FF6B6B', stroke: '#0e1211', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#FF6B6B', stroke: '#0e1211', strokeWidth: 3 }}
                />
                <Area 
                  type="monotone" 
                  name="Net Cashflow"
                  dataKey="net" 
                  stroke="#00E5FF" 
                  strokeWidth={2} 
                  strokeDasharray="8 4"
                  fillOpacity={0}
                  fill="transparent"
                  dot={false}
                  activeDot={{ r: 5, fill: '#00E5FF', stroke: '#0e1211', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* ─────── 2. Candlestick Chart ────────────────── */}
        <ChartCard 
          title="Income vs Expenses" 
          subtitle="Candlestick · Green = income > expenses, Red = expenses > income" 
          icon={CandlestickChart}
          className="xl:col-span-2"
        >
          <div className="h-[320px] md:h-[380px]">
            {candlestickData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Not enough data for candlestick view</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={candlestickData} margin={{ top: 20, right: 10, left: -15, bottom: 0 }} barCategoryGap="15%">
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    fontWeight={600}
                    axisLine={false} 
                    tickLine={false} 
                    dy={10} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.15)" 
                    fontSize={10} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-5} 
                    tickFormatter={(v) => formatCompact(v)}
                  />
                  <Tooltip content={<CandlestickTooltip currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                  <Bar 
                    dataKey="body" 
                    shape={<CandlestickShape />}
                    maxBarSize={32}
                  >
                    {candlestickData.map((entry, i) => (
                      <Cell key={i} fill={entry.isUp ? '#3DDC97' : '#FF6B6B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        {/* ─────── 3. Expense Breakdown Donut ──────────── */}
        <ChartCard 
          title="Expense Breakdown" 
          subtitle="Category distribution" 
          icon={PieIcon}
        >
          <div className="h-[320px] md:h-[360px] relative" style={{ zIndex: 1 }}>
            {byCat.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <PieIcon className="h-10 w-10 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No expense data yet</p>
                </div>
              </div>
            ) : (
              <>
                {/* Center Stat */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 5 }}>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1">Total</span>
                    <span className="text-2xl md:text-[28px] font-display font-bold text-white tracking-tight">
                      {formatMoney(totalExpensesByCat, currency, true)}
                    </span>
                  </div>
                </div>
                <div className="relative w-full h-full" style={{ zIndex: 10 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="pieGlowCharts" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="5" result="blur"/>
                          <feMerge>
                            <feMergeNode in="blur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie
                        data={byCat}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="60%"
                        outerRadius="80%"
                        paddingAngle={6}
                        cornerRadius={12}
                        stroke="none"
                        filter="url(#pieGlowCharts)"
                        label={renderDonutLabel}
                        labelLine={false}
                      >
                        {byCat.map((entry, i) => (
                          <Cell key={i} fill={entry.color || PALETTE[i % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip currency={currency} total={totalExpensesByCat} />} wrapperStyle={{ zIndex: 9999 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
          {/* Category Legend */}
          {byCat.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 px-1">
              {byCat.slice(0, 8).map((cat, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || PALETTE[i % PALETTE.length] }} />
                  <span className="text-[10px] text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* ─────── 4. Income Trend Area Chart ─────────── */}
        <ChartCard 
          title="Income Trend" 
          subtitle="Monthly income flow with area fill" 
          icon={TrendingUp}
        >
          <div className="h-[300px] md:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  fontWeight={600}
                  axisLine={false} 
                  tickLine={false} 
                  dy={10} 
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  dx={-5} 
                  tickFormatter={(v) => formatCompact(v)}
                />
                <Tooltip content={<ChartTooltip currency={currency} />} />
                <Area 
                  type="monotone" 
                  name="Income"
                  dataKey="income" 
                  stroke="#3DDC97" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#chartAreaFill)" 
                  filter="url(#chartGlow)" 
                  activeDot={{ r: 6, fill: '#3DDC97', stroke: '#0e1211', strokeWidth: 3 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* ─────── 5. Cashflow Radar ──────────────────── */}
        <ChartCard 
          title="Cashflow Velocity" 
          subtitle="6-month radar spread · Income vs Expenses" 
          icon={Activity}
        >
          <div className="h-[300px] md:h-[340px]">
            {radarData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Not enough data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis 
                    dataKey="month" 
                    tick={{ fill: '#3DDC97', fontSize: 11, fontWeight: 700 }} 
                  />
                  <Radar 
                    name="Income" 
                    dataKey="Income" 
                    stroke="#3DDC97" 
                    strokeWidth={2.5} 
                    fill="#3DDC97" 
                    fillOpacity={0.12} 
                    filter="url(#chartGlow)"
                    dot={{ r: 4, fill: '#3DDC97', stroke: '#0e1211', strokeWidth: 2 }}
                  />
                  <Radar 
                    name="Expenses" 
                    dataKey="Expenses" 
                    stroke="#FF6B6B" 
                    strokeWidth={2.5} 
                    fill="#FF6B6B" 
                    fillOpacity={0.08}
                    dot={{ r: 4, fill: '#FF6B6B', stroke: '#0e1211', strokeWidth: 2 }}
                  />
                  <Tooltip content={<ChartTooltip currency={currency} />} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        {/* ─────── 6. Cumulative Net Flow ─────────────── */}
        <ChartCard 
          title="Cumulative Net Flow" 
          subtitle="Running total of profit over time" 
          icon={Layers}
        >
          <div className="h-[300px] md:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyWithCumulative} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  fontWeight={600}
                  axisLine={false} 
                  tickLine={false} 
                  dy={10} 
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  dx={-5} 
                  tickFormatter={(v) => formatCompact(v)}
                />
                <Tooltip content={<ChartTooltip currency={currency} />} />
                <Area 
                  type="monotone" 
                  name="Cumulative"
                  dataKey="cumulative" 
                  stroke="#7C3AED" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#chartGradNet)" 
                  filter="url(#chartGlow)"
                  activeDot={{ r: 6, fill: '#7C3AED', stroke: '#0e1211', strokeWidth: 3 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* ─────── 7. Top Clients Revenue (FULL WIDTH) ── */}
        <ChartCard 
          title="Top Clients" 
          subtitle="Revenue by client · horizontal breakdown" 
          icon={Users}
          className="xl:col-span-2"
        >
          <div className="h-[300px] md:h-[340px]">
            {byClient.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No client data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byClient} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={10} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => formatCompact(v)}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={11} 
                    fontWeight={600}
                    axisLine={false} 
                    tickLine={false} 
                    width={100}
                    tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + '…' : v}
                  />
                  <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: 'rgba(61,220,151,0.04)', radius: 4 }} />
                  <Bar name="Revenue" dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={24} filter="url(#chartGlow)">
                    {byClient.map((_entry, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        {/* ─────── 8. Monthly Profit Line Chart ────────── */}
        <ChartCard 
          title="Monthly Profit" 
          subtitle="Income minus Expenses per month" 
          icon={Activity}
          className="xl:col-span-2"
        >
          <div className="h-[280px] md:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  fontWeight={600}
                  axisLine={false} 
                  tickLine={false} 
                  dy={10} 
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  dx={-5} 
                  tickFormatter={(v) => formatCompact(v)}
                />
                <Tooltip content={<ChartTooltip currency={currency} />} />
                <Line 
                  name="Income"
                  type="monotone" 
                  dataKey="income" 
                  stroke="#3DDC97" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#3DDC97', stroke: '#0e1211', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#3DDC97', stroke: '#0e1211', strokeWidth: 3 }}
                  filter="url(#chartGlow)"
                />
                <Line 
                  name="Expenses"
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#FF6B6B" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#FF6B6B', stroke: '#0e1211', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#FF6B6B', stroke: '#0e1211', strokeWidth: 3 }}
                />
                <Line 
                  name="Net Profit"
                  type="monotone" 
                  dataKey="net" 
                  stroke="#00E5FF" 
                  strokeWidth={2} 
                  strokeDasharray="6 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

      </div>
    </div>
  );
}
