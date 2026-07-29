import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Mail, Home, Dice5, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SideRays from "@/components/magic/SideRays";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Join Beta | Capient" },
      { name: "description", content: "Join the Capient Beta program." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthBetaPage,
});

const emailSchema = z.string().email("Enter a valid email");
const passwordSchema = z.string().min(6, "Minimum 6 characters");

function AuthBetaPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(`https://api.dicebear.com/7.x/notionists/svg?seed=initial`);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Google OAuth Popup & Branded Modal State
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [popupUrl, setPopupUrl] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "signup" && step === 3 && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mode, step, resendTimer]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setGoogleModalOpen(false);
        navigate({ to: "/app" });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) {
        setGoogleModalOpen(false);
        navigate({ to: "/app" });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const openGooglePopup = (url: string) => {
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    return window.open(
      url,
      "Capient_Google_Auth",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      localStorage.setItem("force_onboarding", "true");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { 
          redirectTo: `${window.location.origin}/app?setup=true`,
          queryParams: {
            prompt: 'select_account'
          },
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        setPopupUrl(data.url);
        setGoogleModalOpen(true);
        const popup = openGooglePopup(data.url);
        if (!popup || popup.closed || typeof popup.closed === "undefined") {
          toast.info("Please allow pop-ups for Capient to complete Google Sign In");
        }
      } else {
        window.location.href = `${window.location.origin}/app?setup=true`;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start Google sign-in");
      setLoading(false);
      setGoogleModalOpen(false);
    }
  };

  const handleNextLogin = () => {
    try {
      emailSchema.parse(email);
      setStep(1);
    } catch (err: any) {
      toast.error(err.errors[0].message);
    }
  };

  const handleLoginSubmit = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const handleNextSignupUsername = () => {
    if (username.length < 3) return toast.error("Username must be at least 3 characters");
    setStep(1);
  };

  const handleNextSignupEmail = () => {
    try {
      emailSchema.parse(email);
      setStep(2);
    } catch (err: any) {
      toast.error(err.errors[0].message);
    }
  };

  const handleSignupSubmit = async () => {
    try {
      passwordSchema.parse(password);
      if (password !== confirmPassword) throw new Error("Passwords do not match");
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: username, full_name: username, name: username, avatar_url: avatarUrl },
        },
      });
      
      if (error) throw error;
      localStorage.setItem("force_onboarding", "true");
      
      // Supabase returns an empty identities array if the user already exists (to prevent enumeration, but we want to tell the user)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error("This email is already registered. Please sign in instead.");
      }

      setStep(3); // Move to OTP confirmation step
      setResendTimer(60);
      toast.success("Account created! Check your email for OTP.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (otp.length < 6) return toast.error("Enter the 6-digit OTP code");
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });
      if (error) throw error;
      toast.success("Email verified successfully!");
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      if (resendTimer > 0) return;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      toast.success("New OTP code sent!");
      setResendTimer(60);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const isStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020505] relative overflow-hidden text-white p-4 font-['Questrial',_sans-serif]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/bg-gradient.png')] bg-cover opacity-15 mix-blend-screen pointer-events-none" />
      
      {/* Side Ambient Rays */}
      <SideRays />

      {/* Top Left Navigation Header */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-white transition-colors bg-white/5 border border-white/10 px-3.5 py-2 rounded-full backdrop-blur-md hover:bg-white/10 shadow-lg"
        >
          <Home className="h-3.5 w-3.5 text-emerald-400" /> Back to Home
        </Link>
      </div>

      <div className="relative w-full max-w-[440px]">
        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full rounded-[32px] p-[1px] shadow-2xl overflow-hidden"
        >
          {/* Top-Right heavy gradient border */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/5 to-emerald-400/70" />
          
          {/* Inner card surface */}
          <div className="relative w-full h-full bg-[#050a0a]/90 backdrop-blur-2xl rounded-[31px] p-6 sm:p-8 pb-8 sm:pb-10 flex flex-col shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
            
            {/* Back Button for multi-step */}
            {step > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-6 left-6 h-8 w-8 rounded-full text-muted-foreground hover:bg-white/5 hover:text-white z-50 transition-colors"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <div className="mb-8 text-center mt-2 flex flex-col items-center">
              {/* Full Logo */}
              <Link to="/" className="inline-flex items-center justify-center mb-6 group cursor-pointer">
                 <img src="/logo.png" alt="Capient" className="h-10 w-auto object-contain" />
              </Link>
              <h1 className="text-3xl font-display font-medium text-white tracking-tight">
                {mode === "login" ? "Welcome back" : "Join the Beta"}
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                {mode === "login" ? "Sign in to access your ledger" : "Secure your spot in the early access program"}
              </p>
            </div>

            <div className="relative flex-1">
              
              {/* --- STEP TIMELINE FOR SIGNUP --- */}
              {mode === "signup" && (
                <div className="flex items-center justify-center mb-8 px-2">
                  {[0, 1, 2, 3].map((s, i) => (
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
                          s + 1
                        )}
                      </div>
                      {i < 3 && (
                        <div className={`w-8 sm:w-12 h-[2px] transition-all duration-500 mx-2 rounded-full ${
                          step > s ? 'bg-emerald-500/50' : 'bg-white/5'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                
                {/* --- LOGIN FLOW --- */}
                {mode === "login" && step === 0 && (
                  <motion.div key="login-0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    <Button variant="outline" className="w-full h-14 bg-[#0a1212] border-white/5 hover:bg-white/5 text-white/90 rounded-2xl font-medium transition-all" onClick={handleGoogleSignIn} disabled={loading}>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      Continue with Google
                    </Button>
                    
                    <div className="relative py-3">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                      <div className="relative flex justify-center text-[10px] uppercase font-semibold tracking-widest"><span className="bg-[#050a0a] px-3 text-muted-foreground/50">Or continue with</span></div>
                    </div>

                    <div className="space-y-3">
                      <Input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all" onKeyDown={e => e.key === 'Enter' && handleNextLogin()} autoFocus />
                    </div>
                    <Button className="w-full h-14 bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-[#030808] font-semibold text-base rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_20px_rgba(52,211,153,0.3)] border border-emerald-300/50 mt-4 group" onClick={handleNextLogin}>
                      Continue <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                )}

                {mode === "login" && step === 1 && (
                  <motion.div key="login-1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-emerald-400">{email}</span>
                        <button onClick={() => setStep(0)} className="text-xs text-muted-foreground hover:text-white transition-colors">Edit</button>
                      </div>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 pr-12 text-sm transition-all" onKeyDown={e => e.key === 'Enter' && handleLoginSubmit()} autoFocus />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <Button className="w-full h-14 bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-[#030808] font-semibold text-base rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_20px_rgba(52,211,153,0.3)] border border-emerald-300/50 mt-4" onClick={handleLoginSubmit} disabled={loading}>
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
                    </Button>
                    <div className="text-center mt-4">
                      <button className="text-sm text-muted-foreground hover:text-white transition-colors">Forgot your password?</button>
                    </div>
                  </motion.div>
                )}


                {/* --- SIGNUP FLOW --- */}
                {mode === "signup" && step === 0 && (
                  <motion.div key="signup-0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    <Button variant="outline" className="w-full h-14 bg-[#0a1212] border-white/5 hover:bg-white/5 text-white/90 rounded-2xl font-medium transition-all" onClick={handleGoogleSignIn} disabled={loading}>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      Sign up with Google
                    </Button>

                    <div className="relative py-3">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                      <div className="relative flex justify-center text-[10px] uppercase font-semibold tracking-widest"><span className="bg-[#050a0a] px-3 text-muted-foreground/50">Or continue with email</span></div>
                    </div>

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
                      <label className="text-sm font-medium text-white/80 pl-1">Choose your Name</label>
                      <Input type="text" placeholder="e.g. Alex Stone" value={username} onChange={e => setUsername(e.target.value)} className="h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all" onKeyDown={e => e.key === 'Enter' && handleNextSignupUsername()} autoFocus />
                    </div>
                    <Button className="w-full h-14 bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-[#030808] font-semibold text-base rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_20px_rgba(52,211,153,0.3)] border border-emerald-300/50 mt-4 group" onClick={handleNextSignupUsername}>
                      Next <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                )}

                {mode === "signup" && step === 1 && (
                  <motion.div key="signup-1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-white/80 pl-1">What's your email?</label>
                      <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all" onKeyDown={e => e.key === 'Enter' && handleNextSignupEmail()} autoFocus />
                    </div>
                    <Button className="w-full h-14 bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-[#030808] font-semibold text-base rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_20px_rgba(52,211,153,0.3)] border border-emerald-300/50 mt-4 group" onClick={handleNextSignupEmail}>
                      Next <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                )}

                {mode === "signup" && step === 2 && (
                  <motion.div key="signup-2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-white/80 pl-1">Create a secure password</label>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 pr-12 text-sm transition-all" autoFocus />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {password.length > 0 && (
                          <div className="flex items-center gap-2 px-1 pt-1">
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${password.length >= 6 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500/50'}`} />
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${isStrong ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${isStrong && password.length >= 12 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="relative">
                          <Input type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 pr-12 text-sm transition-all" onKeyDown={e => e.key === 'Enter' && handleSignupSubmit()} />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full h-14 bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-[#030808] font-semibold text-base rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_20px_rgba(52,211,153,0.3)] border border-emerald-300/50 mt-4 group" onClick={handleSignupSubmit} disabled={loading || !password || !confirmPassword}>
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
                    </Button>
                  </motion.div>
                )}

                {mode === "signup" && step === 3 && (
                  <motion.div key="signup-3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4 text-center py-4">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                      <Mail className="h-8 w-8 text-emerald-400 relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Check your email</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      We sent a 6-digit confirmation code to <span className="text-white font-medium">{email}</span>.
                    </p>

                    <div className="space-y-4 pt-4">
                      <Input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="h-14 text-center text-xl font-mono tracking-[0.5em] bg-[#030606] border-white/10 text-white placeholder:text-muted-foreground/30 placeholder:tracking-normal focus-visible:ring-emerald-500/30 rounded-2xl transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                        autoFocus
                      />

                      <Button
                        className="w-full h-14 bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-[#030808] font-semibold text-base rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_20px_rgba(52,211,153,0.3)] border border-emerald-300/50"
                        onClick={handleVerifyOtp}
                        disabled={loading || otp.length < 6}
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Email & Continue"}
                      </Button>

                      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pt-2">
                        <span>Didn't receive a code?</span>
                        <button
                          onClick={handleResendOtp}
                          disabled={resendTimer > 0}
                          className={`font-semibold transition-colors ${resendTimer > 0 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-emerald-400 hover:text-emerald-300'}`}
                        >
                          {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Mode Toggle Footer */}
              {step === 0 && (
                <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs">
                  {mode === "login" ? (
                    <>
                      <span className="text-muted-foreground/70">Don't Have An Account? </span>
                      <button 
                        className="ml-1 text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
                        onClick={() => {
                          setMode("signup");
                          setStep(0);
                          setEmail("");
                          setPassword("");
                        }}
                      >
                        Enroll in Beta
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground/70">Already Have An Account? </span>
                      <button 
                        className="ml-1 text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
                        onClick={() => {
                          setMode("login");
                          setStep(0);
                          setEmail("");
                          setPassword("");
                          setConfirmPassword("");
                          setUsername("");
                        }}
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              )}
              
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- CAPIENT GOOGLE AUTH BRANDED MODAL --- */}
      <AnimatePresence>
        {googleModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl font-['Questrial',_sans-serif]"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md bg-[#050a0a] border border-emerald-500/30 rounded-[32px] p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center overflow-hidden"
            >
              {/* Glow backdrop inside modal */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

              {/* Branding header with connecting nodes */}
              <div className="relative flex items-center justify-center gap-6 my-4">
                {/* Capient Logo */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <img src="/side-bar-logo.png" alt="Capient" className="h-7 w-auto object-contain" />
                </div>

                {/* Animated Connecting Pulse Line */}
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="w-8 h-[2px] bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                </div>

                {/* Google Logo Container */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg">
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
              </div>

              {/* Modal Info */}
              <h3 className="font-display font-semibold text-xl text-white mt-4">Connecting with Google</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Please complete sign-in in the Google pop-up window. Your Capient workspace will initialize automatically once authenticated.
              </p>

              {/* Spinner & Progress */}
              <div className="flex items-center justify-center gap-3 my-6 text-emerald-400 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 py-2.5 px-4 rounded-xl border border-emerald-500/20">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                Awaiting Google Authorization...
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {popupUrl && (
                  <Button
                    variant="outline"
                    onClick={() => openGooglePopup(popupUrl)}
                    className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-semibold"
                  >
                    Re-open Pop-up Window
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => {
                    setGoogleModalOpen(false);
                    setLoading(false);
                  }}
                  className="w-full text-xs text-muted-foreground hover:text-white"
                >
                  Cancel Authentication
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
