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
import { Plus, UserMinus, ShieldAlert, Key } from "lucide-react";
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
        // Try to fetch from our secure Vercel API route which returns emails
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        
        if (token) {
          const res = await fetch(`/api/collaborators?plannerId=${plannerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              return data;
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch from API, falling back to direct DB query", err);
      }

      // FALLBACK: If API fails
      const { data: ownerProfile } = await supabase.from("profiles").select("*").eq("id", planner.user_id).maybeSingle();
      const { data: collabs } = await supabase.from("planner_collaborators").select("user_id").eq("planner_id", plannerId);
      const collabIds = (collabs || []).map(c => c.user_id);
      let allUsers = ownerProfile ? [ownerProfile] : [];
      if (collabIds.length > 0) {
        const { data: collabProfiles } = await supabase.from("profiles").select("*").in("id", collabIds);
        if (collabProfiles) allUsers = [...allUsers, ...collabProfiles];
      }
      return allUsers;
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
      <div className="min-h-screen flex w-full bg-background pb-[80px] md:pb-0 relative">

        <div className="hidden md:flex relative z-10">
          <AppSidebar />
        </div>
        <SidebarInset className="flex-1 overflow-hidden relative z-10">
          <header className="hidden md:flex sticky top-0 z-20 h-14 items-center gap-3 px-4 border-b border-hairline bg-background/80 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground truncate flex-1">
              {planner?.name ?? ""}
            </div>
            {planner && (
              <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-2 border-l border-white/5 pl-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider hidden sm:inline-block">Currency</span>
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
                    <SelectTrigger className="h-8 w-[92px] bg-card border-hairline"><SelectValue /></SelectTrigger>
                    <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </header>

          {/* Mobile Top Bar */}
          <header className="md:hidden sticky top-0 z-20 h-14 flex items-center justify-center px-4 border-b border-white/5 bg-background/90 backdrop-blur-xl">
            <div className="font-display font-medium text-base truncate">
              {planner?.name ?? "Planner"}
            </div>
          </header>

          <main className="p-4 md:p-6 overflow-y-auto">
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

