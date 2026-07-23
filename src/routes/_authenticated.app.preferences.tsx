import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CURRENCIES } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Globe, Calendar, AlertTriangle, Sparkles, Building2, Check, SlidersHorizontal } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { 
  WORKSPACE_TYPES, INDUSTRIES, WORKFLOW_OPTIONS, PRIMARY_GOAL_OPTIONS, 
  WorkspaceType, getWorkspaceDefaults 
} from "@/lib/workspace-presets";

export const Route = createFileRoute("/_authenticated/app/preferences")({
  component: PreferencesPage,
});

const DATE_FORMATS = ["yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy"];
const LOCALES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "de-DE", label: "German" },
  { value: "fr-FR", label: "French" },
  { value: "es-ES", label: "Spanish" },
];

function PreferencesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { ...data, email: user.email };
    },
  });

  const { data: onboarding, refetch: refetchOnboarding } = useQuery({
    queryKey: ["user_onboarding_pref"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return (await supabase.from("user_onboarding").select("*").eq("id", user.id).maybeSingle()).data;
    },
  });

  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("yyyy-MM-dd");
  const [locale, setLocale] = useState("en-US");
  const [signOutOpen, setSignOutOpen] = useState(false);

  // Personalization settings
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>("personal");
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("Marketing Agency");
  const [currentWorkflow, setCurrentWorkflow] = useState("sheets");
  const [primaryGoals, setPrimaryGoals] = useState<string[]>(["budget_better"]);

  useEffect(() => { 
    if (profile) { 
      setCurrency(profile.default_currency ?? "USD"); 
      setDateFormat(profile.date_format ?? "yyyy-MM-dd");
      setLocale(profile.locale ?? "en-US");
    } 
  }, [profile]);

  useEffect(() => {
    if (onboarding) {
      if (onboarding.workspace_type) setWorkspaceType(onboarding.workspace_type as WorkspaceType);
      if (onboarding.business_name || onboarding.company_name) setBusinessName(onboarding.business_name || onboarding.company_name || "");
      if (onboarding.industry) setIndustry(onboarding.industry);
      if (onboarding.current_workflow) setCurrentWorkflow(onboarding.current_workflow);
      if (Array.isArray(onboarding.primary_goals)) setPrimaryGoals(onboarding.primary_goals);
    }
  }, [onboarding]);

  const toggleGoal = (goalId: string) => {
    if (primaryGoals.includes(goalId)) {
      setPrimaryGoals(primaryGoals.filter(g => g !== goalId));
    } else {
      setPrimaryGoals([...primaryGoals, goalId]);
    }
  };

  const selectedWorkspaceObj = WORKSPACE_TYPES.find(w => w.id === workspaceType) || WORKSPACE_TYPES[0];
  const isBusinessOrAgency = selectedWorkspaceObj.isBusiness;

  async function save() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Save profile display preferences
    const { error: profileErr } = await supabase.from("profiles").upsert({ 
      id: user.id,
      default_currency: currency,
      date_format: dateFormat,
      locale: locale
    });
    if (profileErr) return toast.error(profileErr.message);

    // 2. Save user_onboarding settings
    const onboardingPayload: any = {
      id: user.id,
      workspace_type: workspaceType,
      business_name: isBusinessOrAgency ? businessName : undefined,
      industry: isBusinessOrAgency ? industry : undefined,
      current_workflow: currentWorkflow,
      primary_goals: primaryGoals,
      purpose: isBusinessOrAgency ? "business" : "personal",
    };

    const { error: onboardingErr } = await supabase.from("user_onboarding").upsert(onboardingPayload);
    if (onboardingErr && (onboardingErr.message?.includes("column") || onboardingErr.code === "PGRST204")) {
      await supabase.from("user_onboarding").upsert({
        id: user.id,
        purpose: isBusinessOrAgency ? "business" : "personal",
      });
    }

    // 3. Update active planner custom config
    const activePlannerId = profile?.last_planner_id;
    if (activePlannerId) {
      const defaults = getWorkspaceDefaults(workspaceType);
      const plannerPayload: any = {
        workspace_type: workspaceType,
        industry: isBusinessOrAgency ? industry : undefined,
        custom_config: {
          hideModules: defaults.hideModules,
          primaryMetrics: defaults.primaryMetrics,
          clientTerm: defaults.clientTerm,
          primaryGoals,
          currentWorkflow,
        }
      };
      await supabase.from("planners").update(plannerPayload).eq("id", activePlannerId);
    }

    toast.success("Preferences & Workspace settings updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: ["user_onboarding_pref"] });
    qc.invalidateQueries({ queryKey: ["planners"] });
    refetchProfile();
    refetchOnboarding();
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function deleteAccount() {
    if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and will delete all your planners and transactions.")) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      navigate({ to: "/", replace: true });
    }
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background pb-[85px] md:pb-0 font-['Questrial',_sans-serif]">
        <div className="hidden md:flex">
          <AppSidebar />
        </div>
        <SidebarInset className="flex-1">
          <header className="hidden md:flex sticky top-0 z-20 h-14 items-center justify-between px-6 border-b border-white/5 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-sm text-white">Application & Workspace Preferences</span>
            </div>
            <Button onClick={save} className="bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black px-6 h-9 rounded-xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs shadow-[0_0_15px_rgba(61,220,151,0.25)]">
              Save Settings
            </Button>
          </header>

          {/* Mobile Top Bar */}
          <header className="md:hidden sticky top-0 z-20 h-14 flex items-center justify-between px-4 border-b border-white/5 bg-background/90 backdrop-blur-xl">
            <div className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-base text-white">Preferences</div>
            <Button onClick={save} size="sm" className="bg-[#3DDC97] text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs h-8 px-4 rounded-lg">
              Save
            </Button>
          </header>

          <main className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
            <div>
              <h1 className="font-['Samsung_Sharp_Sans',_sans-serif] text-2xl md:text-3xl font-bold text-white">Application Preferences</h1>
              <p className="text-muted-foreground text-xs md:text-sm mt-1">Manage global app settings, regional formats, and workspace personalization presets.</p>
            </div>

            {/* Regional & Formatting */}
            <section className="space-y-4">
              <h2 className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold tracking-wider uppercase text-white/80 flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#3DDC97]" /> Regional & Display
              </h2>
              <div className="rounded-[24px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl p-5 md:p-6 space-y-5 shadow-xl">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-muted-foreground mb-1.5 block">Default Currency</label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="bg-black/60 border-white/10 text-white h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#0c100e] border-white/10 text-white max-h-48">{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-muted-foreground mb-1.5 block flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date Format</label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger className="bg-black/60 border-white/10 text-white h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#0c100e] border-white/10 text-white">{DATE_FORMATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-muted-foreground mb-1.5 block">Locale</label>
                    <Select value={locale} onValueChange={setLocale}>
                      <SelectTrigger className="bg-black/60 border-white/10 text-white h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#0c100e] border-white/10 text-white">{LOCALES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </section>

            {/* Workspace Personalization Settings */}
            <section className="space-y-4">
              <h2 className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold tracking-wider uppercase text-white/80 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#3DDC97]" /> Workspace Personalization Presets
              </h2>
              <div className="rounded-[24px] border border-white/10 bg-[#0c100e]/95 backdrop-blur-2xl p-5 md:p-6 space-y-6 shadow-xl">
                
                {/* Workspace Use Case */}
                <div>
                  <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white mb-2 block">Primary Workspace Use Case</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {WORKSPACE_TYPES.map(type => {
                      const isSelected = workspaceType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setWorkspaceType(type.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-[#3DDC97]/20 border-[#3DDC97] text-[#3DDC97]"
                              : "bg-black/40 border-white/10 text-white/70 hover:bg-white/5"
                          }`}
                        >
                          <span className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs">{type.title}</span>
                          {isSelected && <Check className="h-4 w-4 text-[#3DDC97]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Industry & Business (if applicable) */}
                {isBusinessOrAgency && (
                  <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white mb-1.5 block">Business / Organization Name</label>
                      <Input 
                        value={businessName} 
                        onChange={e => setBusinessName(e.target.value)} 
                        className="bg-black/60 border-white/10 text-white h-11 rounded-xl"
                        placeholder="e.g. Acme Studio"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white mb-1.5 block">Industry</label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger className="bg-black/60 border-white/10 text-white h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0c100e] border-white/10 text-white max-h-48">{INDUSTRIES.map((ind) => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Primary Goals */}
                <div className="pt-2 border-t border-white/5">
                  <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white mb-2 block">Primary Financial Goals</label>
                  <div className="flex flex-wrap gap-2">
                    {PRIMARY_GOAL_OPTIONS.map(goal => {
                      const isSelected = primaryGoals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => toggleGoal(goal.id)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-[#3DDC97] text-black border-[#3DDC97]"
                              : "bg-black/40 border-white/10 text-white/70 hover:border-white/30"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          {goal.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </section>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <Button variant="ghost" onClick={() => setSignOutOpen(true)} className="text-rose-400 hover:bg-rose-500/10 font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs h-10 px-4 rounded-xl">Sign out</Button>
              <Button onClick={save} className="bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black px-8 h-11 rounded-xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs shadow-[0_0_15px_rgba(61,220,151,0.25)]">
                Save All Preferences
              </Button>
            </div>

            {/* Danger Zone */}
            <section className="space-y-4 pt-6">
              <h2 className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold tracking-wider uppercase text-rose-400 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Danger Zone</h2>
              <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/5 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-sm">Delete Account</h3>
                  <p className="text-xs text-muted-foreground mt-1">Permanently remove your account and all associated data. This action cannot be reversed.</p>
                </div>
                <Button variant="destructive" onClick={deleteAccount} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold h-10 px-5 shrink-0">Delete Account</Button>
              </div>
            </section>
          </main>
        </SidebarInset>
        <MobileBottomNav />
      </div>

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent className="bg-[#0c100e] border-white/10 text-white rounded-3xl font-['Questrial',_sans-serif]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-lg">Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-xs">
              You will be redirected back to the login screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={signOut} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold">Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
