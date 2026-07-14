import { Link, useParams, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, Settings, LogOut, ChevronDown, LayoutDashboard, TrendingUp, TrendingDown, LineChart, 
  Wallet, Users, FolderKanban, FileText, CandlestickChart, Target, ArrowLeftRight, FileBarChart, 
  PieChart, Calendar, Activity, StickyNote, Files, Copy, Pencil, Trash2, User, Globe, Hexagon, Book, UserPlus
} from "lucide-react";
import { InviteDialog } from "./invite-dialog";

import { toast } from "sonner";

type Planner = { id: string; name: string; emoji: string | null; is_default: boolean };

export function AppSidebar() {
  const { plannerId } = useParams({ strict: false }) as { plannerId?: string };
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: planners = [] } = useQuery({
    queryKey: ["planners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("planners").select("id, name, emoji, is_default").order("created_at");
      if (error) throw error;
      return data as Planner[];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { ...data, email: user.email };
    },
  });

  const active = planners.find((p) => p.id === plannerId) ?? planners[0];
  const [dialogOpen, setDialogOpen] = useState<null | "new" | "rename">(null);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => { if (dialogOpen === "rename" && active) setName(active.name); if (dialogOpen === "new") setName(""); }, [dialogOpen, active]);

  async function createPlanner() {
    if (!name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("planners").insert({ user_id: user.id, name: name.trim() }).select("id").single();
    if (error) return toast.error(error.message);
    toast.success("Planner created");
    qc.invalidateQueries({ queryKey: ["planners"] });
    setDialogOpen(null);
    if (data) navigate({ to: "/app/p/$plannerId/dashboard", params: { plannerId: data.id } });
  }

  async function renamePlanner() {
    if (!active || !name.trim()) return;
    const { error } = await supabase.from("planners").update({ name: name.trim() }).eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success("Renamed");
    qc.invalidateQueries({ queryKey: ["planners"] });
    setDialogOpen(null);
  }

  async function duplicatePlanner() {
    if (!active) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("planners").insert({ user_id: user.id, name: `${active.name} (copy)` }).select("id").single();
    if (error) return toast.error(error.message);
    toast.success("Planner duplicated");
    qc.invalidateQueries({ queryKey: ["planners"] });
    if (data) navigate({ to: "/app/p/$plannerId/dashboard", params: { plannerId: data.id } });
  }

  async function deletePlanner() {
    if (!active) return;
    if (planners.length <= 1) return toast.error("Keep at least one planner");
    if (!confirm(`Delete "${active.name}" and all its data?`)) return;
    const { error } = await supabase.from("planners").delete().eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success("Planner deleted");
    const next = planners.find((p) => p.id !== active.id);
    qc.invalidateQueries({ queryKey: ["planners"] });
    if (next) navigate({ to: "/app/p/$plannerId/dashboard", params: { plannerId: next.id } });
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const items = plannerId
    ? [
        { title: "Dashboard", to: `/app/p/${plannerId}/dashboard`, icon: LayoutDashboard },
        { title: "Income", to: `/app/p/${plannerId}/income`, icon: TrendingUp },
        { title: "Expenses", to: `/app/p/${plannerId}/expenses`, icon: TrendingDown },
        { title: "Cash Flow", to: `/app/p/${plannerId}/cashflow`, icon: LineChart },
        { title: "Accounts", to: `/app/p/${plannerId}/accounts`, icon: Wallet },
        { title: "Clients", to: `/app/p/${plannerId}/clients`, icon: Users },
        { title: "Projects", to: `/app/p/${plannerId}/projects`, icon: FolderKanban },
        { title: "Invoices", to: `/app/p/${plannerId}/invoices`, icon: FileText },
        { title: "Investments", to: `/app/p/${plannerId}/investments`, icon: CandlestickChart },
      ]
    : [];
  const items2 = plannerId
    ? [
        { title: "Vault", to: `/app/p/${plannerId}/vault`, icon: Files },
        { title: "Goals", to: `/app/p/${plannerId}/goals`, icon: Target },
        { title: "Budget", to: `/app/p/${plannerId}/budget`, icon: ArrowLeftRight },
        { title: "Reports", to: `/app/p/${plannerId}/reports`, icon: FileBarChart },
        { title: "Charts", to: `/app/p/${plannerId}/charts`, icon: PieChart },
        { title: "Monthly Tracking", to: `/app/p/${plannerId}/monthly`, icon: Calendar },
        { title: "Timeline", to: `/app/p/${plannerId}/timeline`, icon: Activity },
        { title: "Notes", to: `/app/p/${plannerId}/notes`, icon: StickyNote },
      ]
    : [];


  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#030808]">
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2 px-1 mb-2">
          <img src="/favicon.png" alt="Lumen" className="h-6 w-6 object-contain" />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold">Lumen</span>
              <span className="text-[10px] text-muted-foreground">by Orion Edge Digital</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-11 bg-white/[0.02] border-white/5 hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-2.5 truncate">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <Book className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium truncate">{active?.name ?? "Planner"}</span>
                </span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
              <DropdownMenuLabel>Planners</DropdownMenuLabel>
              {planners.map((p) => (
                <DropdownMenuItem key={p.id} onClick={() => navigate({ to: "/app/p/$plannerId/dashboard", params: { plannerId: p.id } })}>
                  <Book className="h-4 w-4 mr-2 text-muted-foreground" />
                  {p.name}
                  {p.id === active?.id && <span className="ml-auto text-xs text-primary">Active</span>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {active && (
                <InviteDialog 
                  plannerId={active.id} 
                  trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}><UserPlus className="h-4 w-4 mr-2" />Invite to planner</DropdownMenuItem>} 
                />
              )}
              <DropdownMenuItem onClick={() => setDialogOpen("new")}><Plus className="h-4 w-4 mr-2" />New planner</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDialogOpen("rename")}><Pencil className="h-4 w-4 mr-2" />Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={duplicatePlanner}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={deletePlanner} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const isActive = pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} className="p-0 h-auto w-full">
                      <Link 
                        to={item.to} 
                        className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl transition-all duration-300 group ${
                          isActive 
                            ? "bg-primary/10 text-primary font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_0_15px_rgba(16,185,129,0.1)] border border-primary/20" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                        }`}
                      >
                        <item.icon className={`h-[18px] w-[18px] transition-colors ${isActive ? "stroke-[2.5px] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "group-hover:text-foreground"}`} />
                        <span>{item.title}</span>
                        {isActive && <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Insights</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items2.map((item) => {
                const isActive = pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} className="p-0 h-auto w-full">
                      <Link 
                        to={item.to} 
                        className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl transition-all duration-300 group ${
                          isActive 
                            ? "bg-primary/10 text-primary font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_0_15px_rgba(16,185,129,0.1)] border border-primary/20" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                        }`}
                      >
                        <item.icon className={`h-[18px] w-[18px] transition-colors ${isActive ? "stroke-[2.5px] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "group-hover:text-foreground"}`} />
                        <span>{item.title}</span>
                        {isActive && <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-11 px-2 bg-transparent hover:bg-white/5 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{(profile?.display_name ?? profile?.email ?? "U").toString().charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="ml-2 text-left overflow-hidden">
                  <div className="text-sm font-medium truncate">{profile?.display_name ?? "You"}</div>
                  <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild><Link to="/app/profile"><User className="h-4 w-4 mr-2" />Profile & Account</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/app/preferences"><Settings className="h-4 w-4 mr-2" />Preferences</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setSignOutOpen(true); }} className="text-destructive"><LogOut className="h-4 w-4 mr-2" />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <Dialog open={dialogOpen !== null} onOpenChange={(o) => !o && setDialogOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialogOpen === "new" ? "New planner" : "Rename planner"}</DialogTitle></DialogHeader>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Planner name" autoFocus />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(null)}>Cancel</Button>
            <Button onClick={dialogOpen === "new" ? createPlanner : renamePlanner} className="glow-emerald">{dialogOpen === "new" ? "Create" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={signOut} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
