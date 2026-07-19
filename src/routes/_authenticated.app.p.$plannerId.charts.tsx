import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  FunnelChart, Funnel, AreaChart, Area
} from "recharts";
import { formatMoney } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
export const Route = createFileRoute("/_authenticated/app/p/$plannerId/charts")({
  component: ChartsPage,
});

const COLORS = ["#3DDC97", "#00E5FF", "#00F0B5", "#FFD166", "#14B8A6", "#10B981", "#06B6D4", "#FBBF24"];

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

function ChartsPage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);
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
      return Array.from(m.entries()).sort().map(([month, v]) => ({ month, ...v }));
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

  const totalExpenses = byCat.reduce((acc, curr) => acc + curr.value, 0);

  const radarData = monthly.slice(-6).map(m => ({
    subject: m.month,
    Income: m.income,
    Expenses: m.expenses,
    fullMark: Math.max(m.income, m.expenses) * 1.2 || 1000
  }));

  const candlestickData = monthly.map(m => {
    const min = Math.min(m.income, m.expenses);
    const max = Math.max(m.income, m.expenses);
    return {
      month: m.month,
      range: [min, max],
      isIncomeHigher: m.income >= m.expenses
    };
  });

  const funnelData = [...byCat].sort((a, b) => b.value - a.value).slice(0, 6);

  return (
    <div className="space-y-6">
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="neonGlowGreen" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neonGlowYellow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="universalGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="areaGradientGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3DDC97" stopOpacity={0.5}/>
            <stop offset="95%" stopColor="#3DDC97" stopOpacity={0}/>
          </linearGradient>
        </defs>
      </svg>

      <div>
        <h1 className="font-display text-3xl">Advanced Reports</h1>
        <p className="text-sm text-muted-foreground">Deep analytical views of your financial data.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Radar Chart */}
        <div className="rounded-2xl border border-white/5 bg-[#111312] p-6 h-[420px] relative overflow-hidden">
          <div className="text-sm font-medium mb-1 text-white">Cashflow Velocity</div>
          <p className="text-xs text-muted-foreground mb-4">6-Month spread of Income vs Expenses</p>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#3DDC97', fontSize: 11, fontWeight: 'bold' }} />
              <Radar name="Income" dataKey="Income" stroke="#3DDC97" strokeWidth={3} fill="#3DDC97" fillOpacity={0.15} filter="url(#neonGlowGreen)" />
              <Radar name="Expenses" dataKey="Expenses" stroke="#FFD166" strokeWidth={3} fill="#FFD166" fillOpacity={0.15} filter="url(#neonGlowYellow)" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#111312", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} 
                itemStyle={{ fontWeight: 600 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Candlestick / Waterfall Chart */}
        <div className="rounded-2xl border border-white/5 bg-[#111312] p-6 h-[420px]">
          <div className="text-sm font-medium mb-1 text-white">Cashflow Variance (Waterfall)</div>
          <p className="text-xs text-muted-foreground mb-4">Floating range between monthly income and expenses</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={candlestickData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => formatMoney(val, currency)} />
              <Tooltip 
                formatter={(val: [number, number]) => `${formatMoney(val[0], currency)} - ${formatMoney(val[1], currency)}`}
                contentStyle={{ backgroundColor: "#111312", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Bar dataKey="range" radius={20} filter="url(#universalGlow)">
                {candlestickData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isIncomeHigher ? '#3DDC97' : '#FFD166'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Line Chart */}
        <div className="rounded-2xl border border-white/5 bg-[#111312] p-6 h-[420px]">
          <div className="text-sm font-medium mb-1 text-white">Income Trend</div>
          <p className="text-xs text-muted-foreground mb-4">Area piece line chart</p>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={monthly} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => formatMoney(val, currency)} />
              <Tooltip 
                formatter={(val: number) => formatMoney(val, currency)}
                contentStyle={{ backgroundColor: "#111312", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} 
                itemStyle={{ color: "#3DDC97", fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#3DDC97" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#areaGradientGreen)" 
                filter="url(#neonGlowGreen)" 
                activeDot={{ r: 8, fill: '#3DDC97', stroke: '#111312', strokeWidth: 2 }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel Chart */}
        <div className="rounded-2xl border border-white/5 bg-[#111312] p-6 h-[420px]">
          <div className="text-sm font-medium mb-1 text-white">Top Expenses Funnel</div>
          <p className="text-xs text-muted-foreground mb-4">Flow distribution of major category allocations</p>
          <ResponsiveContainer width="100%" height="90%">
            <FunnelChart>
              <Tooltip 
                formatter={(val: number) => formatMoney(val, currency)}
                contentStyle={{ backgroundColor: "#111312", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} 
              />
              <Funnel 
                dataKey="value" 
                data={funnelData} 
                isAnimationActive 
                filter="url(#universalGlow)"
              >
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
