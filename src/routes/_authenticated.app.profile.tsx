import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CURRENCIES } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { User, Dice5, Pencil, Bug } from "lucide-react";
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

  const [name, setName] = useState(""); 
  const [avatarUrl, setAvatarUrl] = useState("");
  const [signOutOpen, setSignOutOpen] = useState(false);

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
    queryFn: async () => (await supabase.from("investments").select("quantity, current_price").eq("planner_id", activePlannerId)).data ?? [],
  });

  const monthEarnings = allocations.filter(a => a.allocation_type === "earning").reduce((s, r) => s + Number(r.amount || 0), 0);
  const monthExpenses = allocations.filter(a => a.allocation_type !== "earning").reduce((s, r) => s + Number(r.amount || 0), 0);
  const portfolioValue = investments.reduce((sum, inv) => sum + (Number(inv.quantity || 0) * Number(inv.current_price || 0)), 0);

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

            <section className="space-y-4">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground/80 flex items-center gap-2">Support & Feedback</h2>
              <div className="rounded-2xl border border-hairline bg-card p-6 flex flex-col items-start gap-4">
                <div>
                  <h3 className="text-foreground font-medium">Found a bug or need a feature?</h3>
                  <p className="text-sm text-muted-foreground mt-1">Help us improve by reporting issues or suggesting changes to the application.</p>
                </div>
                <Button variant="secondary" className="gap-2" onClick={() => window.open("mailto:support@orionedgedigital.com", "_blank")}>
                  <Bug className="h-4 w-4" /> Report bugs & request changes
                </Button>
              </div>
            </section>

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
