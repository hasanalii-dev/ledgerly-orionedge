import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/budget")({
  component: BudgetPage,
});

type Budget = { id: string; category_id: string | null; amount: number };

function BudgetPage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);
  const month = new Date().toISOString().slice(0, 7) + "-01";

  const { data: categories = [], refetch } = useQuery({
    queryKey: ["expense_categories", plannerId],
    queryFn: async () => (await supabase.from("expense_categories").select("id, name, color").eq("planner_id", plannerId).order("name")).data ?? [],
  });
  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets", plannerId, month],
    queryFn: async () => ((await supabase.from("budgets").select("*").eq("planner_id", plannerId).eq("month", month)).data ?? []) as unknown as Budget[],
  });
  const { data: spend = [] } = useQuery({
    queryKey: ["budget_spend", plannerId, month],
    queryFn: async () => {
      const start = month; const end = new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 1).toISOString().slice(0, 10);
      const { data } = await supabase.from("expense_entries").select("category_id, amount").eq("planner_id", plannerId).gte("date", start).lt("date", end);
      const map = new Map<string, number>();
      (data ?? []).forEach((r) => { if (r.category_id) map.set(r.category_id, (map.get(r.category_id) ?? 0) + Number(r.amount)); });
      return Array.from(map.entries());
    },
  });
  const spendMap = new Map(spend);
  const bMap = new Map(budgets.map((b) => [b.category_id, b] as const));

  async function setBudget(category_id: string, amount: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const existing = bMap.get(category_id);
    if (existing) {
      const { error } = await supabase.from("budgets").update({ amount }).eq("id", existing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("budgets").insert({ planner_id: plannerId, user_id: user.id, category_id, amount, month });
      if (error) return toast.error(error.message);
    }
    refetch();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Budget</h1>
        <p className="text-sm text-muted-foreground">Set monthly caps by category. Live spend tracked.</p>
      </div>
      <div className="rounded-2xl border border-hairline bg-card">
        <div className="grid grid-cols-[1fr_140px_140px_1fr] px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-hairline">
          <div>Category</div><div className="text-right">Budget</div><div className="text-right">Spent</div><div className="pl-6">Progress</div>
        </div>
        {categories.map((c) => {
          const b = bMap.get(c.id);
          const spent = spendMap.get(c.id) ?? 0;
          const budget = Number(b?.amount ?? 0);
          const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
          const over = budget > 0 && spent > budget;
          return (
            <div key={c.id} className="grid grid-cols-[1fr_140px_140px_1fr] px-4 py-3 items-center border-b border-hairline last:border-0">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: c.color ?? "#666" }} />{c.name}</div>
              <Input type="number" defaultValue={budget || ""} onBlur={(e) => setBudget(c.id, parseFloat(e.target.value) || 0)} className="text-right font-mono h-9 bg-background border-hairline" />
              <div className={`text-right font-mono ${over ? "text-destructive" : ""}`}>{formatMoney(spent, currency)}</div>
              <div className="pl-6 flex items-center gap-3">
                <Progress value={pct} className="h-1.5 flex-1" />
                <div className={`text-xs w-10 text-right ${over ? "text-destructive" : "text-muted-foreground"}`}>{pct}%</div>
              </div>
            </div>
          );
        })}
        {categories.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No categories yet.</div>}
      </div>
    </div>
  );
}
