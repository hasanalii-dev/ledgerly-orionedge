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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard, TrendingUp, TrendingDown, Wallet, Users, FolderKanban,
  FileText, LineChart, Target, PieChart, Activity, StickyNote, Settings,
  ChevronDown, Plus, Copy, Trash2, Pencil, LogOut, User, ArrowLeftRight, Files, CandlestickChart,
} from "lucide-react";
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
    const { data, error } = await supabase.from("planners").insert({ user_id: user.id, name: `${active.name} (copy)`, emoji: active.emoji }).select("id").single();
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
        { title: "Charts", to: `/app/p/${plannerId}/charts`, icon: PieChart },
        { title: "Timeline", to: `/app/p/${plannerId}/timeline`, icon: Activity },
        { title: "Notes", to: `/app/p/${plannerId}/notes`, icon: StickyNote },
      ]
    : [];

  return (
    <Sidebar collapsible="icon" className="border-r border-hairline">
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2 px-1 mb-2">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <img src="/favicon.png" alt="Ledgerly" className="h-4 w-4 object-contain" />
          </span>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold">Ledgerly</span>
              <span className="text-[10px] text-muted-foreground">by Orion Edge Digital</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-11 bg-card border-hairline hover:bg-accent">
                <span className="flex items-center gap-2 truncate">
                  <span>{active?.emoji ?? "📘"}</span>
                  <span className="font-medium truncate">{active?.name ?? "Planner"}</span>
                </span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
              <DropdownMenuLabel>Planners</DropdownMenuLabel>
              {planners.map((p) => (
                <DropdownMenuItem key={p.id} onClick={() => navigate({ to: "/app/p/$plannerId/dashboard", params: { plannerId: p.id } })}>
                  <span className="mr-2">{p.emoji ?? "📘"}</span>{p.name}
                  {p.id === active?.id && <span className="ml-auto text-xs text-primary">Active</span>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
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
          {!collapsed && <SidebarGroupLabel>Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.to} tooltip={item.title}>
                    <Link to={item.to} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Insights</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items2.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.to} tooltip={item.title}>
                    <Link to={item.to} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-11 px-2 hover:bg-accent">
              <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{(profile?.display_name ?? profile?.email ?? "U").toString().charAt(0).toUpperCase()}</AvatarFallback></Avatar>
              {!collapsed && (
                <div className="ml-2 text-left overflow-hidden">
                  <div className="text-sm font-medium truncate">{profile?.display_name ?? "You"}</div>
                  <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild><Link to="/app/settings"><User className="h-4 w-4 mr-2" />Profile & settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/app/settings"><Settings className="h-4 w-4 mr-2" />Preferences</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive"><LogOut className="h-4 w-4 mr-2" />Sign out</DropdownMenuItem>
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
    </Sidebar>
  );
}
