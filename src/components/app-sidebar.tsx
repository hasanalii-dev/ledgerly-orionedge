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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, Settings, LogOut, ChevronDown, LayoutDashboard, TrendingUp, TrendingDown, LineChart, 
  Wallet, Users, FolderKanban, FileText, CandlestickChart, Target, ArrowLeftRight, FileBarChart, 
  PieChart, Calendar, Activity, StickyNote, Files, Copy, Pencil, Trash2, User, Book, UserPlus, Search, Hexagon, Sparkles
} from "lucide-react";
import { InviteDialog } from "./invite-dialog";
import { toast } from "sonner";

type Planner = { id: string; name: string; emoji: string | null; is_default: boolean };

export function AppSidebar() {
  const { plannerId } = useParams({ strict: false }) as { plannerId?: string };
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => { if (dialogOpen === "rename" && active) setName(active.name); if (dialogOpen === "new") setName(""); }, [dialogOpen, active]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  async function createPlanner() {
    if (!name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("planners").insert({ user_id: user.id, name: name.trim() }).select("id").single();
    if (error) return toast.error(error.message);
    toast.success("Planner created");
    qc.invalidateQueries({ queryKey: ["planners"] });
    setDialogOpen(null);
    if (data) navigate({ to: `/app/p/${data.id}/dashboard`, params: { plannerId: data.id } });
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
    if (data) navigate({ to: `/app/p/${data.id}/dashboard`, params: { plannerId: data.id } });
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
    if (next) navigate({ to: `/app/p/${next.id}/dashboard`, params: { plannerId: next.id } });
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
    <Sidebar collapsible="icon" className="border-none bg-[#0b0e0c] overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-64 bg-primary/10 blur-[100px] pointer-events-none z-0" />
      <SidebarHeader className={`py-4 z-10 relative ${collapsed ? 'px-0' : 'px-4'}`}>
        {/* macOS window controls */}
        {!collapsed && (
          <div className="flex items-center gap-2 mb-8 pl-1">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]" />
          </div>
        )}

        {!collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left group hover:opacity-80 transition-opacity">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] relative overflow-hidden">
                  <img src="/side-bar-logo.png" alt="Capient Logo" className="h-5 w-auto object-contain relative z-10" />
                  <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-0.5">Capient</span>
                  <span className="font-display font-medium text-sm text-foreground truncate">{active?.name ?? "Planner"}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-2xl bg-[#0a1010]/80 backdrop-blur-3xl border-white/10 p-1.5 shadow-2xl font-['Questrial',_sans-serif] relative overflow-hidden" align="start">
              <div className="absolute inset-0 rounded-2xl border border-primary/20 pointer-events-none [mask-image:linear-gradient(to_bottom_right,black_0%,transparent_60%)]" />
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 blur-[40px] rounded-full pointer-events-none" />
              <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold px-2 py-1.5">Planners</DropdownMenuLabel>
              {planners.map((p) => {
                const isActive = p.id === active?.id;
                return (
                  <DropdownMenuItem key={p.id} className={`rounded-lg cursor-pointer my-0.5 ${isActive ? "bg-white/5" : ""}`} onClick={() => navigate({ to: `/app/p/${p.id}/dashboard`, params: { plannerId: p.id } })}>
                    <Book className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className={`text-[13px] ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{p.name}</span>
                    {isActive && <span className="ml-auto text-xs text-primary font-medium">Active</span>}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator className="bg-white/5 my-1" />
              {active && (
                <InviteDialog 
                  plannerId={active.id} 
                  trigger={<DropdownMenuItem className="rounded-lg cursor-pointer my-0.5 text-muted-foreground focus:text-foreground" onSelect={(e) => e.preventDefault()}><UserPlus className="h-4 w-4 mr-2" />Invite to planner</DropdownMenuItem>} 
                />
              )}
              <DropdownMenuItem className="rounded-lg cursor-pointer my-0.5 text-muted-foreground focus:text-foreground" onClick={() => setDialogOpen("new")}><Plus className="h-4 w-4 mr-2" />New planner</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer my-0.5 text-muted-foreground focus:text-foreground" onClick={() => setDialogOpen("rename")}><Pencil className="h-4 w-4 mr-2" />Rename</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer my-0.5 text-muted-foreground focus:text-foreground" onClick={duplicatePlanner}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 my-1" />
              <DropdownMenuItem onClick={deletePlanner} className="text-[#FF5F56] focus:bg-[#FF5F56]/10 focus:text-[#FF5F56] rounded-lg cursor-pointer my-0.5"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-col items-center gap-6 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            </div>
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 hover:opacity-80 transition-opacity">
                    <img src="/side-bar-logo.png" alt="Capient" className="h-5 w-auto object-contain" />
                  </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="w-64 rounded-2xl bg-[#0a1010]/80 backdrop-blur-3xl border-white/10 p-1.5 shadow-2xl font-['Questrial',_sans-serif] relative overflow-hidden" align="start">
                 <div className="absolute inset-0 rounded-2xl border border-primary/20 pointer-events-none [mask-image:linear-gradient(to_bottom_right,black_0%,transparent_60%)]" />
                 <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 blur-[40px] rounded-full pointer-events-none" />
                  {planners.map((p) => {
                    const isActive = p.id === active?.id;
                    return (
                      <DropdownMenuItem key={p.id} className={`rounded-lg cursor-pointer my-0.5 ${isActive ? "bg-white/5" : ""}`} onClick={() => navigate({ to: `/app/p/${p.id}/dashboard`, params: { plannerId: p.id } })}>
                        <Book className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className={`text-[13px] ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{p.name}</span>
                        {isActive && <span className="ml-auto text-xs text-primary font-medium">Active</span>}
                      </DropdownMenuItem>
                    );
                  })}
               </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Faux Search Input */}
        {!collapsed && (
          <div className="mt-6 relative group cursor-pointer" onClick={() => setSearchOpen(true)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="w-full h-9 bg-white/[0.03] border border-white/5 rounded-[10px] flex items-center pl-9 pr-3 text-xs text-muted-foreground group-hover:bg-white/[0.05] group-hover:border-white/10 transition-all shadow-sm">
              Search...
              <div className="ml-auto flex items-center gap-1">
                <span className="bg-background/50 rounded px-1.5 py-[1px] text-[10px] font-mono border border-white/10">⌘</span>
                <span className="bg-background/50 rounded px-1.5 py-[1px] text-[10px] font-mono border border-white/10">K</span>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
           <div className="mt-6 flex justify-center cursor-pointer group" onClick={() => setSearchOpen(true)}>
             <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-[10px] bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] group-hover:border-white/10 transition-colors">
                <Search className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
             </div>
           </div>
        )}
      </SidebarHeader>

      <SidebarContent className={`pb-4 z-10 relative ${collapsed ? 'px-0' : 'px-3'}`}>
        <SidebarGroup className="group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
          {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 mt-2 px-3">Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => {
                const isActive = pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} className="p-0 h-auto w-full group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:mt-1">
                      <Link 
                        to={item.to} 
                        className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl transition-all duration-300 group group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!size-10 ${
                          isActive 
                            ? "bg-primary/10 border border-primary/20 text-primary font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_15px_rgba(61,220,151,0.05)]" 
                            : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground border border-transparent"
                        }`}
                      >
                        <item.icon className={`h-[16px] w-[16px] transition-colors ${isActive ? "text-primary drop-shadow-[0_0_8px_rgba(61,220,151,0.5)]" : "text-muted-foreground group-hover:text-foreground"}`} />
                        <span className="text-[13px] group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4 group-data-[collapsible=icon]:px-0">
          {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-3">Insights</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items2.map((item) => {
                const isActive = pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} className="p-0 h-auto w-full group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:mt-1">
                      <Link 
                        to={item.to} 
                        className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl transition-all duration-300 group group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!size-10 ${
                          isActive 
                            ? "bg-primary/10 border border-primary/20 text-primary font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_15px_rgba(61,220,151,0.05)]" 
                            : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground border border-transparent"
                        }`}
                      >
                        <item.icon className={`h-[16px] w-[16px] transition-colors ${isActive ? "text-primary drop-shadow-[0_0_8px_rgba(61,220,151,0.5)]" : "text-muted-foreground group-hover:text-foreground"}`} />
                        <span className="text-[13px] group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto px-3 mb-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-card/40 p-4 shadow-lg group transition-all hover:bg-card/60">
              <div className="absolute inset-0 rounded-2xl border border-primary/50 pointer-events-none [mask-image:linear-gradient(to_bottom_right,black_0%,transparent_60%)]" />
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/40 blur-[40px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] font-semibold text-white tracking-wide">Beta Access</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Early preview features</p>
                </div>
                <div className="flex shrink-0 items-center justify-center h-8 w-8 rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className={`py-4 z-10 relative ${collapsed ? 'px-0' : 'px-4'}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`w-full justify-start h-auto bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all rounded-[14px] ${collapsed ? 'p-0 h-10 w-10 shrink-0 flex items-center justify-center mx-auto' : 'p-2.5'}`}>
              <Avatar className={`${collapsed ? 'h-7 w-7 rounded-lg' : 'h-8 w-8 rounded-[10px]'} border border-white/10 shadow-sm`}>
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className={`bg-primary/15 text-primary text-xs font-semibold ${collapsed ? 'rounded-lg' : 'rounded-[10px]'}`}>{(profile?.display_name ?? profile?.email ?? "U").toString().charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="ml-3 text-left overflow-hidden flex-1">
                  <div className="text-[13px] font-medium text-foreground truncate">{profile?.display_name ?? "You"}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{profile?.email}</div>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-[#0a1010]/80 backdrop-blur-3xl border-white/10 p-1.5 shadow-2xl font-['Questrial',_sans-serif] relative overflow-hidden">
            <div className="absolute inset-0 rounded-2xl border border-primary/20 pointer-events-none [mask-image:linear-gradient(to_top_right,black_0%,transparent_60%)]" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/20 blur-[40px] rounded-full pointer-events-none" />
            <DropdownMenuLabel className="font-normal p-2 flex items-center gap-2.5">
              <Avatar className="h-8 w-8 rounded-full border border-white/10 shadow-sm">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">{(profile?.display_name ?? profile?.email ?? "U").toString().charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[13px] font-medium text-foreground truncate">{profile?.display_name ?? "You"}</span>
                <span className="text-[11px] text-muted-foreground truncate">{profile?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer my-0.5 text-muted-foreground focus:text-foreground"><Link to="/app/accounts"><Wallet className="h-4 w-4 mr-2" />Accounts</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer my-0.5 text-muted-foreground focus:text-foreground"><Link to="/app/profile"><User className="h-4 w-4 mr-2" />Profile & Account</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer my-0.5 text-muted-foreground focus:text-foreground"><Link to="/app/preferences"><Settings className="h-4 w-4 mr-2" />Preferences</Link></DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setSignOutOpen(true); }} className="text-[#FF5F56] rounded-lg cursor-pointer focus:bg-[#FF5F56]/10 focus:text-[#FF5F56] my-0.5"><LogOut className="h-4 w-4 mr-2" />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Workspace">
            {items.map((item) => (
              <CommandItem 
                key={item.to} 
                onSelect={() => { 
                  navigate({ to: item.to, params: { plannerId } }); 
                  setSearchOpen(false); 
                }}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Insights">
            {items2.map((item) => (
              <CommandItem 
                key={item.to} 
                onSelect={() => { 
                  navigate({ to: item.to, params: { plannerId } }); 
                  setSearchOpen(false); 
                }}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Dialog open={dialogOpen !== null} onOpenChange={(o) => !o && setDialogOpen(null)}>
        <DialogContent className="bg-[#050a0a] border-white/10">
          <DialogHeader><DialogTitle>{dialogOpen === "new" ? "New planner" : "Rename planner"}</DialogTitle></DialogHeader>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Planner name" autoFocus className="bg-background border-white/10" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(null)}>Cancel</Button>
            <Button onClick={dialogOpen === "new" ? createPlanner : renamePlanner} className="bg-primary hover:bg-primary/90 text-primary-foreground">{dialogOpen === "new" ? "Create" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent className="bg-[#050a0a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={signOut} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}