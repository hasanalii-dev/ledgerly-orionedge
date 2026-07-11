import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app")({
  loader: async ({ location }) => {
    // If the user hits /app directly, forward them to their first planner's dashboard.
    if (location.pathname === "/app" || location.pathname === "/app/") {
      const { data: planners } = await supabase
        .from("planners")
        .select("id, is_default, created_at")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(1);
      const first = planners?.[0];
      if (first) throw redirect({ to: "/app/p/$plannerId/dashboard", params: { plannerId: first.id } });
    }
    return null;
  },
  component: () => <Outlet />,
});
