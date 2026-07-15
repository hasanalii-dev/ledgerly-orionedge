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
      { title: "Join Beta — Capient" },
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "signup" && step === 3 && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mode, step, resendTimer]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/app" });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/app" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { 
          redirectTo: `${window.location.origin}/app`,
          queryParams: {
            prompt: 'select_account'
          }
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
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
      
      // Supabase returns an empty identities array if the user already exists (to prevent enumeration, but we want to tell the user)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error("This email is already registered. Please sign in instead.");
      }
      
      if (data.session) {
        toast.success("Welcome aboard! (Auto-login: Email confirmation is disabled in Supabase)");
        // The onAuthStateChange listener will automatically redirect to /app
      } else {
        toast.success("Code sent to your email!");
        setStep(3);
        setResendTimer(60);
      }
    } catch (err: any) {
      toast.error(err.message || err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    try {
      if (otp.length < 6) return toast.error("Enter a valid verification code");
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });
      if (error) throw error;
      toast.success("Beta enrollment complete! Welcome aboard.");
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      toast.success("Verification code resent!");
      setResendTimer(60);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const containerVariants: any = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#020505] relative overflow-x-hidden text-foreground">
      
      {/* Background Image Setup */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/bg-gradient.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-[0.85]"
        />
      </div>

      {/* SideRays Magic Component */}
      <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen">
         <SideRays 
            speed={2.0}
            rayColor1="#10B981" 
            rayColor2="#34D399" 
            intensity={1.2}
            spread={1.8}
            origin="top-right"
            tilt={-15}
            saturation={1.2}
            blend={0.5}
            opacity={0.6}
         />
      </div>

      {/* Header with Return to Home */}
      <div className="relative z-20 w-full p-4 sm:p-8 flex-none">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors duration-300"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-white/5 border border-white/5 flex items-center justify-center backdrop-blur-md">
            <Home className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium hidden sm:inline">Return to Home</span>
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:px-8 pb-12 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[420px]"
        >
        {/* Glow behind the card top-right corner */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Outer wrapper for the gradient border */}
        <div className="relative w-full rounded-[32px] p-[1px] overflow-hidden shadow-2xl">
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
              {/* Plain Logo without glow */}
              <Link to="/" className="inline-flex items-center gap-2 mb-6 group cursor-pointer">
                 <div className="h-9 w-9 bg-[#0b1414] rounded-[10px] flex items-center justify-center border border-white/5">
                   <img src="/favicon.png" alt="Capient" className="h-4 w-4 object-contain" />
                 </div>
                 <span className="font-display font-semibold text-xl text-white tracking-tight">Capient</span>
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
                    <Button className="w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group" onClick={handleNextLogin}>
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
                    <Button className="w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4" onClick={handleLoginSubmit} disabled={loading}>
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
                    <Button className="w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group" onClick={handleNextSignupUsername}>
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
                    <Button className="w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group" onClick={handleNextSignupEmail}>
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
                    <Button className="w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group" onClick={handleSignupSubmit} disabled={loading || !password || !confirmPassword}>
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
                    <p className="text-sm text-white/80 mb-6 leading-relaxed">We sent an 8-digit verification code to <br/><strong className="text-emerald-400">{email}</strong>.</p>
                    <Input type="text" placeholder="• • • • • • • •" value={otp} onChange={e => setOtp(e.target.value)} className="h-16 text-center text-2xl tracking-[0.5em] font-mono bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/30 focus-visible:ring-emerald-500/30 rounded-2xl transition-all" maxLength={8} onKeyDown={e => e.key === 'Enter' && handleOtpSubmit()} autoFocus />
                    <Button className="w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-6 group" onClick={handleOtpSubmit} disabled={loading || otp.length < 6}>
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Code"}
                    </Button>
                    <div className="mt-4 flex justify-center">
                      <button
                        className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleResendCode}
                        disabled={loading || resendTimer > 0}
                      >
                        {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Link at the bottom */}
            {step === 0 && (
              <div className="mt-8 flex justify-center items-center text-sm">
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
    </div>
  );
}
