import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CURRENCIES } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { User, Dice5, Pencil, Bug, Mail, ArrowRight } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
export const Route = createFileRoute("/_authenticated/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: profile, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { ...data, email: user.email };
    },
  });

  const { data: pendingInvites = [], refetch: refetchInvites } = useQuery({
    queryKey: ["pending_invites_profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) return [];
      
      return (await supabase.from("planner_invites").select("*, planners(name)").eq("invitee_email", user.email).eq("status", "pending")).data ?? [];
    },
  });

  const [name, setName] = useState(""); 
  const [avatarUrl, setAvatarUrl] = useState("");
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [bugOpen, setBugOpen] = useState(false);
  const [bugMsg, setBugMsg] = useState("");
  const [bugLoading, setBugLoading] = useState(false);

  // Fetch data for monthly stats and portfolio
  const activePlannerId = profile?.last_planner_id;
  const currentMonthYear = format(new Date(), "yyyy-MM");

  const { data: allocations = [] } = useQuery({
    queryKey: ["monthly_allocations", activePlannerId, currentMonthYear],
    enabled: !!activePlannerId,
    queryFn: async () => (await supabase.from("monthly_allocations").select("amount, allocation_type").eq("planner_id", activePlannerId).eq("month_year", currentMonthYear)).data ?? [],
  });

  const { data: investments = [] } = useQuery({
    queryKey: ["investments", activePlannerId],
    enabled: !!activePlannerId,
    queryFn: async () => (await supabase.from("investments").select("current_value").eq("planner_id", activePlannerId)).data ?? [],
  });

  const monthEarnings = allocations.filter(a => a.allocation_type === "earning").reduce((s, r) => s + Number(r.amount || 0), 0);
  const monthExpenses = allocations.filter(a => a.allocation_type !== "earning").reduce((s, r) => s + Number(r.amount || 0), 0);
  const portfolioValue = investments.reduce((sum, inv) => sum + Number(inv.current_value || 0), 0);

  const currency = profile?.default_currency ?? "USD";



  const handleInviteAction = async (inviteId: string, action: 'accepted' | 'declined') => {
    const { error } = await supabase.from("planner_invites").update({ status: action }).eq("id", inviteId);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (action === 'accepted') {
      const invite = pendingInvites.find(i => i.id === inviteId);
      if (invite) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("planner_collaborators").insert({
          planner_id: invite.planner_id,
          user_id: user?.id,
          role: invite.role,
        });
      }
    }
    toast.success(`Invite ${action}`);
    refetchInvites();
  };

  useEffect(() => { 
    if (profile) { 
      setName(profile.display_name ?? ""); 
      setAvatarUrl(profile.avatar_url ?? "");
    } 
  }, [profile]);

  async function save() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ 
      id: user.id,
      display_name: name, 
      avatar_url: avatarUrl,
    });
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
    refetch();
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  function generateAvatar() {
    const seed = Math.random().toString(36).substring(7); // Random seed every time
    const newAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
    setAvatarUrl(newAvatar);
  }

  async function submitBug() {
    if (!bugMsg) return;
    setBugLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const logs = JSON.stringify((window as any).__APP_LOGS__ || []);
    const { error } = await supabase.from("bug_reports").insert({
      user_id: user?.id,
      message: bugMsg,
      logs: logs
    });
    setBugLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Bug report submitted. Thank you!");
      setBugOpen(false);
      setBugMsg("");
    }
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background pb-[80px] md:pb-0">
        <div className="hidden md:flex">
          <AppSidebar />
        </div>
        <SidebarInset className="flex-1">
          <header className="hidden md:flex sticky top-0 z-20 h-14 items-center gap-3 px-4 border-b border-hairline bg-background/80 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">Profile</div>
          </header>

          {/* Mobile Top Bar */}
          <header className="md:hidden sticky top-0 z-20 h-14 flex items-center justify-center px-4 border-b border-white/5 bg-background/90 backdrop-blur-xl">
            <div className="font-display font-medium text-base">Profile</div>
          </header>

          <main className="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-8">
            <div>
              <h1 className="font-display text-3xl">Profile</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage your personal profile and avatar.</p>
            </div>

            {/* Account Info */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground/80 flex items-center gap-2"><User className="h-4 w-4" /> Personal Profile</h2>
              <div className="rounded-2xl border border-hairline bg-card p-6 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="relative group flex-shrink-0">
                  <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-3xl bg-primary/20 text-primary font-medium">{name.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={generateAvatar} 
                    className="absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95"
                    title="Generate New Avatar"
                  >
                    <Dice5 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex-1 space-y-5 w-full">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 max-w-[280px]">
                        <Input 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          className="text-3xl font-display font-medium bg-transparent border-transparent hover:border-white/10 focus-visible:ring-1 focus-visible:ring-primary h-auto py-1 px-2 -ml-2"
                          placeholder="Your Name" 
                        />
                        <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none opacity-50" />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground px-1">{profile?.email}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 pt-5 border-t border-white/5">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">This Month Earnings</div>
                      <div className="font-display text-xl text-primary">{formatMoney(monthEarnings, currency)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">This Month Expenses</div>
                      <div className="font-display text-xl">{formatMoney(monthExpenses, currency)}</div>
                    </div>
                    {portfolioValue > 0 && (
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Stock Portfolio</div>
                        <div className="font-display text-xl text-blue-400">{formatMoney(portfolioValue, currency)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {profile?.email === 'hasanalijaffe@gmail.com' && (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold tracking-wider uppercase text-emerald-400 flex items-center gap-2">Admin Settings</h2>
                <div className="rounded-2xl border border-emerald-500/20 bg-card p-6 flex flex-col items-start gap-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <div>
                    <h3 className="text-foreground font-medium">Administration Panel</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manage active users and review submitted bug reports.</p>
                  </div>
                  <Button asChild className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-black">
                    <Link to="/app/admin">
                      Open Admin Panel <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </section>
            )}

            <section className="space-y-4">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground/80 flex items-center gap-2">Support & Feedback</h2>
              <div className="rounded-2xl border border-hairline bg-card p-6 flex flex-col items-start gap-4">
                <div>
                  <h3 className="text-foreground font-medium">Found a bug or need a feature?</h3>
                  <p className="text-sm text-muted-foreground mt-1">Help us improve by reporting issues or suggesting changes to the application. Console logs will be attached automatically.</p>
                </div>
                <Dialog open={bugOpen} onOpenChange={setBugOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="gap-2">
                      <Bug className="h-4 w-4" /> Report bugs & request changes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Report a Bug</DialogTitle></DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                      <Textarea placeholder="What went wrong?" value={bugMsg} onChange={e => setBugMsg(e.target.value)} className="min-h-[100px]" />
                      <p className="text-xs text-muted-foreground">Recent console logs will be attached automatically.</p>
                      <Button onClick={submitBug} disabled={bugLoading || !bugMsg} className="glow-emerald w-full">{bugLoading ? "Sending..." : "Submit Report"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </section>

            {pendingInvites.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground/80 flex items-center gap-2"><Mail className="h-4 w-4" /> Pending Invitations</h2>
                <div className="rounded-2xl border border-hairline bg-card p-6 flex flex-col gap-4">
                  {pendingInvites.map((inv: any) => (
                    <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-white/5 rounded-xl bg-background/50">
                      <div>
                        <h3 className="text-foreground font-medium">{inv.planners?.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">You have been invited as a <span className="capitalize font-medium">{inv.role}</span>.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="glow-emerald px-6" onClick={() => handleInviteAction(inv.id, 'accepted')}>Accept</Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleInviteAction(inv.id, 'declined')}>Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <Button variant="ghost" onClick={() => setSignOutOpen(true)} className="text-muted-foreground hover:text-foreground">Sign out</Button>
              <Button onClick={save} className="glow-emerald px-8">Save profile</Button>
            </div>
          </main>
        </SidebarInset>
        <MobileBottomNav />
      </div>

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
    </SidebarProvider>
  );
}
