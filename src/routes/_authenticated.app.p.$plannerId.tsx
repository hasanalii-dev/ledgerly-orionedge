import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_FOLDERS, CURRENCIES } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PageTransition, LoadingSpinner } from "@/components/ui/loading-spinner";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InviteDialog } from "@/components/invite-dialog";
import { Plus, UserMinus, ShieldAlert, Key, Bug } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId")({
  component: PlannerLayout,
});

function PlannerLayout() {
  const { plannerId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

  // Validate planner exists and is owned by user
  const { data: planner, isError, isLoading } = useQuery({
    queryKey: ["planner", plannerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("planners").select("*").eq("id", plannerId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: collaborators = [] } = useQuery({
    queryKey: ["collaborators", plannerId],
    queryFn: async () => {
      if (!planner) return [];

      try {
        const { data, error } = await supabase.rpc("get_collaborator_details", { p_planner_id: plannerId });
        if (error) {
          console.error("RPC get_collaborator_details failed", error);
          throw error;
        }
        if (data && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.error("Failed to fetch collaborators from RPC", err);
      }
      return [];
    },
    enabled: !!planner,
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

  const handleRemoveCollaborator = async (userId: string) => {
    if (!planner) return;
    const { data, error } = await supabase.from("planner_collaborators").delete().eq("planner_id", planner.id).eq("user_id", userId).select();
    if (error) {
      toast.error(error.message);
    } else if (!data || data.length === 0) {
      toast.error("You don't have permission to remove this collaborator.");
    } else {
      toast.success("Collaborator removed");
      qc.invalidateQueries({ queryKey: ["collaborators", plannerId] });
      setOpenDialogs((prev) => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    if (!isLoading && (isError || !planner)) navigate({ to: "/app" });
  }, [isLoading, isError, planner, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-transparent pb-[80px] md:pb-0 relative">

        <div className="hidden md:flex relative z-10">
          <AppSidebar />
        </div>
        <SidebarInset className="flex-1 overflow-hidden relative z-10">
          <header className="hidden md:flex sticky top-0 z-20 h-14 items-center gap-4 px-4 bg-[#0b0e0c] border-b border-white/5 transition-all duration-300 relative">
            <div className="absolute right-0 top-0 h-full w-96 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent pointer-events-none" />
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors -ml-2 h-8 w-8 relative z-10" />
            <div className="text-[15px] font-medium text-foreground truncate flex-1 tracking-wide ml-2 relative z-10">
              {planner?.name ?? ""}
            </div>
            {planner && (
              <div className="flex items-center gap-4 relative z-10">
                <TooltipProvider delayDuration={200}>
                  <div className="flex -space-x-2">
                    {collaborators.slice(0, 5).map((collab: any, i: number) => {
                      const isOwner = collab.id === planner.user_id;
                      return (
                        <Dialog
                          key={collab.id || i}
                          open={openDialogs[collab.id]}
                          onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, [collab.id]: open }))}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DialogTrigger asChild>
                                <button className="rounded-full border-2 border-background ring-1 ring-primary/20 shadow-md transition-transform hover:scale-110 hover:z-20 relative cursor-pointer outline-none focus-visible:ring-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage src={collab.avatar_url} />
                                    <AvatarFallback className="bg-primary/20 text-primary font-medium text-[10px]">
                                      {(collab.display_name || "U").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                </button>
                              </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                              {collab.display_name || collab.email} {isOwner && "(Owner)"}
                            </TooltipContent>
                          </Tooltip>

                          <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                              <DialogTitle>Collaborator Details</DialogTitle>
                              <DialogDescription>
                                Access controls and information for this user.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center py-6">
                              <Avatar className="h-20 w-20 mb-4 border-4 border-white/5 shadow-xl ring-2 ring-primary/20">
                                <AvatarImage src={collab.avatar_url} />
                                <AvatarFallback className="text-2xl font-medium">
                                  {(collab.display_name || "U").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <h3 className="text-lg font-display">{collab.display_name || "Unknown User"}</h3>
                              <p className="text-sm text-muted-foreground">{collab.email}</p>

                              <div className="mt-6 w-full flex items-center justify-between p-4 bg-white/5 rounded-xl border border-hairline">
                                <div className="flex items-center gap-3">
                                  {isOwner ? <Key className="h-5 w-5 text-emerald-500" /> : <ShieldAlert className="h-5 w-5 text-blue-400" />}
                                  <div className="text-left">
                                    <p className="text-sm font-medium">{isOwner ? "Owner" : "Collaborator"}</p>
                                    <p className="text-xs text-muted-foreground">{isOwner ? "Full access to settings and billing" : "Standard access"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {!isOwner && (
                              <div className="pt-4 border-t border-hairline flex justify-end">
                                <Button variant="destructive" className="w-full sm:w-auto" onClick={() => handleRemoveCollaborator(collab.id)}>
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Remove Access
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      );
                    })}
                    {collaborators.length > 5 && (
                      <div className="h-7 w-7 rounded-full border-2 border-background bg-elevated flex items-center justify-center text-[10px] font-medium text-muted-foreground shadow-md z-10 relative">
                        +{collaborators.length - 5}
                      </div>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <InviteDialog plannerId={planner.id} trigger={<button className="h-7 w-7 rounded-full border-2 border-background bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground shadow-md z-10 relative transition-colors"><Plus className="h-3 w-3" /></button>} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">Invite</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold hidden sm:inline-block">Currency</span>
                  <Select
                    value={planner.currency ?? "USD"}
                    onValueChange={async (v) => {
                      const { error } = await supabase.from("planners").update({ currency: v }).eq("id", planner.id);
                      if (error) return toast.error(error.message);
                      qc.invalidateQueries({ queryKey: ["planner", planner.id] });
                      qc.invalidateQueries({ queryKey: ["planners"] });
                      toast.success(`Currency set to ${v}`);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[90px] bg-[#111313] hover:bg-[#151818] border-transparent rounded-lg text-xs transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1010]/80 backdrop-blur-3xl border-white/10 rounded-2xl shadow-2xl p-1.5 relative overflow-hidden">
                      <div className="absolute inset-0 rounded-2xl border border-primary/20 pointer-events-none [mask-image:linear-gradient(to_bottom_right,black_0%,transparent_60%)]" />
                      <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 blur-[40px] rounded-full pointer-events-none" />
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs cursor-pointer rounded-lg my-0.5 focus:bg-white/5 focus:text-foreground relative z-10">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </header>

          {/* Mobile Top Bar */}
          <header className="md:hidden sticky top-0 z-20 h-16 flex items-center justify-between px-4 bg-[#0b0e0c] border-b border-white/5 transition-all duration-300">
            <img src="/full-logo-1.png" alt="Ledgerly" className="h-7 object-contain" />
            
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 items-center">
                {collaborators.slice(0, 3).map((collab: any, i: number) => (
                  <Avatar key={collab.id || i} className="h-8 w-8 border border-[#3DDC97]/60 bg-[#0b0e0c] relative z-10 shadow-sm">
                    <AvatarImage src={collab.avatar_url} />
                    <AvatarFallback className="bg-transparent text-white font-medium text-[10px]">
                      {(collab.display_name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <InviteDialog 
                  plannerId={planner?.id || ""} 
                  trigger={
                    <button className="h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 z-20 backdrop-blur-sm relative transition-colors hover:bg-white/10 shadow-sm">
                      <Plus className="h-4 w-4" />
                    </button>
                  } 
                />
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 overflow-y-auto min-w-0 max-w-full overflow-x-hidden">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
        </SidebarInset>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}

