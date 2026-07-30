import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Users, Bug, CheckCircle, Clock, LineChart as LineChartIcon, Megaphone, Sparkles, Code, Image as ImageIcon, Save, Eye, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getAdConfigs, saveAdConfig, AdSlotConfig, DEFAULT_AD_SLOTS } from "@/lib/ad-config";

export const Route = createFileRoute("/_authenticated/app/admin")({
  component: AdminPanel,
});

function AdminPanel() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userChartType, setUserChartType] = useState<"bar" | "line">("bar");
  const [visitorChartType, setVisitorChartType] = useState<"bar" | "line">("line");

  const { data: dbAdSlots, refetch: refetchDbAds } = useQuery({
    queryKey: ["admin_ad_slots"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("ad_slots").select("*");
      if (error) {
        console.warn("Could not fetch ad_slots from DB:", error);
        return getAdConfigs();
      }
      const record: Record<string, AdSlotConfig> = { ...getAdConfigs() };
      (data || []).forEach((row: any) => {
        record[row.id] = {
          id: row.id,
          page: row.page,
          title: row.title,
          enabled: row.enabled,
          type: row.type,
          imageUrl: row.image_url ?? undefined,
          targetUrl: row.target_url ?? undefined,
          altText: row.alt_text ?? undefined,
          customCode: row.custom_code ?? undefined,
          badgeText: row.badge_text ?? undefined,
        };
      });
      return record;
    },
  });

  const adConfigs = dbAdSlots || getAdConfigs();

  const [selectedPlacementId, setSelectedPlacementId] = useState<string>("dashboard_banner");
  const [editingSlot, setEditingSlot] = useState<AdSlotConfig>(() => {
    const current = getAdConfigs();
    return current["dashboard_banner"] || DEFAULT_AD_SLOTS[0];
  });

  // Sync editingSlot when DB data loads
  useEffect(() => {
    if (dbAdSlots && dbAdSlots[selectedPlacementId]) {
      setEditingSlot({ ...dbAdSlots[selectedPlacementId] });
    }
  }, [dbAdSlots]);

  const handleSelectPlacement = (placementId: string) => {
    setSelectedPlacementId(placementId);
    if (adConfigs[placementId]) {
      setEditingSlot({ ...adConfigs[placementId] });
    }
  };

  const handleSaveAd = async () => {
    try {
      const payload = {
        id: editingSlot.id,
        page: editingSlot.page,
        title: editingSlot.title,
        enabled: editingSlot.enabled,
        type: editingSlot.type,
        image_url: editingSlot.imageUrl || null,
        target_url: editingSlot.targetUrl || null,
        alt_text: editingSlot.altText || null,
        custom_code: editingSlot.customCode || null,
        badge_text: editingSlot.badgeText || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any).from("ad_slots").upsert(payload);
      if (error) throw error;

      saveAdConfig(editingSlot); // local cache fallback
      qc.invalidateQueries({ queryKey: ["ad_slot"] });
      qc.invalidateQueries({ queryKey: ["admin_ad_slots"] });
      refetchDbAds();
      toast.success(`Ad placement "${editingSlot.title}" saved universally to database!`);
    } catch (err: any) {
      toast.error("Failed to save ad to database: " + err.message);
    }
  };

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { ...data, email: user.email };
    },
  });

  useEffect(() => {
    if (!profileLoading && profile?.email !== 'hasanalijaffe@gmail.com') {
      navigate({ to: "/app" });
    }
  }, [profile, profileLoading, navigate]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_admin_users");
      return data || [];
    },
    enabled: profile?.email === 'hasanalijaffe@gmail.com',
  });

  const { data: selectedUserOnboarding, isLoading: onboardingLoading } = useQuery({
    queryKey: ["admin_user_onboarding", selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return null;
      const { data } = await supabase.from("user_onboarding").select("*").eq("id", selectedUser.id).maybeSingle();
      return data || { noData: true };
    },
    enabled: !!selectedUser?.id && profile?.email === 'hasanalijaffe@gmail.com',
  });

  const { data: bugReports, isLoading: bugsLoading, error: bugsError } = useQuery({
    queryKey: ["admin_bug_reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bug_reports")
        .select(`*, profiles(display_name, avatar_url)`)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Bug reports fetch error:", error);
        throw error;
      }
      return data || [];
    },
    enabled: profile?.email === 'hasanalijaffe@gmail.com',
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin_analytics"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_analytics")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: profile?.email === 'hasanalijaffe@gmail.com',
  });

  const resolveBug = async (id: string) => {
    const { error } = await supabase.from("bug_reports").update({ status: 'resolved' }).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Bug marked as resolved");
      qc.invalidateQueries({ queryKey: ["admin_bug_reports"] });
    }
  };

  if (profileLoading || profile?.email !== 'hasanalijaffe@gmail.com') {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  // Aggregate Users by Month
  const monthlyUsers = (users || []).reduce((acc: any, user: any) => {
    const month = format(new Date(user.created_at), 'MMM yyyy');
    const existing = acc.find((a: any) => a.month === month);
    if (existing) {
      existing.users += 1;
    } else {
      acc.push({ month, users: 1 });
    }
    return acc;
  }, []).reverse();

  // Aggregate Visitors/Clicks by Day
  const dailyAnalytics = (analytics || []).reduce((acc: any, item: any) => {
    const day = format(new Date(item.created_at), 'MMM dd');
    const existing = acc.find((a: any) => a.day === day);
    if (existing) {
      if (item.event_type === 'page_view') existing.views += 1;
      if (item.event_type === 'click') existing.clicks += 1;
    } else {
      acc.push({ 
        day, 
        views: item.event_type === 'page_view' ? 1 : 0,
        clicks: item.event_type === 'click' ? 1 : 0
      });
    }
    return acc;
  }, []).reverse();

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background pb-[80px] md:pb-0">
        <div className="hidden md:flex">
          <AppSidebar />
        </div>
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-20 h-14 items-center gap-3 px-4 border-b border-hairline bg-background/80 backdrop-blur-xl flex">
            <SidebarTrigger />
            <div className="text-sm text-emerald-400 font-medium">Administration Panel</div>
          </header>

          <main className="p-4 md:p-6 max-w-5xl mx-auto w-full space-y-8">
            <div>
              <h1 className="font-display text-3xl text-emerald-400">Admin Control</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage users and system reports.</p>
            </div>

            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto max-w-2xl bg-white/5 border border-hairline p-1 gap-1">
                <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-xs sm:text-sm py-2">
                  <LineChartIcon className="h-4 w-4 mr-1.5 shrink-0" /> Analytics
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-xs sm:text-sm py-2">
                  <Users className="h-4 w-4 mr-1.5 shrink-0" /> Users
                </TabsTrigger>
                <TabsTrigger value="bugs" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-xs sm:text-sm py-2">
                  <Bug className="h-4 w-4 mr-1.5 shrink-0" /> Bugs
                </TabsTrigger>
                <TabsTrigger value="ads" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-xs sm:text-sm py-2">
                  <Megaphone className="h-4 w-4 mr-1.5 shrink-0" /> Ads
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="mt-6 space-y-6">
                
                {/* Monthly Users Chart */}
                <div className="rounded-2xl border border-hairline bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-foreground">New Users (Monthly)</h3>
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-hairline">
                      <Button variant="ghost" size="sm" className={`h-7 px-3 text-xs rounded-md ${userChartType === 'bar' ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground'}`} onClick={() => setUserChartType('bar')}>Bar</Button>
                      <Button variant="ghost" size="sm" className={`h-7 px-3 text-xs rounded-md ${userChartType === 'line' ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground'}`} onClick={() => setUserChartType('line')}>Line</Button>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                      {monthlyUsers.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          {userChartType === 'bar' ? (
                            <BarChart data={monthlyUsers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <filter id="glowBarAdmin1" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="3" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                              </defs>
                              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                              <RTooltip 
                                contentStyle={{ backgroundColor: "rgba(3, 8, 8, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", color: "white" }} 
                                itemStyle={{ color: "#3DDC97", fontWeight: 500, padding: "2px 0" }}
                                labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: "4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                              />
                              <Bar dataKey="users" fill="#3DDC97" radius={[6, 6, 0, 0]} filter="url(#glowBarAdmin1)" />
                            </BarChart>
                          ) : (
                            <LineChart data={monthlyUsers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <filter id="glowLineAdmin1" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="3" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                              </defs>
                              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                              <RTooltip 
                                contentStyle={{ backgroundColor: "rgba(3, 8, 8, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", color: "white" }} 
                                itemStyle={{ color: "#3DDC97", fontWeight: 500, padding: "2px 0" }}
                                labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: "4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: "4 4" }}
                              />
                              <Line type="natural" dataKey="users" name="Users" stroke="#3DDC97" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: "#3DDC97" }} filter="url(#glowLineAdmin1)" />
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
                    )}
                  </div>
                </div>

                {/* Daily Page Views Chart */}
                <div className="rounded-2xl border border-hairline bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-foreground">Site Visitors (Daily)</h3>
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-hairline">
                      <Button variant="ghost" size="sm" className={`h-7 px-3 text-xs rounded-md ${visitorChartType === 'bar' ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground'}`} onClick={() => setVisitorChartType('bar')}>Bar</Button>
                      <Button variant="ghost" size="sm" className={`h-7 px-3 text-xs rounded-md ${visitorChartType === 'line' ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground'}`} onClick={() => setVisitorChartType('line')}>Line</Button>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                      {dailyAnalytics.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          {visitorChartType === 'line' ? (
                            <LineChart data={dailyAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <filter id="glowLineAdmin2" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="3" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                              </defs>
                              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                              <RTooltip 
                                contentStyle={{ backgroundColor: "rgba(3, 8, 8, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", color: "white" }} 
                                itemStyle={{ color: "#7CC4FF", fontWeight: 500, padding: "2px 0" }}
                                labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: "4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: "4 4" }}
                              />
                              <Line type="natural" dataKey="views" name="Page Views" stroke="#7CC4FF" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: "#7CC4FF" }} filter="url(#glowLineAdmin2)" />
                            </LineChart>
                          ) : (
                            <BarChart data={dailyAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <filter id="glowBarAdmin2" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="3" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                              </defs>
                              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                              <RTooltip 
                                contentStyle={{ backgroundColor: "rgba(3, 8, 8, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", color: "white" }} 
                                itemStyle={{ color: "#7CC4FF", fontWeight: 500, padding: "2px 0" }}
                                labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: "4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                              />
                              <Bar dataKey="views" fill="#7CC4FF" radius={[6, 6, 0, 0]} filter="url(#glowBarAdmin2)" />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
                    )}
                  </div>
                </div>

              </TabsContent>

              <TabsContent value="users" className="mt-6 space-y-4">
                <div className="rounded-2xl border border-hairline bg-card overflow-hidden">
                  <div className="p-4 border-b border-hairline bg-white/5 flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Registered Users ({users?.length || 0})</h3>
                  </div>
                  <div className="divide-y divide-hairline">
                    {usersLoading ? (
                      <div className="p-8 text-center text-muted-foreground">Loading users...</div>
                    ) : users?.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">No users found.</div>
                    ) : (
                      users?.map(u => (
                        <div key={u.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => setSelectedUser(u)}>
                          <Avatar className="h-10 w-10 border border-white/10">
                            <AvatarImage src={u.avatar_url} />
                            <AvatarFallback>{u.display_name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{u.display_name || "Unknown"}</div>
                            <div className="text-sm text-muted-foreground truncate">{u.email}</div>
                          </div>
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            Joined {format(new Date(u.created_at), "MMM d, yyyy")}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bugs" className="mt-6 space-y-4">
                <div className="rounded-2xl border border-hairline bg-card overflow-hidden">
                  <div className="p-4 border-b border-hairline bg-white/5 flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Bug Reports ({bugReports?.length || 0})</h3>
                  </div>
                  <div className="divide-y divide-hairline">
                    {bugsError ? (
                      <div className="p-8 text-center text-red-400">Error: {(bugsError as any).message}</div>
                    ) : bugsLoading ? (
                      <div className="p-8 text-center text-muted-foreground">Loading bug reports...</div>
                    ) : bugReports?.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">No bug reports! 🎉</div>
                    ) : (
                      bugReports?.map((bug: any) => (
                        <div key={bug.id} className="p-4 sm:p-6 flex flex-col gap-4 hover:bg-white/5 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={bug.profiles?.avatar_url} />
                                <AvatarFallback>{bug.profiles?.display_name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm text-foreground">{bug.profiles?.display_name || "Unknown User"}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {bug.status === 'resolved' ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                                  <CheckCircle className="h-3 w-3" /> Resolved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md">
                                  <Clock className="h-3 w-3" /> New
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-background rounded-xl p-4 border border-hairline text-sm text-foreground whitespace-pre-wrap">
                            {bug.message}
                          </div>
                          
                          {bug.logs && (
                            <details className="text-xs text-muted-foreground">
                              <summary className="cursor-pointer hover:text-white mb-2">View Console Logs attached</summary>
                              <pre className="bg-[#050a0a] p-4 rounded-lg overflow-x-auto border border-hairline max-h-60 mt-2">
                                {bug.logs}
                              </pre>
                            </details>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-muted-foreground">
                              Reported on {format(new Date(bug.created_at), "MMM d, yyyy h:mm a")}
                            </div>
                            {bug.status !== 'resolved' && (
                              <Button size="sm" variant="outline" className="text-xs h-8 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300" onClick={() => resolveBug(bug.id)}>
                                Mark as Resolved
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* ADS & MONETIZATION TAB */}
              <TabsContent value="ads" className="mt-6 space-y-6">
                <div className="rounded-2xl border border-hairline bg-card p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline">
                    <div>
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-emerald-400" /> Ad Placements & Monetization
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Configure promotional spaces across specific app regions. Changes update in real-time.
                      </p>
                    </div>
                    <Button onClick={handleSaveAd} className="glow-emerald bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-2">
                      <Save className="h-4 w-4" /> Save Ad Placement
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Controls Column */}
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Target Region / Slot</Label>
                        <Select value={selectedPlacementId} onValueChange={handleSelectPlacement}>
                          <SelectTrigger className="bg-black/30 border-hairline text-white h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a1010] border-hairline">
                            {DEFAULT_AD_SLOTS.map(slot => (
                              <SelectItem key={slot.id} value={slot.id}>
                                {slot.title} ({slot.page})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-hairline flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-white">Enable Ad Slot</h4>
                          <p className="text-xs text-muted-foreground">Toggle visibility of this ad slot in the target tab.</p>
                        </div>
                        <Switch 
                          checked={editingSlot.enabled} 
                          onCheckedChange={(c) => setEditingSlot(s => ({ ...s, enabled: c }))} 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">Ad Format / Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={editingSlot.type === "image" ? "default" : "outline"}
                            className={editingSlot.type === "image" ? "bg-emerald-500 text-black font-bold" : "border-hairline text-white"}
                            onClick={() => setEditingSlot(s => ({ ...s, type: "image" }))}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" /> Image + Link
                          </Button>
                          <Button
                            type="button"
                            variant={editingSlot.type === "html" ? "default" : "outline"}
                            className={editingSlot.type === "html" ? "bg-emerald-500 text-black font-bold" : "border-hairline text-white"}
                            onClick={() => setEditingSlot(s => ({ ...s, type: "html" }))}
                          >
                            <Code className="h-4 w-4 mr-2" /> Custom Code / HTML
                          </Button>
                        </div>
                      </div>

                      {editingSlot.type === "image" ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Image Banner URL</Label>
                            <Input 
                              value={editingSlot.imageUrl || ""} 
                              onChange={(e) => setEditingSlot(s => ({ ...s, imageUrl: e.target.value }))}
                              placeholder="https://example.com/banner.jpg"
                              className="bg-black/30 border-hairline text-white h-10"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Destination Link URL (Target)</Label>
                            <Input 
                              value={editingSlot.targetUrl || ""} 
                              onChange={(e) => setEditingSlot(s => ({ ...s, targetUrl: e.target.value }))}
                              placeholder="https://sponsor.com"
                              className="bg-black/30 border-hairline text-white h-10"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Badge Text (e.g. SPONSORED, AD, FEATURED)</Label>
                            <Input 
                              value={editingSlot.badgeText || "SPONSORED"} 
                              onChange={(e) => setEditingSlot(s => ({ ...s, badgeText: e.target.value }))}
                              placeholder="SPONSORED"
                              className="bg-black/30 border-hairline text-white h-10 uppercase"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Custom HTML & CSS Code</Label>
                          <Textarea 
                            value={editingSlot.customCode || ""} 
                            onChange={(e) => setEditingSlot(s => ({ ...s, customCode: e.target.value }))}
                            placeholder="<div style='padding: 20px;'>Your custom ad HTML...</div>"
                            rows={8}
                            className="bg-black/40 border-hairline font-mono text-xs text-emerald-400"
                          />
                          <p className="text-[11px] text-muted-foreground">
                            You can write standard HTML elements with inline CSS styles for full customization.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Preview Column */}
                    <div className="space-y-3">
                      <Label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="h-4 w-4" /> Live Interactive Preview
                      </Label>
                      <div className="p-6 rounded-xl border border-dashed border-white/20 bg-black/40 flex flex-col justify-center min-h-[300px]">
                        {!editingSlot.enabled ? (
                          <div className="text-center py-12 text-muted-foreground text-sm">
                            <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            This ad slot is currently disabled.
                          </div>
                        ) : editingSlot.type === "image" ? (
                          <div className="relative group w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-[#3DDC97] uppercase tracking-wider">
                              <Sparkles className="w-3 h-3" />
                              {editingSlot.badgeText || "SPONSORED"}
                            </div>
                            {editingSlot.targetUrl && (
                              <div className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/70">
                                <Globe className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <img 
                              src={editingSlot.imageUrl || "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop"} 
                              alt="Ad Preview" 
                              className="w-full h-40 object-cover"
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-full overflow-hidden rounded-xl" 
                            dangerouslySetInnerHTML={{ __html: editingSlot.customCode || "<div className='p-4 text-center text-muted-foreground'>No code entered</div>" }} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
          </main>
          
          <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
            <DialogContent className="bg-card border border-hairline text-foreground max-w-md">
              <DialogHeader>
                <DialogTitle>User Profile</DialogTitle>
                <DialogDescription>Details and onboarding responses for {selectedUser?.display_name || 'Unknown'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-white/10">
                    <AvatarImage src={selectedUser?.avatar_url} />
                    <AvatarFallback>{selectedUser?.display_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">{selectedUser?.display_name || 'Unknown User'}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Joined: {selectedUser?.created_at ? format(new Date(selectedUser.created_at), "PPP") : "Unknown"}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-hairline">
                  <h4 className="text-sm font-medium mb-3 text-emerald-400">Onboarding Responses</h4>
                  {onboardingLoading ? (
                    <div className="text-sm text-muted-foreground">Loading onboarding data...</div>
                  ) : selectedUserOnboarding?.noData ? (
                    <div className="text-sm text-muted-foreground">No onboarding data available for this user.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Workspace Type</div>
                        <div className="font-medium text-[#3DDC97] capitalize">{selectedUserOnboarding?.workspace_type || selectedUserOnboarding?.purpose || "Not provided"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Industry</div>
                        <div className="font-medium">{selectedUserOnboarding?.industry || "Not provided"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Business / Company</div>
                        <div className="font-medium">{selectedUserOnboarding?.business_name || selectedUserOnboarding?.company_name || "Not provided"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Company Size</div>
                        <div className="font-medium">{selectedUserOnboarding?.company_size || "Not provided"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Country</div>
                        <div className="font-medium">{selectedUserOnboarding?.country || "Not provided"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Current Workflow</div>
                        <div className="font-medium uppercase">{selectedUserOnboarding?.current_workflow || "Not provided"}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-muted-foreground text-xs mb-1">Primary Goals</div>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(selectedUserOnboarding?.primary_goals) && selectedUserOnboarding.primary_goals.length > 0 ? (
                            selectedUserOnboarding.primary_goals.map((g: string) => (
                              <span key={g} className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-medium text-white">
                                {g.replace(/_/g, ' ')}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">None specified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
