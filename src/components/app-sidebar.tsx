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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, Settings, LogOut, ChevronDown, LayoutDashboard, TrendingUp, TrendingDown, LineChart, 
  Wallet, Users, FolderKanban, FileText, CandlestickChart, Target, ArrowLeftRight, FileBarChart, 
  PieChart, Calendar, CalendarCheck, Activity, StickyNote, Files, Copy, Pencil, Trash2, User, Book, UserPlus, Search, Hexagon, Sparkles, Calculator, SlidersHorizontal, Check, Dices, Scale,
  Building, Briefcase, Rocket, Video, GraduationCap, Store, Landmark, Palette, Code, Plane, Camera, Gamepad, Utensils, Music, Laptop
} from "lucide-react";
import { InviteDialog } from "./invite-dialog";
import { WORKSPACE_TYPES, WorkspaceType, getWorkspaceDefaults, getCategoryPresets, getWorkspaceNavigation } from "@/lib/workspace-presets";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ElementType> = {
  Building, Briefcase, Rocket, Video, GraduationCap, Book,
  Store, Landmark, Palette, Code, Plane, Camera, Gamepad, Utensils, Music, Laptop
};

const PRESET_ICONS = [
  { name: "Finance", id: "Building" },
  { name: "Agency", id: "Briefcase" },
  { name: "Startup", id: "Rocket" },
  { name: "Creator", id: "Video" },
  { name: "Student", id: "GraduationCap" },
  { name: "Retail", id: "Store" },
  { name: "Institution", id: "Landmark" },
  { name: "Design", id: "Palette" },
  { name: "Software", id: "Code" },
  { name: "Travel", id: "Plane" },
  { name: "Photography", id: "Camera" },
  { name: "Gaming", id: "Gamepad" },
  { name: "Food & Bev", id: "Utensils" },
  { name: "Music", id: "Music" },
  { name: "Tech", id: "Laptop" },
];

type Planner = { 
  id: string; 
  name: string; 
  emoji: string | null; 
  is_default: boolean;
  workspace_type: WorkspaceType | null;
  custom_config: any;
};

interface AppSidebarProps {
  currentPlannerId?: string;
}

export function AppSidebar({ currentPlannerId }: AppSidebarProps = {}) {
  const routeParams = useParams({ strict: false }) as { plannerId?: string };
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  
  // Extract plannerId from URL path (/app/p/{plannerId}/...) as bulletproof fallback
  const pathMatch = pathname.match(/\/app\/p\/([^\/]+)/);
  const pathPlannerId = pathMatch ? pathMatch[1] : undefined;

  const plannerId = currentPlannerId || routeParams?.plannerId || pathPlannerId;
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: planners = [] } = useQuery({
    queryKey: ["planners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planners")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Planners fetch error:", error);
        return [];
      }
      const localConfigs = JSON.parse(localStorage.getItem("capient_planner_configs") || "{}");
      return (data || []).map(p => ({
        ...p,
        workspace_type: localConfigs[p.id]?.workspace_type || p.workspace_type || "personal",
        custom_config: localConfigs[p.id]?.custom_config || p.custom_config || {}
      })) as Planner[];
    },
  });

  const { data: routePlanner } = useQuery({
    queryKey: ["route_planner", plannerId],
    queryFn: async () => {
      if (!plannerId) return null;
      const { data } = await supabase
        .from("planners")
        .select("*")
        .eq("id", plannerId)
        .maybeSingle();
      if (!data) return null;
      const localConfigs = JSON.parse(localStorage.getItem("capient_planner_configs") || "{}");
      return {
        ...data,
        workspace_type: localConfigs[data.id]?.workspace_type || data.workspace_type || "personal",
        custom_config: localConfigs[data.id]?.custom_config || data.custom_config || {}
      } as Planner;
    },
    enabled: !!plannerId,
  });

  const active = planners.find((p) => p.id === plannerId) || routePlanner || planners[0];

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { ...data, email: user.email };
    },
  });

  const [dialogOpen, setDialogOpen] = useState<null | "new" | "rename" | "settings">(null);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [newWorkspaceType, setNewWorkspaceType] = useState<WorkspaceType>("personal");
  const [editWorkspaceType, setEditWorkspaceType] = useState<WorkspaceType>("personal");

  useEffect(() => { 
    if ((dialogOpen === "rename" || dialogOpen === "settings") && active) { 
      setName(active.name); 
      setEditWorkspaceType((active.workspace_type as WorkspaceType) || "personal");
      setIconUrl(active.custom_config?.iconUrl || "");
    } 
    if (dialogOpen === "new") { 
      setName(""); 
      setNewWorkspaceType("personal"); 
      setIconUrl("");
    } 
  }, [dialogOpen, active]);

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

    const defaults = getWorkspaceDefaults(newWorkspaceType);
    const categoryPresets = getCategoryPresets(newWorkspaceType);

    const { data, error } = await supabase.from("planners").insert({ 
      user_id: user.id, 
      name: name.trim()
    }).select("id").single();

    if (error) return toast.error(error.message);

    if (data?.id) {
      const localConfigs = JSON.parse(localStorage.getItem("capient_planner_configs") || "{}");
      localConfigs[data.id] = {
        workspace_type: newWorkspaceType,
        custom_config: {
          hideModules: defaults.hideModules,
          primaryMetrics: defaults.primaryMetrics,
          clientTerm: defaults.clientTerm,
          iconUrl: iconUrl.trim(),
        }
      };
      localStorage.setItem("capient_planner_configs", JSON.stringify(localConfigs));
      
      await supabase.from("planners").update({
        workspace_type: newWorkspaceType,
        custom_config: localConfigs[data.id].custom_config
      }).eq("id", data.id);
    }

    // Seed default categories
    if (data?.id && categoryPresets.length > 0) {
      const categoriesToInsert = categoryPresets.map(cat => ({
        planner_id: data.id,
        name: cat.name,
        color: cat.color,
        category_type: cat.type,
      }));
      await supabase.from("expense_categories").insert(categoriesToInsert as any);
    }

    toast.success("Planner initialized");
    qc.invalidateQueries({ queryKey: ["planners"] });
    setDialogOpen(null);
    if (data) navigate({ to: `/app/p/${data.id}/dashboard` as any });
  }

  async function updatePlannerSettings() {
    const targetPlanner = active || routePlanner;
    const targetId = targetPlanner?.id || plannerId;
    if (!targetId) return toast.error("No active planner selected");

    const targetName = name.trim() || targetPlanner?.name || "My Planner";
    const defaults = getWorkspaceDefaults(editWorkspaceType);
    
    const localConfigs = JSON.parse(localStorage.getItem("capient_planner_configs") || "{}");
    localConfigs[targetId] = {
      workspace_type: editWorkspaceType,
      custom_config: {
        ...(targetPlanner?.custom_config || {}),
        hideModules: defaults.hideModules,
        primaryMetrics: defaults.primaryMetrics,
        clientTerm: defaults.clientTerm,
        iconUrl: iconUrl.trim(),
      }
    };
    localStorage.setItem("capient_planner_configs", JSON.stringify(localConfigs));

    const { error } = await supabase.from("planners").update({ 
      name: targetName,
      workspace_type: editWorkspaceType,
      custom_config: localConfigs[targetId].custom_config
    }).eq("id", targetId);

    toast.success("Planner settings updated!");
    
    await qc.invalidateQueries({ queryKey: ["planners"] });
    await qc.invalidateQueries({ queryKey: ["planner", targetId] });
    await qc.invalidateQueries({ queryKey: ["route_planner", targetId] });
    await qc.invalidateQueries({ queryKey: ["profile"] });
    setDialogOpen(null);
  }

  const handleSwitchPlanner = async (targetPlannerId: string) => {
    navigate({ to: `/app/p/${targetPlannerId}/dashboard`, params: { plannerId: targetPlannerId } });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ last_planner_id: targetPlannerId }).eq("id", user.id);
    }
  };

  async function duplicatePlanner() {
    if (!active) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("planners").insert({ 
      user_id: user.id, 
      name: `${active.name} (copy)`,
      workspace_type: active.workspace_type,
      custom_config: active.custom_config
    }).select("id").single();

    if (error) return toast.error(error.message);
    toast.success("Planner duplicated");
    qc.invalidateQueries({ queryKey: ["planners"] });
    if (data) navigate({ to: `/app/p/${data.id}/dashboard` as any });
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
    window.location.href = "/auth";
  }

  const activeType = (active?.workspace_type as WorkspaceType) || "personal";
  const navConfig = getWorkspaceNavigation(activeType);

  const iconMap: Record<string, any> = {
    dashboard: LayoutDashboard,
    income: TrendingUp,
    expenses: TrendingDown,
    cashflow: LineChart,
    accounts: Wallet,
    clients: Users,
    projects: FolderKanban,
    invoices: FileText,
    investments: CandlestickChart,
    vault: Files,
    goals: Target,
    budget: ArrowLeftRight,
    reports: FileBarChart,
    charts: PieChart,
    monthly: Calendar,
    calendar: CalendarCheck,
    calculator: Calculator,
    loans: Landmark,
    timeline: Activity,
    notes: StickyNote,
    taxes: Scale,
  };

  const items = plannerId
    ? navConfig.workspace.map(item => ({
        title: item.title,
        to: `/app/p/${plannerId}/${item.routeKey}`,
        icon: iconMap[item.routeKey] || LayoutDashboard,
      }))
    : [];

  const items2 = plannerId
    ? navConfig.insights.map(item => ({
        title: item.title,
        to: `/app/p/${plannerId}/${item.routeKey}`,
        icon: iconMap[item.routeKey] || Activity,
      }))
    : [];

  return (
    <Sidebar collapsible="icon" className="border-none bg-[#0b0e0c] overflow-hidden font-['Questrial',_sans-serif]">
      <SidebarHeader className={`py-4 z-10 relative ${collapsed ? 'px-0' : 'px-4'}`}>
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
                  <span className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-sm text-foreground truncate">{active?.name ?? "Planner"}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 !rounded-2xl bg-[#0a1010]/95 backdrop-blur-3xl border border-white/10 p-1.5 shadow-2xl font-['Questrial',_sans-serif] relative !overflow-hidden" align="start">
              <div className="absolute inset-0 !rounded-2xl border border-primary/20 pointer-events-none [mask-image:linear-gradient(to_bottom_right,black_0%,transparent_60%)]" />
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 blur-[40px] rounded-full pointer-events-none" />
              <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold px-2 py-1.5">Planners ({planners.length})</DropdownMenuLabel>
              {planners.map((p) => {
                const isActive = p.id === active?.id;
                const iconVal = p.custom_config?.iconUrl;
                const isUrl = iconVal && (iconVal.startsWith("http") || iconVal.startsWith("data:"));
                const IconComp = iconVal && !isUrl && ICON_MAP[iconVal] ? ICON_MAP[iconVal] : Book;

                return (
                  <DropdownMenuItem key={p.id} className={`rounded-lg cursor-pointer my-0.5 ${isActive ? "bg-white/10" : ""}`} onClick={() => handleSwitchPlanner(p.id)}>
                    {isUrl ? (
                      <img
                        src={iconVal}
                        className="h-4 w-4 mr-2 rounded-sm object-cover"
                        alt="icon"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <IconComp className={`h-4 w-4 mr-2 ${isActive ? "text-[#3DDC97]" : "text-muted-foreground"}`} />
                    )}
                    <span className={`text-[13px] ${isActive ? "text-white font-semibold" : "text-muted-foreground"}`}>{p.name}</span>
                    {isActive && <Check className="ml-auto h-4 w-4 text-[#3DDC97]" />}
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
              <DropdownMenuItem className="rounded-lg cursor-pointer my-0.5 text-muted-foreground focus:text-foreground" onClick={() => setDialogOpen("settings")}><SlidersHorizontal className="h-4 w-4 mr-2" />Planner Settings & Type</DropdownMenuItem>
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
               <DropdownMenuContent className="w-64 !rounded-2xl bg-[#0a1010]/95 backdrop-blur-3xl border border-white/10 p-1.5 shadow-2xl font-['Questrial',_sans-serif] relative !overflow-hidden" align="start">
                 <div className="absolute inset-0 !rounded-2xl border border-primary/20 pointer-events-none [mask-image:linear-gradient(to_bottom_right,black_0%,transparent_60%)]" />
                 <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 blur-[40px] rounded-full pointer-events-none" />
                  {planners.map((p) => {
                    const isActive = p.id === active?.id;
                    return (
                      <DropdownMenuItem key={p.id} className={`rounded-lg cursor-pointer my-0.5 ${isActive ? "bg-white/10" : ""}`} onClick={() => handleSwitchPlanner(p.id)}>
                        {(() => {
                          const iconVal = p.custom_config?.iconUrl;
                          const isUrl = iconVal && (iconVal.startsWith("http") || iconVal.startsWith("data:"));
                          const IconComp = iconVal && !isUrl && ICON_MAP[iconVal] ? ICON_MAP[iconVal] : Book;
                          return isUrl ? (
                            <img src={iconVal} className="h-4 w-4 mr-2 rounded-sm object-cover" alt="icon" />
                          ) : (
                            <IconComp className={`h-4 w-4 mr-2 ${isActive ? "text-[#3DDC97]" : "text-muted-foreground"}`} />
                          );
                        })()}
                        <span className={`text-[13px] ${isActive ? "text-white font-semibold" : "text-muted-foreground"}`}>{p.name}</span>
                        {isActive && <Check className="ml-auto h-4 w-4 text-[#3DDC97]" />}
                      </DropdownMenuItem>
                    );
                  })}
               </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

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
        {!collapsed && planners.length > 1 && (
          <SidebarGroup className="py-1 px-0 border-b border-white/5 pb-3 mb-1">
            <div className="flex items-center justify-between px-3 mb-1.5">
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold p-0">Planners ({planners.length})</SidebarGroupLabel>
              <button onClick={() => setDialogOpen("new")} className="text-muted-foreground hover:text-[#3DDC97] transition-colors p-1 rounded-md hover:bg-white/5" title="Create New Planner">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-0.5 px-1 max-h-36 overflow-y-auto">
              {planners.map((p) => {
                const isActive = p.id === active?.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSwitchPlanner(p.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold transition-all ${
                      isActive
                        ? "bg-[#3DDC97]/15 text-[#3DDC97] border border-[#3DDC97]/30 shadow-[0_0_10px_rgba(61,220,151,0.1)]"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {(() => {
                        const iconVal = p.custom_config?.iconUrl;
                        const isUrl = iconVal && (iconVal.startsWith("http") || iconVal.startsWith("data:"));
                        const IconComp = iconVal && !isUrl && ICON_MAP[iconVal] ? ICON_MAP[iconVal] : Book;
                        return isUrl ? (
                          <img
                            src={iconVal}
                            className="h-3.5 w-3.5 shrink-0 rounded-sm object-cover"
                            alt="icon"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <IconComp className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[#3DDC97]" : "text-muted-foreground"}`} />
                        );
                      })()}
                      <span className="truncate">{p.name}</span>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-[#3DDC97]" />}
                  </button>
                );
              })}
            </div>
          </SidebarGroup>
        )}
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
                        {item.title === "Taxes" && (
                          <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded-md group-data-[collapsible=icon]:hidden border border-primary/20">
                            Beta
                          </span>
                        )}
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
        <DialogContent className="bg-[#0c100e] border-white/10 text-white rounded-3xl font-['Questrial',_sans-serif]">
          <DialogHeader>
            <DialogTitle className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-lg text-white">
              {dialogOpen === "new" 
                ? "Create New Workspace Planner" 
                : dialogOpen === "settings" 
                  ? "Planner Settings & Workspace Type" 
                  : "Rename Planner"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Planner Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Marketing Agency 2026" 
                autoFocus 
                className="bg-black/60 border-white/10 text-white rounded-xl focus:border-[#3DDC97]" 
              />
            </div>
            
            {(dialogOpen === "new" || dialogOpen === "settings" || dialogOpen === "rename") && (
              <div className="flex flex-col gap-4">
                <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block -mb-2">Planner Icon</label>
                <div className="flex items-start gap-4">
                  <div className="relative group shrink-0">
                    {(() => {
                      const isUrl = iconUrl && (iconUrl.startsWith("http") || iconUrl.startsWith("data:"));
                      const IconComp = iconUrl && !isUrl && ICON_MAP[iconUrl] ? ICON_MAP[iconUrl] : Book;
                      return isUrl ? (
                        <img src={iconUrl} className="h-16 w-16 rounded-2xl object-cover border-2 border-[#3DDC97]/50" alt="Planner Icon" />
                      ) : (
                        <div className="h-16 w-16 rounded-2xl bg-white/5 border-2 border-[#3DDC97]/50 flex items-center justify-center">
                          <IconComp className="h-8 w-8 text-white" />
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex-1 w-full overflow-hidden">
                    <Select value={iconUrl} onValueChange={(v) => { if(v) setIconUrl(v); }}>
                      <SelectTrigger className="w-full bg-black/60 border-white/10 text-white rounded-xl h-[42px] text-xs">
                        <SelectValue placeholder="Select an icon..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0c100e] border-white/10 text-white rounded-xl max-h-[250px]">
                        {PRESET_ICONS.map((preset, idx) => {
                          const PresetIcon = ICON_MAP[preset.id];
                          return (
                            <SelectItem key={idx} value={preset.id} className="text-xs py-2">
                              <div className="flex items-center gap-3">
                                <PresetIcon className="h-4 w-4 text-[#3DDC97]" />
                                <span>{preset.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {(dialogOpen === "new" || dialogOpen === "settings") && (
              <div>
                <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Planner Workspace Type / Preset</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {WORKSPACE_TYPES.map(wt => {
                    const currentSelected = dialogOpen === "new" ? newWorkspaceType : editWorkspaceType;
                    const isSel = currentSelected === wt.id;
                    return (
                      <button
                        key={wt.id}
                        type="button"
                        onClick={() => dialogOpen === "new" ? setNewWorkspaceType(wt.id) : setEditWorkspaceType(wt.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold transition-all flex flex-col justify-between ${
                          isSel
                            ? "bg-[#3DDC97]/20 border-[#3DDC97] text-[#3DDC97]"
                            : "bg-black/40 border-white/10 text-white/70 hover:bg-white/5"
                        }`}
                      >
                        <span>{wt.title}</span>
                        <span className="text-[10px] text-muted-foreground font-normal line-clamp-1 mt-0.5">{wt.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(null)} className="rounded-xl text-xs font-bold text-muted-foreground hover:text-white">Cancel</Button>
            <Button onClick={dialogOpen === "new" ? createPlanner : updatePlannerSettings} className="bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold">
              {dialogOpen === "new" ? "Initialize Planner" : "Save Settings"}
            </Button>
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