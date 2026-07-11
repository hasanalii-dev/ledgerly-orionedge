import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/timeline")({
  component: TimelinePage,
});

type Event = { id: string; kind: string; summary: string; created_at: string };

function TimelinePage() {
  const { plannerId } = Route.useParams();
  const { data = [] } = useQuery({
    queryKey: ["timeline", plannerId],
    queryFn: async () => (await supabase.from("activity_events").select("id, kind, summary, created_at").eq("planner_id", plannerId).order("created_at", { ascending: false }).limit(200)).data as Event[] ?? [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Timeline</h1>
        <p className="text-sm text-muted-foreground">Everything that's happened in this planner.</p>
      </div>
      <div className="rounded-2xl border border-hairline bg-card p-6">
        {data.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-3 opacity-40" />No activity yet.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-hairline" />
            {data.map((e) => (
              <div key={e.id} className="relative pl-10 py-3 border-b border-hairline last:border-0">
                <div className="absolute left-2 top-4 h-2 w-2 rounded-full bg-primary" />
                <div className="text-sm">{e.summary}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{formatDate(e.created_at)} · {e.kind}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
