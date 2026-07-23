import { createFileRoute, Outlet, useRouter, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, CURRENCIES } from "@/lib/format";
import { 
  User, Dice5, Globe, ArrowRight, ArrowLeft, Building2, Briefcase, 
  Sparkles, GraduationCap, Megaphone, Rocket, HeartHandshake, LayoutGrid,
  Check, Search, ShieldCheck, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  WORKSPACE_TYPES, INDUSTRIES, COMPANY_SIZES, WORKFLOW_OPTIONS, 
  PRIMARY_GOAL_OPTIONS, WorkspaceType, getCategoryPresets, getWorkspaceDefaults 
} from "@/lib/workspace-presets";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

function AppLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const isRoot = pathname === "/app" || pathname === "/app/";
  
  if (isRoot) {
    return <OnboardingWizard />;
  }

  return <Outlet />;
}

function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Check existing planners
  const { data: existingPlanners } = useQuery({
    queryKey: ["planners_check_onboarding"],
    queryFn: async () => {
      const { data, error } = await supabase.from("planners").select("id").limit(1);
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (existingPlanners && existingPlanners.length > 0) {
      router.navigate({ to: `/app/p/${existingPlanners[0].id}/dashboard` as any, replace: true });
    }
  }, [existingPlanners, router]);

  // Onboarding Form States
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(`https://api.dicebear.com/7.x/notionists/svg?seed=initial`);
  const [country, setCountry] = useState("United States");
  const [currency, setCurrency] = useState("USD");
  
  // Step 1: Workspace Type
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>("personal");
  
  // Step 2: Business Information (if business/agency/startup/freelancer)
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [companySize, setCompanySize] = useState("1");
  
  // Step 3: Industry
  const [industry, setIndustry] = useState("Marketing Agency");
  
  // Step 4: Current Workflow
  const [currentWorkflow, setCurrentWorkflow] = useState("sheets");
  
  // Step 5: Primary Goals
  const [primaryGoals, setPrimaryGoals] = useState<string[]>(["budget_better", "track_expenses"]);
  
  // Step 6: Planner Name
  const [plannerName, setPlannerName] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["onboarding_profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.user.id).maybeSingle();
      return data;
    }
  });

  useEffect(() => {
    if (profile) {
      if (profile.display_name && profile.display_name !== "User") setDisplayName(profile.display_name);
      if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  useEffect(() => {
    // Auto populate default planner name when workspaceType changes
    const typeObj = WORKSPACE_TYPES.find(t => t.id === workspaceType);
    if (typeObj && !plannerName) {
      setPlannerName(`${displayName ? displayName.split(" ")[0] + "'s" : "My"} ${typeObj.title}`);
    }
  }, [workspaceType, displayName]);

  const toggleGoal = (goalId: string) => {
    if (primaryGoals.includes(goalId)) {
      setPrimaryGoals(primaryGoals.filter(g => g !== goalId));
    } else {
      setPrimaryGoals([...primaryGoals, goalId]);
    }
  };

  const selectedWorkspaceObj = WORKSPACE_TYPES.find(w => w.id === workspaceType) || WORKSPACE_TYPES[0];
  const isBusinessOrAgency = selectedWorkspaceObj.isBusiness;

  const handleFinish = async () => {
    try {
      if (!plannerName.trim()) {
        toast.error("Please name your workspace");
        return;
      }
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Authentication session expired");

      // 1. Update Profile
      await supabase.from("profiles").update({
        display_name: displayName.trim() || undefined,
        avatar_url: avatarUrl,
        default_currency: currency,
      }).eq("id", user.user.id);

      // 2. Store full onboarding responses in user_onboarding with fail-safe fallback
      const onboardingPayload: any = {
        id: user.user.id,
        workspace_type: workspaceType,
        business_name: isBusinessOrAgency ? businessName : undefined,
        website: isBusinessOrAgency ? website : undefined,
        industry: isBusinessOrAgency ? industry : undefined,
        company_size: isBusinessOrAgency ? companySize : "1",
        country,
        default_currency: currency,
        current_workflow: currentWorkflow,
        primary_goals: primaryGoals,
        purpose: isBusinessOrAgency ? "business" : "personal",
        company_name: businessName || displayName,
      };

      const { error: onboardingErr } = await supabase.from("user_onboarding").upsert(onboardingPayload);
      if (onboardingErr && (onboardingErr.message?.includes("column") || onboardingErr.code === "PGRST204")) {
        // Fallback for minimal user_onboarding table
        await supabase.from("user_onboarding").upsert({
          id: user.user.id,
          country,
          purpose: isBusinessOrAgency ? "business" : "personal",
          company_name: businessName || displayName,
        });
      }

      // 3. Get workspace defaults & category presets
      const defaults = getWorkspaceDefaults(workspaceType);
      const categoryPresets = getCategoryPresets(workspaceType);

      // 4. Create the primary personalized planner with fail-safe fallback
      let newPlanner: any = null;
      let plannerError: any = null;

      const plannerPayload: any = {
        user_id: user.user.id,
        name: plannerName.trim(),
        currency,
        workspace_type: workspaceType,
        industry: isBusinessOrAgency ? industry : undefined,
        custom_config: {
          hideModules: defaults.hideModules,
          primaryMetrics: defaults.primaryMetrics,
          clientTerm: defaults.clientTerm,
          primaryGoals,
          currentWorkflow,
        },
        is_default: true,
      };

      const res = await supabase.from("planners").insert(plannerPayload).select("id").single();
      
      if (res.error && (res.error.message?.includes("column") || res.error.code === "PGRST204")) {
        // Fallback if custom_config / workspace_type columns do not exist in schema cache
        const resFallback = await supabase.from("planners").insert({
          user_id: user.user.id,
          name: plannerName.trim(),
          currency,
          is_default: true,
        }).select("id").single();
        newPlanner = resFallback.data;
        plannerError = resFallback.error;
      } else {
        newPlanner = res.data;
        plannerError = res.error;
      }

      if (plannerError) throw plannerError;

      // 5. Seed default categories for this planner
      if (newPlanner?.id && categoryPresets.length > 0) {
        const categoriesToInsert = categoryPresets.map(cat => ({
          planner_id: newPlanner.id,
          name: cat.name,
          color: cat.color,
          category_type: cat.type,
        }));
        await supabase.from("expense_categories").insert(categoriesToInsert as any);
      }

      toast.success("Workspace initialized!");
      if (newPlanner?.id) {
        router.navigate({ to: `/app/p/${newPlanner.id}/dashboard` as any, replace: true });
      } else {
        await router.invalidate();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize workspace");
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 0) {
      if (!displayName.trim()) return toast.error("Please enter your name");
      setStep(1);
    } else if (step === 1) {
      // Skip Business Info (Step 2) AND Industry (Step 3) for personal, student, creator, etc.
      if (isBusinessOrAgency) {
        setStep(2);
      } else {
        setStep(4);
      }
    } else if (step === 2) {
      if (isBusinessOrAgency && !businessName.trim()) return toast.error("Please enter your business or project name");
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      if (primaryGoals.length === 0) return toast.error("Please select at least one goal");
      setStep(5);
    }
  };

  const prevStep = () => {
    if (step === 4 && !isBusinessOrAgency) {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "User": return User;
      case "Briefcase": return Briefcase;
      case "Building2": return Building2;
      case "Megaphone": return Megaphone;
      case "Rocket": return Rocket;
      case "Sparkles": return Sparkles;
      case "GraduationCap": return GraduationCap;
      case "HeartHandshake": return HeartHandshake;
      default: return LayoutGrid;
    }
  };

  const containerVariants: any = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  };

  const activeStepsList = isBusinessOrAgency ? [0, 1, 2, 3, 4, 5] : [0, 1, 4, 5];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020505] relative overflow-hidden text-white p-4 font-['Questrial',_sans-serif]">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#3DDC97]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/bg-gradient.png')] bg-cover opacity-10 mix-blend-screen pointer-events-none" />
      
      <div className="relative w-full max-w-[500px] rounded-[32px] p-[1px] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/5 to-[#3DDC97]/40 rounded-[32px]" />
        
        <div className="relative w-full bg-[#050a0a]/80 backdrop-blur-2xl rounded-[31px] p-6 sm:p-10 flex flex-col shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
          
          {/* Back Button */}
          {step > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 left-6 h-8 w-8 rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
              onClick={prevStep}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Logo & Header */}
          <div className="mb-6 text-center mt-2">
            <img src="/favicon.png" alt="Capient" className="h-10 w-10 object-contain mx-auto mb-3" />
            <h1 className="text-2xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white tracking-tight">
              Welcome to Capient
            </h1>
            <p className="text-muted-foreground text-xs mt-1.5 font-['Questrial',_sans-serif]">
              Personalize your financial workspace
            </p>
          </div>

          {/* Classic Numbered Step Indicator Timeline */}
          <div className="flex justify-between items-center mb-8 w-full max-w-sm mx-auto px-2">
            {activeStepsList.map((s, i, arr) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div 
                  className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold transition-all duration-300 ${
                    step === s 
                      ? 'bg-[#3DDC97] text-black shadow-[0_0_15px_rgba(61,220,151,0.5)] scale-110' 
                      : step > s 
                        ? 'bg-[#3DDC97]/20 text-[#3DDC97] border border-[#3DDC97]/40' 
                        : 'bg-white/5 text-white/30 border border-white/5'
                  }`}
                >
                  {step > s ? (
                    <Check className="w-4 h-4 text-[#3DDC97]" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-[2px] transition-all duration-300 mx-1 rounded-full ${
                    step > s ? 'bg-[#3DDC97]/50' : 'bg-white/5'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            
            {/* STEP 0: Identity & Currency */}
            {step === 0 && (
              <motion.div key="step-0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="font-['Samsung_Sharp_Sans',_sans-serif] text-2xl font-bold text-white">Welcome to Capient</h2>
                  <p className="text-xs text-muted-foreground">Let's set up your profile and local currency.</p>
                </div>

                <div className="flex flex-col items-center justify-center my-4">
                  <div className="relative group cursor-pointer" onClick={() => setAvatarUrl(`https://api.dicebear.com/7.x/notionists/svg?seed=${Math.random().toString(36).substring(7)}`)}>
                    <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-[#3DDC97]/40 shadow-xl bg-white/5 object-cover" />
                    <button className="absolute bottom-0 right-0 p-1.5 bg-[#3DDC97] text-black rounded-full shadow-lg">
                      <Dice5 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-2">Click avatar to randomize</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Your Full Name</label>
                    <Input 
                      placeholder="e.g. Alex Vance" 
                      value={displayName} 
                      onChange={e => setDisplayName(e.target.value)} 
                      className="h-12 bg-black/60 border-white/10 text-white rounded-xl focus:border-[#3DDC97]"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Country</label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="h-12 bg-black/60 border-white/10 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0c100e] border-white/10 text-white max-h-48">
                          {COUNTRIES.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Default Currency</label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-12 bg-black/60 border-white/10 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0c100e] border-white/10 text-white max-h-48">
                          {CURRENCIES.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-12 bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-2xl" onClick={nextStep}>
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* STEP 1: Primary Use Case */}
            {step === 1 && (
              <motion.div key="step-1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="font-['Samsung_Sharp_Sans',_sans-serif] text-xl font-bold text-white">What are you using Capient for?</h2>
                  <p className="text-xs text-muted-foreground">Select your primary use case to optimize your workspace layout.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {WORKSPACE_TYPES.map(type => {
                    const IconComp = getIconComponent(type.iconName);
                    const isSelected = workspaceType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setWorkspaceType(type.id)}
                        className={`p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between relative ${
                          isSelected
                            ? "bg-[#3DDC97]/15 ring-2 ring-[#3DDC97] text-white"
                            : "bg-black/40 border border-white/10 hover:border-white/20 text-white/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-xl ${isSelected ? "bg-[#3DDC97] text-black" : "bg-white/5 text-white/70"}`}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-[#3DDC97]" />}
                        </div>
                        <div>
                          <div className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs text-white">{type.title}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{type.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button className="w-full h-12 bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-2xl" onClick={nextStep}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* STEP 2: Business Info (Conditional) */}
            {step === 2 && isBusinessOrAgency && (
              <motion.div key="step-2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="font-['Samsung_Sharp_Sans',_sans-serif] text-xl font-bold text-white">Business Information</h2>
                  <p className="text-xs text-muted-foreground">Tell us a bit about your company or freelance practice.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Business / Organization Name</label>
                    <Input 
                      placeholder="e.g. Apex Marketing Studio" 
                      value={businessName} 
                      onChange={e => setBusinessName(e.target.value)} 
                      className="h-12 bg-black/60 border-white/10 text-white rounded-xl focus:border-[#3DDC97]"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Website (Optional)</label>
                    <Input 
                      placeholder="e.g. apexmarketing.com" 
                      value={website} 
                      onChange={e => setWebsite(e.target.value)} 
                      className="h-12 bg-black/60 border-white/10 text-white rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Company Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      {COMPANY_SIZES.map(sz => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => setCompanySize(sz.id)}
                          className={`h-11 rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold border transition-all ${
                            companySize === sz.id 
                              ? "bg-[#3DDC97]/20 border-[#3DDC97] text-[#3DDC97]" 
                              : "bg-black/40 border-white/10 text-white/70 hover:bg-white/5"
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button className="w-full h-12 bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-2xl" onClick={nextStep}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* STEP 3: Industry Selection */}
            {step === 3 && (
              <motion.div key="step-3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="font-['Samsung_Sharp_Sans',_sans-serif] text-xl font-bold text-white">Select Your Industry</h2>
                  <p className="text-xs text-muted-foreground">This helps tailor category defaults and analytics.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block">Primary Industry</label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="h-12 bg-black/60 border-white/10 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0c100e] border-white/10 text-white max-h-56">
                      {INDUSTRIES.map(ind => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full h-12 bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-2xl" onClick={nextStep}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* STEP 4: Current Workflow */}
            {step === 4 && (
              <motion.div key="step-4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="font-['Samsung_Sharp_Sans',_sans-serif] text-xl font-bold text-white">How do you currently manage finances?</h2>
                  <p className="text-xs text-muted-foreground">Select your current tool for future automated import capabilities.</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {WORKFLOW_OPTIONS.map(wf => {
                    const isSelected = currentWorkflow === wf.id;
                    return (
                      <div
                        key={wf.id}
                        onClick={() => setCurrentWorkflow(wf.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? "bg-[#3DDC97]/20 border-[#3DDC97] text-white" 
                            : "bg-black/40 border-white/10 hover:border-white/20 text-white/70"
                        }`}
                      >
                        <span className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xs">{wf.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-[#3DDC97]" />}
                      </div>
                    );
                  })}
                </div>

                <Button className="w-full h-12 bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-2xl" onClick={nextStep}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* STEP 5: Primary Goals */}
            {step === 5 && (
              <motion.div key="step-5" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="font-['Samsung_Sharp_Sans',_sans-serif] text-xl font-bold text-white">What do you want Capient to help with?</h2>
                  <p className="text-xs text-muted-foreground">Select all that apply to highlight priority features.</p>
                </div>

                <div className="flex flex-wrap gap-2 max-h-[260px] overflow-y-auto p-1">
                  {PRIMARY_GOAL_OPTIONS.map(goal => {
                    const isSelected = primaryGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`px-3.5 py-2 rounded-full border text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#3DDC97] text-black border-[#3DDC97] shadow-[0_0_12px_rgba(61,220,151,0.4)]"
                            : "bg-black/40 border-white/10 text-white/70 hover:border-white/30"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        {goal.label}
                      </button>
                    );
                  })}
                </div>

                {/* Final Workspace Naming */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div>
                    <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1">Name Your First Workspace</label>
                    <Input 
                      placeholder="e.g. My Primary Workspace" 
                      value={plannerName} 
                      onChange={e => setPlannerName(e.target.value)} 
                      className="h-12 bg-black/60 border-white/10 text-white rounded-xl focus:border-[#3DDC97]"
                    />
                  </div>

                  <Button 
                    className="w-full h-12 bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-2xl shadow-[0_0_20px_rgba(61,220,151,0.3)]" 
                    onClick={handleFinish}
                    disabled={loading}
                  >
                    {loading ? "Generating Workspace..." : "Create My Workspace"}
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
