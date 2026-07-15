import { createFileRoute, Outlet, redirect, useRouter, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Globe, Building2, Briefcase, User, Lightbulb, Dice5 } from "lucide-react";
import { CURRENCIES } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app")({
  loader: async ({ location }) => {
    if (location.pathname === "/app" || location.pathname === "/app/") {
      const { data: planners, error } = await supabase
        .from("planners")
        .select("id, is_default, created_at")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(1);

      if (error) {
        console.error("Error fetching planners:", error);
      }

      const first = planners?.[0];
      if (first) {
        throw redirect({ to: "/app/p/$plannerId/dashboard", params: { plannerId: first.id } });
      }
    }
    return null;
  },
  component: AppLayout,
});

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "Pakistan",
  "Singapore",
  "United Arab Emirates",
  "Other"
];

const SOURCES = [
  "Google Search",
  "Instagram",
  "Referral",
  "LinkedIn",
  "AI (ChatGPT, Gemini, etc.)",
  "YouTube",
  "Other"
];

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
  
  // Double-check planners in case loader ran before session was fully established
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
      router.navigate({ to: "/app/p/$plannerId/dashboard", params: { plannerId: existingPlanners[0].id }, replace: true });
    }
  }, [existingPlanners, router]);

  
  // State for onboarding fields
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(`https://api.dicebear.com/7.x/notionists/svg?seed=initial`);
  const [country, setCountry] = useState("");
  const [purpose, setPurpose] = useState<"personal" | "business" | "">("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [source, setSource] = useState("");
  const [plannerName, setPlannerName] = useState("");
  const [currency, setCurrency] = useState("USD");

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

  const handleFinish = async () => {
    try {
      if (!plannerName.trim()) {
        toast.error("Please enter a planner name");
        return;
      }
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Authentication error");
      
      // Save onboarding details to the profile
      const { error: profileError } = await supabase.from("profiles").update({
        display_name: displayName.trim() || undefined,
        avatar_url: avatarUrl,
        country,
        purpose,
        company_name: companyName,
        website,
        source
      } as any).eq("id", user.user.id);

      if (profileError) {
        console.error("Failed to save profile details:", profileError);
      }
      
      const { error } = await supabase.from("planners").insert({ 
        user_id: user.user.id, 
        name: plannerName.trim(),
        currency,
        is_default: true 
      });
      
      if (error) throw error;
      
      toast.success("Planner created successfully!");
      await router.invalidate();
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 0) {
      if (!displayName.trim()) return toast.error("Please enter your name");
      setStep(1);
    } else if (step === 1) {
      if (!country.trim()) return toast.error("Please enter your country");
      if (!purpose) return toast.error("Please select a purpose");
      if (purpose === "personal") {
        setStep(3);
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      if (!companyName.trim()) return toast.error("Please enter your business name");
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const prevStep = () => {
    if (step === 3 && purpose === "personal") {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  const containerVariants: any = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020505] relative overflow-hidden text-foreground p-4">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/bg-gradient.png')] bg-cover opacity-10 mix-blend-screen pointer-events-none" />
      
      <div className="relative w-full max-w-[480px] rounded-[32px] p-[1px] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/5 to-emerald-400/50 rounded-[32px]" />
        
        <div className="relative w-full bg-[#050a0a]/95 backdrop-blur-2xl rounded-[31px] p-8 sm:p-10 flex flex-col shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
          
          {step > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 left-6 h-8 w-8 rounded-full text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
              onClick={prevStep}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="mb-8 text-center mt-4">
             <div className="inline-flex h-12 w-12 bg-[#0b1414] rounded-xl items-center justify-center border border-white/5 mb-6">
               <img src="/favicon.png" alt="Capient" className="h-6 w-6 object-contain" />
             </div>
             <h1 className="text-2xl font-display font-medium text-white tracking-tight">
               Welcome to Capient
             </h1>
             <p className="text-muted-foreground text-sm mt-2">
               Let's set up your workspace
             </p>
          </div>

          <div className="relative flex-1">
            {/* Step Timeline */}
            <div className="flex justify-center items-center mb-8">
              {(purpose === "personal" ? [0, 1, 3, 4] : [0, 1, 2, 3, 4]).map((s, i, arr) => (
                <div key={s} className="flex items-center">
                  <div 
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${
                      step === s 
                        ? 'bg-emerald-500 text-[#030808] shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                        : step > s 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {step > s ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`w-8 sm:w-12 h-[2px] transition-all duration-500 mx-2 rounded-full ${
                      step > s ? 'bg-emerald-500/50' : 'bg-white/5'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* Step 0: Profile Setup */}
              {step === 0 && (
                <motion.div key="step-0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="flex flex-col items-center justify-center mb-6">
                    <div className="relative group">
                      <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-[#030606] shadow-xl bg-white/5 object-cover" />
                      <button 
                        onClick={() => setAvatarUrl(`https://api.dicebear.com/7.x/notionists/svg?seed=${Math.random().toString(36).substring(7)}`)} 
                        className="absolute bottom-0 right-0 p-2 bg-emerald-400 text-[#030808] rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                        title="Generate New Avatar"
                      >
                        <Dice5 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground mt-3 font-medium">Choose your avatar</span>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80 pl-1">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 z-10" />
                      <Input 
                        type="text" 
                        placeholder="e.g. Alex Stone" 
                        value={displayName} 
                        onChange={e => setDisplayName(e.target.value)} 
                        className="h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl pl-11 pr-4 text-sm transition-all" 
                        onKeyDown={e => e.key === 'Enter' && nextStep()}
                        autoFocus 
                      />
                    </div>
                  </div>
                  <Button className="w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group" onClick={nextStep}>
                    Continue <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}
              
              {/* Step 1: Country & Purpose */}
              {step === 1 && (
                <motion.div key="step-0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80 pl-1">Where are you located?</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 z-10" />
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="h-14 bg-[#030606] border-white/5 text-white focus:ring-emerald-500/30 rounded-2xl pl-11 pr-4 text-sm transition-all w-full">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#050a0a] border-white/10 text-white rounded-xl shadow-2xl w-[var(--radix-select-trigger-width)] max-h-[300px]">
                          {COUNTRIES.map(c => (
                            <SelectItem key={c} value={c} className="focus:bg-white/5 focus:text-emerald-400 cursor-pointer">
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80 pl-1">How will you use Capient?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setPurpose("personal")}
                        className={`h-24 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${purpose === "personal" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-[#030606] border-white/5 text-muted-foreground hover:border-white/20 hover:text-white"}`}
                      >
                        <User className="h-6 w-6" />
                        <span className="text-sm font-medium">Personal</span>
                      </button>
                      <button 
                        onClick={() => setPurpose("business")}
                        className={`h-24 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${purpose === "business" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-[#030606] border-white/5 text-muted-foreground hover:border-white/20 hover:text-white"}`}
                      >
                        <Briefcase className="h-6 w-6" />
                        <span className="text-sm font-medium">Business</span>
                      </button>
                    </div>
                  </div>

                  <Button className="w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group" onClick={nextStep}>
                    Continue <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Business Details */}
              {step === 2 && (
                <motion.div key="step-1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80 pl-1">Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                      <Input 
                        type="text" 
                        placeholder="e.g. Acme Corp" 
                        value={companyName} 
                        onChange={e => setCompanyName(e.target.value)} 
                        className="h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl pl-11 pr-4 text-sm transition-all" 
                        autoFocus 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80 pl-1">Website <span className="text-muted-foreground/50 font-normal">(Optional)</span></label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                      <Input 
                        type="text" 
                        placeholder="e.g. acme.com" 
                        value={website} 
                        onChange={e => setWebsite(e.target.value)} 
                        className="h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl pl-11 pr-4 text-sm transition-all" 
                      />
                    </div>
                  </div>

                  <Button className="w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group" onClick={nextStep}>
                    Continue <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {/* Step 3: Source & Notice */}
              {step === 3 && (
                <motion.div key="step-2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80 pl-1">How did you hear about us? <span className="text-muted-foreground/50 font-normal">(Optional)</span></label>
                    <Select value={source} onValueChange={setSource}>
                      <SelectTrigger className="h-14 bg-[#030606] border-white/5 text-white focus:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all w-full">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#050a0a] border-white/10 text-white rounded-xl shadow-2xl w-[var(--radix-select-trigger-width)] max-h-[300px]">
                        {SOURCES.map(s => (
                          <SelectItem key={s} value={s} className="focus:bg-white/5 focus:text-emerald-400 cursor-pointer">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-3 text-sm text-emerald-400/90 leading-relaxed mt-4">
                    <Lightbulb className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-400 mb-1">We're in active development</p>
                      <p className="text-xs mb-3">If you encounter any issues or have feedback, please let us know at the links below.</p>
                      <div className="flex gap-4">
                        <span className="text-xs font-bold text-white">Report Issue</span>
                        <span className="text-xs font-bold text-white">Give Feedback</span>
                        <span className="text-xs font-bold text-white">Support</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl group" onClick={nextStep}>
                    Almost Done <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {/* Step 4: Create Planner */}
              {step === 4 && (
                <motion.div key="step-3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                      <Briefcase className="h-8 w-8 text-emerald-400 relative z-10" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed px-4">Let's create your first planner to start tracking your finances.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-white/80 pl-1">Planner Name</label>
                      <Input 
                        type="text" 
                        placeholder={purpose === "business" ? "e.g. Acme Finances" : "e.g. Personal Budget"} 
                        value={plannerName} 
                        onChange={e => setPlannerName(e.target.value)} 
                        className="h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all" 
                        onKeyDown={e => e.key === 'Enter' && handleFinish()}
                        autoFocus 
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-white/80 pl-1">Primary Currency</label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-14 bg-[#030606] border-white/5 text-white focus:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all w-full">
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#050a0a] border-white/10 text-white rounded-xl shadow-2xl w-[var(--radix-select-trigger-width)] max-h-[300px]">
                          {CURRENCIES.map(c => (
                            <SelectItem key={c} value={c} className="focus:bg-white/5 focus:text-emerald-400 cursor-pointer">
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button className="w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group" onClick={handleFinish} disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
                      <>Create Planner <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </Button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
