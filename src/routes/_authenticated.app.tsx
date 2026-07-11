import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app")({
  loader: async ({ location }) => {
    if (location.pathname === "/app" || location.pathname === "/app/") {
      const { data: planners, error } = await supabase
        .from("planners")
        .select("id, is_default, created_at")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(1);

      if (error) {
        console.error("Error fetching planners:", error);
      }

      const first = planners?.[0];
      if (first) {
        throw redirect({ to: "/app/p/$plannerId/dashboard", params: { plannerId: first.id } });
      }
    }
    return null;
  },
  component: () => {
    const router = useRouter();
    const pathname = router.state.location.pathname;
    const isRoot = pathname === "/app" || pathname === "/app/";
    
    if (isRoot) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
          <h1 className="text-2xl font-bold mb-4">No Planner Found</h1>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            It looks like your account doesn't have a default planner. This usually happens if you signed up before running the Supabase SQL migrations, or if the database trigger failed.
          </p>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={async () => {
              const { data: user } = await supabase.auth.getUser();
              if (user.user) {
                await supabase.from("planners").insert({ user_id: user.user.id, name: "Personal", is_default: true });
                window.location.reload();
              }
            }}
          >
            Fix: Create Default Planner
          </button>
        </div>
      );
    }

    return <Outlet />;
  },
});
