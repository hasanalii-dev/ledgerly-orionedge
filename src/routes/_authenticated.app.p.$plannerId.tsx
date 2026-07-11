import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_FOLDERS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId")({
  component: PlannerLayout,
});

function PlannerLayout() {
  const { plannerId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Validate planner exists and is owned by user
  const { data: planner, isError, isLoading } = useQuery({
    queryKey: ["planner", plannerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("planners").select("*").eq("id", plannerId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Seed default categories + folders on first load per planner
  useEffect(() => {
    if (!planner) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count: catCount } = await supabase
        .from("expense_categories")
        .select("id", { count: "exact", head: true })
        .eq("planner_id", planner.id);
      if ((catCount ?? 0) === 0) {
        await supabase.from("expense_categories").insert(
          DEFAULT_EXPENSE_CATEGORIES.map((c) => ({ user_id: user.id, planner_id: planner.id, name: c.name, color: c.color })),
        );
        qc.invalidateQueries({ queryKey: ["expense_categories", planner.id] });
      }
      const { count: fCount } = await supabase
        .from("doc_folders")
        .select("id", { count: "exact", head: true })
        .eq("planner_id", planner.id);
      if ((fCount ?? 0) === 0) {
        await supabase.from("doc_folders").insert(
          DEFAULT_FOLDERS.map((f) => ({ user_id: user.id, planner_id: planner.id, name: f, is_system: true })),
        );
      }
      // Update last planner id
      await supabase.from("profiles").update({ last_planner_id: planner.id }).eq("id", user.id);
    })();
  }, [planner, qc]);

  useEffect(() => {
    if (!isLoading && (isError || !planner)) navigate({ to: "/app" });
  }, [isLoading, isError, planner, navigate]);

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 overflow-hidden">
          <header className="sticky top-0 z-20 h-14 flex items-center gap-3 px-4 border-b border-hairline bg-background/80 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground truncate">
              {planner?.name ?? ""}
            </div>
          </header>
          <main className="p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
