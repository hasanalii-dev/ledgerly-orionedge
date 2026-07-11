import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/")({
  loader: async () => {
    const { data: planners } = await supabase
      .from("planners")
      .select("id, is_default, created_at")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1);
    const first = planners?.[0];
    if (!first) throw redirect({ to: "/app/setup" });
    throw redirect({ to: "/app/p/$plannerId/dashboard", params: { plannerId: first.id } });
  },
});
