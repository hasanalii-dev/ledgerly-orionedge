import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CURRENCIES } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/_authenticated/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { data: profile, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { ...data, email: user.email };
    },
  });
  const [name, setName] = useState(""); const [currency, setCurrency] = useState("USD");
  useEffect(() => { if (profile) { setName(profile.display_name ?? ""); setCurrency(profile.default_currency ?? "USD"); } }, [profile]);

  async function save() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ display_name: name, default_currency: currency }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    refetch();
  }
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-20 h-14 flex items-center gap-3 px-4 border-b border-hairline bg-background/80 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">Settings</div>
          </header>
          <main className="p-6 max-w-2xl">
            <h1 className="font-display text-3xl mb-6">Profile & preferences</h1>
            <div className="rounded-2xl border border-hairline bg-card p-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
                <div className="mt-1 text-sm">{profile?.email}</div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Display name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-background border-hairline" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Default currency</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="mt-1 bg-background border-hairline"><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={signOut} className="text-destructive">Sign out</Button>
                <Button onClick={save} className="glow-emerald">Save changes</Button>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
