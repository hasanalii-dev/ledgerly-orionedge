import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { 
  User, Dice5, Pencil, Bug, Mail, ArrowRight, Calendar, Briefcase, Lock, Key, 
  ShieldCheck, Smartphone, Clock, LogOut, Settings, Fingerprint, History, 
  CreditCard, Sparkles, Check, Copy, ExternalLink, ShieldAlert
} from "lucide-react";
import { formatMoney } from "@/lib/format";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  const [copiedId, setCopiedId] = useState(false);

  // Fetch financial summary metrics
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
    toast.success("Profile saved successfully");
    qc.invalidateQueries({ queryKey: ["profile"] });
    refetch();
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  function generateAvatar() {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
    setAvatarUrl(newAvatar);
  }

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
      <div className="min-h-screen flex w-full bg-background pb-[85px] md:pb-0 font-['Questrial',_sans-serif]">
        <div className="hidden md:flex">
          <AppSidebar />
        </div>
        <SidebarInset className="flex-1">
          {/* Desktop Header */}
          <header className="hidden md:flex sticky top-0 z-20 h-14 items-center justify-between px-6 border-b border-white/5 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-sm text-white/90">
                User Identity & Security Portal
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setSignOutOpen(true)} className="text-xs text-muted-foreground hover:text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold">
                Sign out
              </Button>
              <Button onClick={save} className="bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black px-6 h-9 rounded-xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs shadow-[0_0_15px_rgba(61,220,151,0.25)]">
                Save Changes
              </Button>
            </div>
          </header>

          {/* Mobile Top Bar */}
          <header className="md:hidden sticky top-0 z-20 h-14 flex items-center justify-between px-4 border-b border-white/5 bg-background/90 backdrop-blur-xl">
            <div className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-base text-white">
              Profile
            </div>
            <Button onClick={save} size="sm" className="bg-[#3DDC97] text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs h-8 px-4 rounded-lg">
              Save
            </Button>
          </header>

          <main className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6 md:space-y-8">
            
            {/* Title Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-['Samsung_Sharp_Sans',_sans-serif] text-2xl md:text-4xl font-bold tracking-tight text-white">
                  User Account & Identity
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm mt-1 font-['Questrial',_sans-serif]">
                  Manage your personal credentials, workspace security, and preferences.
                </p>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              
              {/* Left Column: Identity Card & Finances */}
              <div className="col-span-1 lg:col-span-7 space-y-6 lg:space-y-8">
                
                {/* Hero Profile Identity Card */}
                <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 md:p-8 group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#3DDC97]/10 blur-[100px] rounded-full pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3DDC97]/40 to-transparent" />

                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar with Randomizer */}
                    <div className="relative flex-shrink-0 group/avatar cursor-pointer" onClick={generateAvatar} title="Click to randomize avatar">
                      <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-[#3DDC97]/30 shadow-2xl transition-transform duration-300 group-hover/avatar:scale-105">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-3xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold bg-[#3DDC97]/20 text-[#3DDC97]">
                          {name.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="hidden sm:flex absolute inset-0 rounded-full bg-black/50 items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                        <Dice5 className="text-[#3DDC97] h-8 w-8 animate-spin" />
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); generateAvatar(); }} 
                        className="sm:hidden absolute bottom-0 right-0 p-2 bg-[#3DDC97] text-black rounded-full shadow-lg transition-all active:scale-95 z-20"
                      >
                        <Dice5 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* User Info Inputs */}
                    <div className="flex-1 w-full text-center sm:text-left space-y-3">
                      <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 relative max-w-sm">
                          <Input 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="text-2xl md:text-3xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white bg-transparent border-transparent hover:border-white/10 focus-visible:ring-1 focus-visible:ring-[#3DDC97] h-auto py-1 px-2 -ml-2 text-center sm:text-left"
                            placeholder="Your Name" 
                          />
                          <Pencil className="hidden sm:block h-4 w-4 text-white/30 pointer-events-none" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 font-['Questrial',_sans-serif]">
                          {profile?.email}
                        </div>
                      </div>

                      {/* Chips */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-md">
                          <Calendar className="h-3.5 w-3.5 text-[#3DDC97]" />
                          <span className="text-[11px] text-white/80 font-['Questrial',_sans-serif]">
                            Joined {format(new Date(profile?.created_at || Date.now()), "MMM yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#3DDC97]/10 border border-[#3DDC97]/20 rounded-full px-3.5 py-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#3DDC97]" />
                          <span className="text-[11px] text-[#3DDC97] font-['Samsung_Sharp_Sans',_sans-serif] font-bold">
                            Pro Active Member
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Financial Overview Card */}
                <section className="rounded-[32px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 md:p-8 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="h-5 w-5 text-[#3DDC97]" />
                      <h2 className="font-['Samsung_Sharp_Sans',_sans-serif] text-base md:text-lg font-bold text-white">
                        Financial Portfolio Snapshot
                      </h2>
                    </div>
                    <span className="text-[10px] font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full">
                      Live
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold font-['Questrial',_sans-serif]">
                        Portfolio Value
                      </div>
                      <div className="font-['Samsung_Sharp_Sans',_sans-serif] text-xl font-bold text-cyan-400">
                        {formatMoney(portfolioValue, currency)}
                      </div>
                    </div>

                    <div className="space-y-1 p-4 rounded-2xl bg-[#3DDC97]/10 border border-[#3DDC97]/20">
                      <div className="text-[10px] uppercase tracking-wider text-[#3DDC97] font-bold font-['Questrial',_sans-serif]">
                        Monthly Income
                      </div>
                      <div className="font-['Samsung_Sharp_Sans',_sans-serif] text-xl font-bold text-[#3DDC97]">
                        +{formatMoney(monthEarnings, currency)}
                      </div>
                    </div>

                    <div className="space-y-1 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                      <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold font-['Questrial',_sans-serif]">
                        Monthly Expenses
                      </div>
                      <div className="font-['Samsung_Sharp_Sans',_sans-serif] text-xl font-bold text-rose-400">
                        -{formatMoney(monthExpenses, currency)}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold tracking-wider uppercase text-white/80 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#3DDC97]" /> Pending Workspace Invites
                    </h2>
                    <div className="rounded-[28px] border border-[#3DDC97]/30 bg-[#3DDC97]/5 p-3 space-y-2">
                      {pendingInvites.map((inv: any) => (
                        <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-white/10 rounded-2xl bg-[#0c100e] shadow-lg">
                          <div>
                            <h3 className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white text-sm">{inv.planners?.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 font-['Questrial',_sans-serif]">
                              Role: <span className="capitalize font-bold text-[#3DDC97]">{inv.role}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" className="bg-[#3DDC97] text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs h-8 px-4 rounded-xl" onClick={() => handleInviteAction(inv.id, 'accepted')}>
                              Accept
                            </Button>
                            <Button size="sm" variant="ghost" className="text-rose-400 hover:bg-rose-500/10 text-xs h-8 px-3 rounded-xl" onClick={() => handleInviteAction(inv.id, 'declined')}>
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>

              {/* Right Column: Security, Preferences & Admin */}
              <div className="col-span-1 lg:col-span-5 space-y-6 lg:space-y-8">
                
                {/* Security Section */}
                <section className="rounded-[32px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
                  <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-2.5 mb-1">
                      <ShieldCheck className="h-5 w-5 text-indigo-400" />
                      <h2 className="font-['Samsung_Sharp_Sans',_sans-serif] text-base font-bold text-white">
                        Security & Credentials
                      </h2>
                    </div>
                    <p className="text-xs text-muted-foreground font-['Questrial',_sans-serif]">
                      Manage workspace passwords and authentication settings.
                    </p>
                  </div>
                  
                  <div className="p-3 space-y-1">
                    <div 
                      onClick={() => toast.info("Password update feature is managed via your OAuth identity provider.")}
                      className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Key className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-['Samsung_Sharp_Sans',_sans-serif] text-xs font-bold text-white">Update Password</div>
                          <div className="text-[11px] text-muted-foreground font-['Questrial',_sans-serif]">Change authentication credentials</div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#3DDC97]/10 flex items-center justify-center text-[#3DDC97]">
                          <Fingerprint className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-['Samsung_Sharp_Sans',_sans-serif] text-xs font-bold text-white">Two-Factor Authentication</div>
                          <div className="text-[11px] text-muted-foreground font-['Questrial',_sans-serif]">Enhanced biometric security layer</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-['Samsung_Sharp_Sans',_sans-serif] font-bold uppercase tracking-wider bg-[#3DDC97]/15 text-[#3DDC97] border border-[#3DDC97]/30">
                        Active
                      </span>
                    </div>
                  </div>
                </section>

                {/* Preferences Navigation */}
                <section className="rounded-[32px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-['Samsung_Sharp_Sans',_sans-serif] text-base font-bold text-white">
                      Global Preferences
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground font-['Questrial',_sans-serif]">
                    Customize default currency, dashboard appearance, and alert configurations.
                  </p>
                  <Button asChild variant="outline" className="w-full justify-between h-11 rounded-2xl bg-white/[0.03] border-white/10 hover:bg-white/10 text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold">
                    <Link to="/app/preferences">
                      Open Preferences Suite <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                </section>

              </div>
            </div>

            {/* Bottom Row: Mobile Actions & Bug Report Trigger */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5 pb-8">
              <Button onClick={() => setSignOutOpen(true)} variant="ghost" className="w-full sm:w-auto text-rose-400 hover:bg-rose-500/10 h-11 px-6 rounded-2xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs">
                <LogOut className="h-4 w-4 mr-2" /> Sign Out of Account
              </Button>
              <Button onClick={save} className="w-full sm:w-auto bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black h-11 px-8 rounded-2xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs shadow-[0_0_15px_rgba(61,220,151,0.25)]">
                Save Profile Changes
              </Button>
            </div>

            {/* Feedback floating button */}
            <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40">
              <Dialog open={bugOpen} onOpenChange={setBugOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black border-2 border-background shadow-[0_0_20px_rgba(61,220,151,0.4)]">
                    <Bug className="h-6 w-6" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#0a1410] border-white/10 text-white rounded-3xl font-['Questrial',_sans-serif]">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white">
                      Report Issue or Feature Request
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-3">
                    <Textarea 
                      placeholder="Describe what happened or request a feature..." 
                      value={bugMsg} 
                      onChange={e => setBugMsg(e.target.value)} 
                      className="min-h-[120px] bg-black/50 border-white/10 rounded-2xl text-xs font-['Questrial',_sans-serif] resize-none" 
                    />
                    <p className="text-[10px] text-muted-foreground bg-white/5 p-3 rounded-xl border border-white/5">
                      System logs will be automatically attached to help diagnose issues.
                    </p>
                    <Button onClick={submitBug} disabled={bugLoading || !bugMsg} className="bg-[#3DDC97] text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs h-11 rounded-2xl">
                      {bugLoading ? "Submitting..." : "Submit Report"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </SidebarInset>
        <MobileBottomNav />
      </div>

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent className="bg-[#0c100e] border-white/10 text-white rounded-3xl font-['Questrial',_sans-serif]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-lg">
              Sign out of account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-xs">
              You will be redirected back to the login screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={signOut} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold">
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
