import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CURRENCIES } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Globe, Calendar, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

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
  const { data: profile, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("yyyy-MM-dd");
  const [locale, setLocale] = useState("en-US");
  const [signOutOpen, setSignOutOpen] = useState(false);

  useEffect(() => { 
    if (profile) { 
      setCurrency(profile.default_currency ?? "USD"); 
      setDateFormat(profile.date_format ?? "yyyy-MM-dd");
      setLocale(profile.locale ?? "en-US");
    } 
  }, [profile]);

  async function save() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ 
      id: user.id,
      default_currency: currency,
      date_format: dateFormat,
      locale: locale
    });
    if (error) return toast.error(error.message);
    toast.success("Preferences saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
    refetch();
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
      <div className="min-h-screen flex w-full bg-background pb-[80px] md:pb-0">
        <div className="hidden md:flex">
          <AppSidebar />
        </div>
        <SidebarInset className="flex-1">
          <header className="hidden md:flex sticky top-0 z-20 h-14 items-center gap-3 px-4 border-b border-hairline bg-background/80 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">Preferences</div>
          </header>

          {/* Mobile Top Bar */}
          <header className="md:hidden sticky top-0 z-20 h-14 flex items-center justify-center px-4 border-b border-white/5 bg-background/90 backdrop-blur-xl">
            <div className="font-display font-medium text-base">Preferences</div>
          </header>

          <main className="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-8">
            <div>
              <h1 className="font-display text-3xl">Application Preferences</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage global app settings like currency, formatting, and language.</p>
            </div>

            {/* Preferences */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground/80 flex items-center gap-2"><Globe className="h-4 w-4" /> Regional & Display</h2>
              <div className="rounded-2xl border border-hairline bg-card p-4 md:p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Default currency</label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="bg-background border-hairline h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date format</label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger className="bg-background border-hairline h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{DATE_FORMATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Locale</label>
                    <Select value={locale} onValueChange={setLocale}>
                      <SelectTrigger className="bg-background border-hairline h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{LOCALES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <Button variant="ghost" onClick={() => setSignOutOpen(true)} className="text-muted-foreground hover:text-foreground">Sign out</Button>
              <Button onClick={save} className="glow-emerald px-8">Save preferences</Button>
            </div>

            {/* Danger Zone */}
            <section className="space-y-4 pt-12">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Danger Zone</h2>
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-foreground font-medium">Delete Account</h3>
                  <p className="text-xs text-muted-foreground mt-1">Permanently remove your account and all associated data. This action cannot be reversed.</p>
                </div>
                <Button variant="destructive" onClick={deleteAccount} className="whitespace-nowrap w-full md:w-auto">Delete my account</Button>
              </div>
            </section>
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
