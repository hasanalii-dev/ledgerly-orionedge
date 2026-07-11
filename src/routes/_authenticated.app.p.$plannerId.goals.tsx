import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput } from "@/components/editable-table";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/goals")({
  component: GoalsPage,
});

type Row = { id: string; name: string; target_amount: number; saved_amount: number; deadline: string | null; currency: string; emoji: string | null };

function GoalsPage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState("");
  const currency = usePlannerCurrency(plannerId);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? "")); }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["goals", plannerId],
    queryFn: async () => ((await supabase.from("goals").select("*").eq("planner_id", plannerId).order("created_at")).data ?? []) as unknown as Row[],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Goals</h1>
        <p className="text-sm text-muted-foreground">Milestones for savings, revenue, or anything else.</p>
      </div>
      {rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map((g) => {
            const pct = Math.min(100, Math.round((Number(g.saved_amount) / Math.max(1, Number(g.target_amount))) * 100));
            return (
              <div key={g.id} className="rounded-2xl border border-hairline bg-card p-4">
                <div className="text-sm font-medium">{g.emoji ?? "🎯"} {g.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">Due {g.deadline ?? "—"}</div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div className="font-display text-2xl text-primary">{formatMoney(g.saved_amount, g.currency)}</div>
                  <div className="text-xs text-muted-foreground">of {formatMoney(g.target_amount, g.currency)}</div>
                </div>
                <Progress value={pct} className="mt-3 h-1.5" />
                <div className="mt-1 text-xs text-primary">{pct}%</div>
              </div>
            );
          })}
        </div>
      )}
      <EditableTable<Row>
        table="goals"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["goals", plannerId]]}
        onNewRow={() => ({ name: "New goal", target_amount: 1000, saved_amount: 0, currency })}
        columns={[
          { key: "emoji", label: "", width: "60px", render: (r, on) => <CellInput value={r.emoji ?? ""} onChange={(v) => on({ emoji: v })} className="text-center" /> },
          { key: "name", label: "Goal", render: (r, on) => <CellInput value={r.name ?? ""} onChange={(v) => on({ name: v })} /> },
          { key: "target_amount", label: "Target", width: "140px", render: (r, on) => <CellInput type="number" value={String(r.target_amount ?? 0)} onChange={(v) => on({ target_amount: parseFloat(v) || 0 })} className="text-right font-mono" /> },
          { key: "saved_amount", label: "Saved", width: "140px", render: (r, on) => <CellInput type="number" value={String(r.saved_amount ?? 0)} onChange={(v) => on({ saved_amount: parseFloat(v) || 0 })} className="text-right font-mono" /> },
          { key: "currency", label: "CCY", width: "80px", render: (r, on) => <CellInput value={r.currency ?? currency} onChange={(v) => on({ currency: v.toUpperCase() })} className="uppercase" /> },
          { key: "deadline", label: "Deadline", width: "140px", render: (r, on) => <CellInput type="date" value={r.deadline ?? ""} onChange={(v) => on({ deadline: v || null })} /> },
        ]}
      />
    </div>
  );
}
