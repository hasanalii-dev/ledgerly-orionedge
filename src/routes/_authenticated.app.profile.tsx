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
import { User, Dice5, Pencil, Bug, Mail, ArrowRight, Calendar, Briefcase, Lock, Key, Shield, ShieldCheck, Smartphone, Laptop, Clock, CheckCircle2, Trash2, LogOut, Settings, Fingerprint, History, CreditCard } from "lucide-react";
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

          <main className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl md:text-4xl tracking-tight text-white">Profile</h1>
                <p className="text-muted-foreground text-sm mt-1">Manage your identity, security, and preferences.</p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <Button variant="ghost" onClick={() => setSignOutOpen(true)} className="text-muted-foreground hover:text-white">Sign out</Button>
                <Button onClick={save} className="glow-emerald px-8 h-10 rounded-xl font-medium">Save Changes</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              
              {/* Left Column: Identity & Finances */}
              <div className="col-span-1 lg:col-span-7 space-y-6 lg:space-y-8">
                
                {/* Hero ID Card */}
                <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-card shadow-xl p-6 md:p-8 group">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

                  <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
                    <div className="relative flex-shrink-0 group/avatar cursor-pointer" onClick={generateAvatar}>
                      <Avatar className="h-32 w-32 border-[6px] border-background/50 shadow-2xl transition-transform duration-300 group-hover/avatar:scale-105">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-4xl bg-primary/20 text-primary font-medium">{name.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex absolute inset-0 rounded-full bg-black/40 items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                        <Dice5 className="text-white h-8 w-8" />
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); generateAvatar(); }} 
                        className="md:hidden absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg transition-all active:scale-95 z-20"
                      >
                        <Dice5 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex-1 w-full text-left space-y-4 pt-2">
                      <div>
                        <div className="flex items-center justify-start gap-3 relative max-w-sm">
                          <Input 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="text-3xl md:text-4xl font-display font-medium text-white bg-transparent border-transparent hover:border-white/10 focus-visible:ring-1 focus-visible:ring-primary h-auto py-1 px-2 -ml-2 text-left"
                            placeholder="Your Name" 
                          />
                          <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                        </div>
                        <div className="text-sm text-white/60 px-1 mt-1 font-medium tracking-wide">{profile?.email}</div>
                      </div>

                      <div className="flex flex-wrap items-center justify-start gap-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="text-xs text-white/80 font-medium">Member since {format(new Date(profile?.created_at || Date.now()), "MMM yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
                          <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="text-xs text-white/80 font-medium">Primary Workspace</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Financial Overview Card */}
                <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-card shadow-xl p-6 md:p-8">
                   <div className="flex items-center gap-2 mb-6">
                     <CreditCard className="h-5 w-5 text-primary" />
                     <h2 className="text-lg font-semibold tracking-wide text-white">Financial Snapshot</h2>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                     <div className="space-y-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5 min-w-0">
                       <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">Net Worth</div>
                       <div className="font-display text-xl lg:text-2xl text-blue-400 tracking-tight truncate" title={formatMoney(portfolioValue, currency)}>{formatMoney(portfolioValue, currency)}</div>
                     </div>
                     <div className="space-y-1 p-4 rounded-2xl bg-[#3DDC97]/5 border border-[#3DDC97]/10 min-w-0">
                       <div className="text-[11px] uppercase tracking-wider text-[#3DDC97]/70 font-semibold truncate">Monthly Income</div>
                       <div className="font-display text-xl lg:text-2xl text-[#3DDC97] tracking-tight truncate" title={`+${formatMoney(monthEarnings, currency)}`}>+{formatMoney(monthEarnings, currency)}</div>
                     </div>
                     <div className="space-y-1 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 min-w-0">
                       <div className="text-[11px] uppercase tracking-wider text-red-400/70 font-semibold truncate">Monthly Expenses</div>
                       <div className="font-display text-xl lg:text-2xl text-red-400 tracking-tight truncate" title={`-${formatMoney(monthExpenses, currency)}`}>-{formatMoney(monthExpenses, currency)}</div>
                     </div>
                   </div>
                </section>

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground/80 flex items-center gap-2 pl-2"><Mail className="h-4 w-4" /> Pending Invitations</h2>
                    <div className="rounded-[24px] border border-primary/20 bg-primary/5 p-2 flex flex-col gap-2">
                      {pendingInvites.map((inv: any) => (
                        <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-white/10 rounded-[20px] bg-background/80 backdrop-blur-xl shadow-lg">
                          <div>
                            <h3 className="text-foreground font-medium text-lg">{inv.planners?.name}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">You have been invited as a <span className="capitalize font-medium text-primary">{inv.role}</span>.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button size="sm" className="glow-emerald px-6 rounded-xl" onClick={() => handleInviteAction(inv.id, 'accepted')}>Accept</Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleInviteAction(inv.id, 'declined')}>Decline</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>

              {/* Right Column: Security & Preferences */}
              <div className="col-span-1 lg:col-span-5 space-y-6 lg:space-y-8">
                
                {/* Security Section */}
                <section className="rounded-[32px] border border-white/10 bg-card shadow-xl overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-indigo-400" />
                      <h2 className="text-lg font-semibold tracking-wide text-white">Security & Access</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">Manage your credentials and security settings.</p>
                  </div>
                  
                  <div className="p-2">
                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                          <Key className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Change Password</div>
                          <div className="text-xs text-muted-foreground">Update your login credentials</div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                          <Fingerprint className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Two-Factor Auth</div>
                          <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
                        </div>
                      </div>
                      <div className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-white/5 text-muted-foreground border border-white/10">Coming Soon</div>
                    </div>
                  </div>
                </section>

                {/* Preferences Link */}
                <section className="rounded-[32px] border border-white/10 bg-card shadow-xl p-6 md:p-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-zinc-400" />
                      <h2 className="text-lg font-semibold tracking-wide text-white">Preferences</h2>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Customize your default currency, themes, and notification alerts.</p>
                  <Button asChild variant="outline" className="w-full justify-between h-12 rounded-xl bg-white/[0.02] border-white/10 hover:bg-white/5">
                    <Link to="/app/preferences">
                      Open Preferences <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                </section>

              </div>
            </div>

            {/* Bottom Row: Activity, Admin */}
            <div className={`grid grid-cols-1 ${profile?.email === 'hasanalijaffe@gmail.com' ? 'md:grid-cols-2' : ''} gap-6 lg:gap-8`}>
                
                {/* Activity Log (Mock) */}
                <section className="rounded-[32px] border border-white/10 bg-card shadow-xl p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <History className="h-5 w-5 text-zinc-400" />
                    <h2 className="text-lg font-semibold tracking-wide text-white">Recent Activity</h2>
                  </div>
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#0a1410] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Smartphone className="w-4 h-4 text-primary" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-white/5 bg-white/[0.01] shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm text-white">New login</div>
                          <div className="text-[10px] text-muted-foreground">Just now</div>
                        </div>
                        <div className="text-xs text-muted-foreground">Mobile device, Safari</div>
                      </div>
                    </div>
                    
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-transparent hover:border-white/5 hover:bg-white/[0.01] transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm text-white/80">Security Check</div>
                          <div className="text-[10px] text-muted-foreground">Yesterday</div>
                        </div>
                        <div className="text-xs text-muted-foreground">Account verified</div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Admin Block */}
                {profile?.email === 'hasanalijaffe@gmail.com' && (
                  <section className="rounded-[32px] border border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.05)] p-6 md:p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold tracking-wide text-emerald-400">Admin Settings</h2>
                    </div>
                    <p className="text-sm text-emerald-500/70 mb-6 flex-1">Manage global application settings and users.</p>
                    <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-400 text-black h-12 rounded-xl font-medium mt-auto">
                      <Link to="/app/admin">Open Admin Panel</Link>
                    </Button>
                  </section>
                )}
            </div>

            {/* Mobile Actions */}
            <div className="sm:hidden flex flex-col gap-3 pt-6 border-t border-white/5 pb-8">
              <Button onClick={save} className="glow-emerald w-full h-12 rounded-xl font-medium">Save Changes</Button>
              <Button variant="ghost" onClick={() => setSignOutOpen(true)} className="text-muted-foreground hover:text-white w-full h-12">Sign out</Button>
            </div>
            
            {/* Feedback floating button */}
            <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40">
              <Dialog open={bugOpen} onOpenChange={setBugOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl glow-emerald bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-background">
                    <Bug className="h-6 w-6" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#0a1410] border-white/10 rounded-3xl">
                  <DialogHeader><DialogTitle className="text-xl tracking-tight">Report a Bug</DialogTitle></DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <Textarea placeholder="What went wrong or what feature would you like?" value={bugMsg} onChange={e => setBugMsg(e.target.value)} className="min-h-[120px] bg-black/50 border-white/10 rounded-xl resize-none" />
                    <p className="text-xs text-muted-foreground/80 bg-white/5 p-3 rounded-lg border border-white/5">Console logs will be attached automatically to help us debug.</p>
                    <Button onClick={submitBug} disabled={bugLoading || !bugMsg} className="glow-emerald w-full h-12 rounded-xl">{bugLoading ? "Sending..." : "Submit Report"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
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
