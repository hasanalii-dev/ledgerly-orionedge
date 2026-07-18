import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { formatMoney } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
export const Route = createFileRoute("/_authenticated/app/p/$plannerId/charts")({
  component: ChartsPage,
});

const COLORS = ["#3DDC97", "#7CC4FF", "#FFB86B", "#B794F4", "#F687B3", "#68D391", "#F6AD55", "#4FD1C5"];

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Charts</h1>
        <p className="text-sm text-muted-foreground">See the shape of your finances.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-hairline bg-card p-6 h-[380px]">
          <div className="text-sm font-medium mb-4">Income vs Expenses</div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <filter id="glowBar" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => formatMoney(val, currency)} />
                <Tooltip 
                  formatter={(val: number) => formatMoney(val, currency)}
                  contentStyle={{ backgroundColor: "rgba(3, 8, 8, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", color: "white" }} 
                  itemStyle={{ color: "white", fontWeight: 500, padding: "2px 0" }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: "4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="income" fill="#3DDC97" radius={[6, 6, 0, 0]} filter="url(#glowBar)" />
                <Bar dataKey="expenses" fill="#F56565" radius={[6, 6, 0, 0]} filter="url(#glowBar)" />
              </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-hairline bg-card p-6 h-[380px]">
          <div className="text-sm font-medium mb-4">Expenses by category</div>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <defs>
                  <filter id="pieGlowCharts" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {byCat.map((c, i) => {
                    const color = c.color || COLORS[i % COLORS.length];
                    return (
                      <linearGradient key={`gradient-charts-${i}`} id={`pieGradientCharts-${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <Pie data={byCat} dataKey="value" nameKey="name" outerRadius={110} innerRadius={70} paddingAngle={4} stroke="rgba(0,0,0,0.2)" strokeWidth={2} filter="url(#pieGlowCharts)">
                  {byCat.map((c, i) => <Cell key={c.name} fill={`url(#pieGradientCharts-${i})`} />)}
                </Pie>
                <Tooltip 
                  formatter={(val: number, name: string) => {
                    const total = byCat.reduce((acc, curr) => acc + curr.value, 0);
                    const percent = total > 0 ? `(${(val / total * 100).toFixed(1)}%)` : '';
                    return [`${formatMoney(val, currency)} ${percent}`, name];
                  }}
                  contentStyle={{ backgroundColor: "rgba(3, 8, 8, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", color: "white" }} 
                  itemStyle={{ color: "white", fontWeight: 500, padding: "2px 0" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, opacity: 0.8, paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
