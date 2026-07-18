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
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3DDC97" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3DDC97" stopOpacity={0} />
                </linearGradient>
                <filter id="glowCashflow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => formatMoney(val, currency)} />
              <Tooltip 
                formatter={(val: number) => formatMoney(val, currency)}
                contentStyle={{ backgroundColor: "rgba(10, 16, 16, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", color: "white" }} 
                itemStyle={{ color: "white", fontWeight: 500, padding: "2px 0" }}
                labelStyle={{ color: "rgba(255,255,255,0.4)", marginBottom: "4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
              />
              <Area type="natural" dataKey="running" stroke="#3DDC97" fill="url(#g1)" strokeWidth={3} filter="url(#glowCashflow)" activeDot={{ r: 5, strokeWidth: 2, fill: "#0a1010", stroke: "#3DDC97" }} />
            </AreaChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/5 ${accent ? "bg-card" : "bg-card/40"} p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-card/60 hover:border-white/10 hover:shadow-xl`}>
      {accent && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-primary/50 pointer-events-none [mask-image:linear-gradient(to_bottom_right,black_0%,transparent_60%)]" />
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/40 blur-[40px] rounded-full pointer-events-none" />
        </>
      )}
      <div className={`text-xs uppercase tracking-wider relative z-10 ${accent ? "text-primary/80 font-medium" : "text-muted-foreground"}`}>{label}</div>
      <div className={`mt-2 font-display text-3xl truncate relative z-10 ${accent ? "text-white" : ""}`} title={value}>{value}</div>
    </div>
  );
}
