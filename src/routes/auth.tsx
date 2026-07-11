import { createFileRoute, Navigate, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Ledgerly" },
      { name: "description", content: "Sign in to your Ledgerly finance planner." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().email("Enter a valid email");
const passwordSchema = z.string().min(6, "Minimum 6 characters").max(72);

function AuthPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session) return <Navigate to="/app" replace />;

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      emailSchema.parse(email);
      if (mode !== "forgot") passwordSchema.parse(password);

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/app" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Check your inbox to confirm your email");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent");
        setMode("signin");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (res.error) throw res.error;
      if (!res.redirected) navigate({ to: "/app" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden border-r border-hairline">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, oklch(0.82 0.17 160 / 0.25), transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.72 0.14 200 / 0.15), transparent 55%)",
          }}
        />
        <div className="relative flex items-center gap-2 text-xl font-display font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          Ledgerly
        </div>
        <div className="relative space-y-6">
          <h1 className="text-5xl font-display leading-[1.05] tracking-tight">
            Your financial <span className="text-primary">operating&nbsp;system</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Track income, expenses, invoices, clients, and cash flow across unlimited planners.
            Built for entrepreneurs and agencies.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-md pt-4">
            {[
              "Multi-planner workspace",
              "Editable spreadsheet ledgers",
              "Client & project tracking",
              "Invoice & receipt vault",
            ].map((f) => (
              <div key={f} className="rounded-xl border border-hairline bg-card/40 px-4 py-3 text-sm text-muted-foreground">
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-muted-foreground">© Ledgerly. A calm space for your money.</p>
      </div>

      {/* Right auth card */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 text-lg font-display font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            Ledgerly
          </div>
          <div>
            <h2 className="text-3xl font-display tracking-tight">
              {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to open your planners."
                : mode === "signup"
                ? "Start planning in under a minute."
                : "We'll email you a reset link."}
            </p>
          </div>

          {mode !== "forgot" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-hairline bg-card hover:bg-accent"
                onClick={handleGoogle}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.4-1.68 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.09.79 3.8 1.47l2.6-2.5C16.75 3.7 14.6 2.8 12 2.8 6.9 2.8 2.75 6.95 2.75 12S6.9 21.2 12 21.2c6.9 0 9.4-4.85 9.4-7.35 0-.5-.05-.87-.12-1.25H12z" />
                </svg>
                Continue with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-hairline" /></div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-background px-3 text-muted-foreground">or</span>
                </div>
              </div>
            </>
          )}

          <Tabs value={mode === "forgot" ? "signin" : mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
            {mode !== "forgot" && (
              <TabsList className="grid w-full grid-cols-2 bg-card border border-hairline">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
            )}
            <TabsContent value={mode === "forgot" ? "signin" : mode} className="mt-4">
              <form onSubmit={handleEmail} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" className="h-11 bg-card" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-11 bg-card" />
                </div>
                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === "signin" && (
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11 bg-card" />
                  </div>
                )}
                {mode === "signin" && (
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" checked={remember} onCheckedChange={(c) => setRemember(!!c)} />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground font-normal">Remember me on this device</Label>
                  </div>
                )}
                <Button type="submit" className="w-full h-11 glow-emerald" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
                </Button>
                {mode === "forgot" && (
                  <button type="button" onClick={() => setMode("signin")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
                    ← Back to sign in
                  </button>
                )}
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our terms & privacy.{" "}
            <Link to="/" className="underline hover:text-foreground">Back home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
