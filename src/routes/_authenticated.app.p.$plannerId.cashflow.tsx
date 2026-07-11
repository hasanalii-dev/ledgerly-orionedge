import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatMoney } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/cashflow")({
  component: CashflowPage,
});

function CashflowPage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);
  const { data = [] } = useQuery({
    queryKey: ["cashflow", plannerId],
    queryFn: async () => {
      const [{ data: inc }, { data: exp }] = await Promise.all([
        supabase.from("income_entries").select("date, amount").eq("planner_id", plannerId),
        supabase.from("expense_entries").select("date, amount").eq("planner_id", plannerId),
      ]);
      const byMonth = new Map<string, { income: number; expenses: number }>();
      (inc ?? []).forEach((r: { date: string; amount: number }) => {
        const k = (r.date ?? "").slice(0, 7);
        const cur = byMonth.get(k) ?? { income: 0, expenses: 0 };
        cur.income += Number(r.amount);
        byMonth.set(k, cur);
      });
      (exp ?? []).forEach((r: { date: string; amount: number }) => {
        const k = (r.date ?? "").slice(0, 7);
        const cur = byMonth.get(k) ?? { income: 0, expenses: 0 };
        cur.expenses += Number(r.amount);
        byMonth.set(k, cur);
      });
      let running = 0;
      return Array.from(byMonth.entries()).sort().map(([month, v]) => {
        running += v.income - v.expenses;
        return { month, income: v.income, expenses: v.expenses, net: v.income - v.expenses, running };
      });
    },
  });

  const totalNet = data.reduce((s, r) => s + r.net, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Cash Flow</h1>
        <p className="text-sm text-muted-foreground">Monthly income vs expenses and running balance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Net" value={formatMoney(totalNet, currency)} accent />
        <StatCard label="Best Month" value={formatMoney(Math.max(0, ...data.map((d) => d.net)), currency)} />
        <StatCard label="Months tracked" value={String(data.length)} />
      </div>
      <div className="rounded-2xl border border-hairline bg-card p-6 h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.75 0.16 158)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.75 0.16 158)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(1 0 0 / 8%)" vertical={false} />
            <XAxis dataKey="month" stroke="oklch(0.6 0 0)" fontSize={11} />
            <YAxis stroke="oklch(0.6 0 0)" fontSize={11} tickFormatter={(val) => formatMoney(val, currency)} />
            <Tooltip 
              formatter={(val: number) => formatMoney(val, currency)}
              contentStyle={{ background: "oklch(0.2 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 10, color: "white" }} 
              itemStyle={{ color: "white" }}
            />
            <Area type="monotone" dataKey="running" stroke="oklch(0.75 0.16 158)" fill="url(#g1)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-hairline bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl truncate ${accent ? "text-primary" : ""}`} title={value}>{value}</div>
    </div>
  );
}
