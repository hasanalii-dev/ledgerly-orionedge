import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/budget")({
  component: BudgetPage,
});

type Budget = { id: string; category_id: string | null; amount: number; is_completed: boolean };

function BudgetPage() {
  const { plannerId } = Route.useParams();
  const qc = useQueryClient();
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
    qc.invalidateQueries({ queryKey: ["budgets", plannerId, month] });
  }

  async function toggleDone(category_id: string, current_status: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const existing = bMap.get(category_id);
    if (existing) {
      const { error } = await supabase.from("budgets").update({ is_completed: !current_status }).eq("id", existing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("budgets").insert({ 
        planner_id: plannerId, 
        user_id: user.id, 
        category_id, 
        amount: 0, 
        month,
        is_completed: !current_status 
      });
      if (error) return toast.error(error.message);
    }
    qc.invalidateQueries({ queryKey: ["budgets", plannerId, month] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Budget</h1>
        <p className="text-sm text-muted-foreground">Set monthly caps by category. Live spend tracked.</p>
      </div>
      <div className="rounded-2xl border border-hairline bg-card overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[40px_1fr_140px_140px_1fr] px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-hairline">
            <div className="flex items-center justify-center">Done</div><div>Category</div><div className="text-right">Budget</div><div className="text-right">Spent</div><div className="pl-6">Progress</div>
          </div>
          {categories.map((c) => {
            const b = bMap.get(c.id);
            const spent = spendMap.get(c.id) ?? 0;
            const budget = Number(b?.amount ?? 0);
            const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
            const over = budget > 0 && spent > budget;
            const isCompleted = b?.is_completed ?? false;
            return (
              <div key={c.id} className={`grid grid-cols-[40px_1fr_140px_140px_1fr] px-4 py-3 items-center border-b border-hairline last:border-0 transition-opacity ${isCompleted ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex items-center justify-center">
                  <Checkbox checked={isCompleted} onCheckedChange={() => toggleDone(c.id, isCompleted)} className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-[#030808]" />
                </div>
                <div className={`flex items-center gap-2 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color ?? "#666" }} />{c.name}
                </div>
                <Input type="number" defaultValue={budget || ""} onBlur={(e) => setBudget(c.id, parseFloat(e.target.value) || 0)} className="text-right font-mono h-9 bg-background border-hairline" disabled={isCompleted} />
                <div className={`text-right font-mono ${over && !isCompleted ? "text-destructive" : ""}`}>{formatMoney(spent, currency)}</div>
                <div className="pl-6 flex items-center gap-3">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <div className={`text-xs w-10 text-right ${over && !isCompleted ? "text-destructive" : "text-muted-foreground"}`}>{pct}%</div>
                </div>
              </div>
            );
          })}
          {categories.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No categories yet.</div>}
        </div>
      </div>
    </div>
  );
}
