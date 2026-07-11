import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/charts")({
  component: ChartsPage,
});

const COLORS = ["#3DDC97", "#7CC4FF", "#FFB86B", "#B794F4", "#F687B3", "#68D391", "#F6AD55", "#4FD1C5"];

function ChartsPage() {
  const { plannerId } = Route.useParams();
  const { data: monthly = [] } = useQuery({
    queryKey: ["charts_monthly", plannerId],
    queryFn: async () => {
      const [{ data: inc }, { data: exp }] = await Promise.all([
        supabase.from("income_entries").select("date, amount").eq("planner_id", plannerId),
        supabase.from("expense_entries").select("date, amount").eq("planner_id", plannerId),
      ]);
      const m = new Map<string, { income: number; expenses: number }>();
      (inc ?? []).forEach((r: { date: string; amount: number }) => { const k = r.date.slice(0, 7); const c = m.get(k) ?? { income: 0, expenses: 0 }; c.income += Number(r.amount); m.set(k, c); });
      (exp ?? []).forEach((r: { date: string; amount: number }) => { const k = r.date.slice(0, 7); const c = m.get(k) ?? { income: 0, expenses: 0 }; c.expenses += Number(r.amount); m.set(k, c); });
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
      (exp ?? []).forEach((r: { category_id: string | null; amount: number }) => { if (r.category_id) map.set(r.category_id, (map.get(r.category_id) ?? 0) + Number(r.amount)); });
      return (cats ?? []).map((c: { id: string; name: string; color: string }) => ({ name: c.name, value: map.get(c.id) ?? 0, color: c.color })).filter((x) => x.value > 0);
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
            <BarChart data={monthly}>
              <CartesianGrid stroke="oklch(1 0 0 / 8%)" vertical={false} />
              <XAxis dataKey="month" stroke="oklch(0.6 0 0)" fontSize={11} />
              <YAxis stroke="oklch(0.6 0 0)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.2 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 10 }} />
              <Bar dataKey="income" fill="oklch(0.75 0.16 158)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" fill="oklch(0.65 0.02 260)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-hairline bg-card p-6 h-[380px]">
          <div className="text-sm font-medium mb-4">Expenses by category</div>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={byCat} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60} paddingAngle={2}>
                {byCat.map((c, i) => <Cell key={c.name} fill={c.color ?? COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.2 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 10 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
