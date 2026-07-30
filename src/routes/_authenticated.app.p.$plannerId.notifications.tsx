import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Bell, ArrowLeft, Calendar as CalendarIcon, Clock, AlertTriangle, 
  CheckCircle2, Plus, Filter, Trash2, FileText, Landmark, Target, 
  ShieldCheck, AlertCircle, UserPlus, ArrowUpRight, Sparkles, ExternalLink
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { formatMoney } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/notifications")({
  component: NotificationsPage,
});

export type CalendarNotificationItem = {
  id: string;
  type: 'invoice' | 'loan' | 'goal' | 'tax' | 'subscription' | 'custom' | 'invite';
  title: string;
  subtitle: string;
  date?: string;
  amount?: number;
  urgency: 'overdue' | 'today' | 'this_week' | 'upcoming';
  daysDiff: number;
  inviteData?: any;
};

function calculateUrgency(dateStr?: string): { urgency: 'overdue' | 'today' | 'this_week' | 'upcoming'; daysDiff: number } {
  if (!dateStr) return { urgency: 'upcoming', daysDiff: 99 };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) return { urgency: 'overdue', daysDiff };
  if (daysDiff === 0) return { urgency: 'today', daysDiff: 0 };
  if (daysDiff <= 7) return { urgency: 'this_week', daysDiff };
  return { urgency: 'upcoming', daysDiff };
}

function NotificationsPage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'all' | 'deadlines' | 'invites'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'overdue' | 'today' | 'this_week'>('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("capient_dismissed_notifications") || "[]");
    } catch {
      return [];
    }
  });

  // Modal State for Adding Custom Reminder / Deadline
  const [addOpen, setAddOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [eventAmount, setEventAmount] = useState("");
  const [eventKind, setEventKind] = useState<"tax" | "subscription" | "custom">("tax");
  const [eventSubtitle, setEventSubtitle] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { ...data, email: user.email };
    },
  });

  // 1. Fetch Pending Planner Invites
  const { data: pendingInvites = [] } = useQuery({
    queryKey: ["pending_invites_notifications", profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      const { data, error } = await supabase.rpc("get_pending_invites_with_details", { p_email: profile.email });
      if (error) {
        console.error("Error fetching pending invites:", error);
        return [];
      }
      return data ?? [];
    },
    enabled: !!profile?.email,
  });

  // 2. Aggregate All Calendar Deadlines & Reminders Across Planner Modules
  const { data: calendarNotifications = [] } = useQuery({
    queryKey: ["calendar_notifications", plannerId],
    queryFn: async () => {
      const [
        { data: invoices },
        { data: loans },
        { data: goals },
        { data: activityEvents },
      ] = await Promise.all([
        supabase.from("invoices").select("*").eq("planner_id", plannerId),
        supabase.from("loans" as any).select("*").eq("planner_id", plannerId),
        supabase.from("goals").select("*").eq("planner_id", plannerId),
        supabase.from("activity_events").select("*").eq("planner_id", plannerId),
      ]);

      const items: CalendarNotificationItem[] = [];

      // Invoices Due / Overdue
      (invoices ?? []).forEach((inv: any) => {
        if (inv.status !== "paid" && (inv.due_date || inv.issue_date || inv.created_at)) {
          const dt = (inv.due_date || inv.issue_date || inv.created_at).split("T")[0];
          const { urgency, daysDiff } = calculateUrgency(dt);
          items.push({
            id: `inv_${inv.id}`,
            type: "invoice",
            title: `Invoice #${inv.number} Due`,
            subtitle: `Client payment ${urgency === 'overdue' ? 'overdue' : 'pending'} (${inv.status.toUpperCase()})`,
            date: dt,
            amount: Number(inv.total_amount || 0),
            urgency,
            daysDiff,
          });
        }
      });

      // Loans Due
      (loans ?? []).forEach((l: any) => {
        if (l.due_date && Number(l.remaining_amount || 0) > 0) {
          const { urgency, daysDiff } = calculateUrgency(l.due_date);
          items.push({
            id: `loan_${l.id}`,
            type: "loan",
            title: `Loan Payment Due: ${l.name}`,
            subtitle: `Counterparty: ${l.counterparty || "Lender"}`,
            date: l.due_date,
            amount: Number(l.monthly_payment || l.remaining_amount || 0),
            urgency,
            daysDiff,
          });
        }
      });

      // Goals Target Milestone
      (goals ?? []).forEach((g: any) => {
        if (g.target_date && Number(g.current_amount || 0) < Number(g.target_amount || 0)) {
          const { urgency, daysDiff } = calculateUrgency(g.target_date);
          items.push({
            id: `goal_${g.id}`,
            type: "goal",
            title: `Goal Target Deadline: ${g.name}`,
            subtitle: `Target savings milestone date`,
            date: g.target_date,
            amount: Number(g.target_amount || 0) - Number(g.current_amount || 0),
            urgency,
            daysDiff,
          });
        }
      });

      // Custom Calendar Activity Events (Tax, Subscriptions, Deadlines)
      (activityEvents ?? []).forEach((a: any) => {
        const dt = (a.created_at || new Date().toISOString()).split("T")[0];
        const { urgency, daysDiff } = calculateUrgency(dt);
        items.push({
          id: `act_${a.id}`,
          type: (a.kind as any) || "custom",
          title: a.title,
          subtitle: a.subtitle || "Scheduled calendar deadline",
          date: dt,
          urgency,
          daysDiff,
        });
      });

      // Sort by urgency: Overdue first, then Today, then This Week, then Upcoming
      const priorityMap = { overdue: 0, today: 1, this_week: 2, upcoming: 3 };
      items.sort((a, b) => priorityMap[a.urgency] - priorityMap[b.urgency] || a.daysDiff - b.daysDiff);

      return items;
    },
    enabled: !!plannerId,
  });

  // Create Custom Calendar Reminder Mutation
  const createReminderMutation = useMutation({
    mutationFn: async () => {
      if (!eventTitle.trim()) throw new Error("Title is required");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("activity_events").insert({
        planner_id: plannerId,
        user_id: user.id,
        kind: eventKind,
        title: eventTitle,
        subtitle: eventSubtitle ? `${eventSubtitle} (${eventAmount ? formatMoney(parseFloat(eventAmount), currency) : ""})` : null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reminder added to Calendar & Notifications!");
      setAddOpen(false);
      setEventTitle("");
      setEventAmount("");
      setEventSubtitle("");
      qc.invalidateQueries({ queryKey: ["calendar_notifications", plannerId] });
      qc.invalidateQueries({ queryKey: ["financial_calendar_events", plannerId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleInviteAction = async (inviteId: string, action: 'accepted' | 'declined') => {
    const { error } = await supabase.from("planner_invites").update({ status: action }).eq("id", inviteId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Invitation ${action}`);
    qc.invalidateQueries({ queryKey: ["pending_invites_notifications"] });
    qc.invalidateQueries({ queryKey: ["planners"] });
  };

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem("capient_dismissed_notifications", JSON.stringify(updated));
    toast.success("Notification dismissed");
  };

  const handleClearAllDismissed = () => {
    setDismissedIds([]);
    localStorage.removeItem("capient_dismissed_notifications");
    toast.success("Notification history restored");
  };

  // Filter Active Items
  const activeCalendarItems = calendarNotifications.filter(i => !dismissedIds.includes(i.id));
  const activeInvites = pendingInvites.filter((inv: any) => !dismissedIds.includes(`inv_pkg_${inv.id}`));

  const overdueCount = activeCalendarItems.filter(i => i.urgency === 'overdue').length;
  const todayCount = activeCalendarItems.filter(i => i.urgency === 'today').length;
  const thisWeekCount = activeCalendarItems.filter(i => i.urgency === 'this_week').length;

  const filteredCalendarItems = activeCalendarItems.filter(i => {
    if (urgencyFilter === 'overdue') return i.urgency === 'overdue';
    if (urgencyFilter === 'today') return i.urgency === 'today';
    if (urgencyFilter === 'this_week') return i.urgency === 'this_week' || i.urgency === 'today' || i.urgency === 'overdue';
    return true;
  });

  const totalActiveNotificationsCount = activeCalendarItems.length + activeInvites.length;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] font-['Questrial',_sans-serif]">
      <div className="relative z-10 space-y-6 max-w-5xl mx-auto pb-20 pt-6 px-4 sm:px-0">
        
        {/* Top Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="rounded-full bg-white/5 hover:bg-white/10 text-white">
              <Link to="/app/p/$plannerId/dashboard" params={{ plannerId }}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold tracking-tight text-white flex items-center gap-2.5">
                <Bell className="h-7 w-7 text-[#3DDC97]" />
                Notifications & Calendar Reminders
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                Upcoming deadlines, bills, loan payments, tax dates & planner invitations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button 
              size="sm" 
              onClick={() => setAddOpen(true)} 
              className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold gap-1.5 h-9 px-3 text-xs rounded-xl"
            >
              <Plus className="h-4 w-4" /> Add Reminder
            </Button>

            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate({ to: `/app/p/${plannerId}/calendar`, params: { plannerId } })}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold gap-1.5 h-9 px-3 text-xs rounded-xl"
            >
              <CalendarIcon className="h-4 w-4 text-[#3DDC97]" /> View Calendar
            </Button>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#111312] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Total Active</span>
              <Bell className="h-4 w-4 text-[#3DDC97]" />
            </div>
            <div className="text-2xl sm:text-3xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white mt-2">
              {totalActiveNotificationsCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111312] border border-red-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-red-400 font-medium">
              <span>Overdue</span>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-red-400 mt-2">
              {overdueCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111312] border border-yellow-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-yellow-400 font-medium">
              <span>Due This Week</span>
              <Clock className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-yellow-400 mt-2">
              {thisWeekCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111312] border border-emerald-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#3DDC97] font-medium">
              <span>Invites</span>
              <UserPlus className="h-4 w-4 text-[#3DDC97]" />
            </div>
            <div className="text-2xl sm:text-3xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-[#3DDC97] mt-2">
              {activeInvites.length}
            </div>
          </div>
        </div>

        {/* Tab Filters & Urgency Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/5 self-start">
            <button
              onClick={() => setTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold transition-all ${
                tab === 'all'
                  ? "bg-[#3DDC97] text-black shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              All ({totalActiveNotificationsCount})
            </button>
            <button
              onClick={() => setTab('deadlines')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold transition-all ${
                tab === 'deadlines'
                  ? "bg-[#3DDC97] text-black shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Deadlines & Reminders ({activeCalendarItems.length})
            </button>
            <button
              onClick={() => setTab('invites')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold transition-all ${
                tab === 'invites'
                  ? "bg-[#3DDC97] text-black shadow-md"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Invitations ({activeInvites.length})
            </button>
          </div>

          {(tab === 'all' || tab === 'deadlines') && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Filter:
              </span>
              <Select value={urgencyFilter} onValueChange={(v: any) => setUrgencyFilter(v)}>
                <SelectTrigger className="w-[140px] bg-black/60 border-white/10 text-white rounded-xl h-8 text-xs">
                  <SelectValue placeholder="Filter severity..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0c100e] border-white/10 text-white rounded-xl">
                  <SelectItem value="all">All Reminders</SelectItem>
                  <SelectItem value="overdue">Overdue Only</SelectItem>
                  <SelectItem value="today">Due Today</SelectItem>
                  <SelectItem value="this_week">Due Within 7 Days</SelectItem>
                </SelectContent>
              </Select>

              {dismissedIds.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearAllDismissed}
                  className="text-xs text-muted-foreground hover:text-white h-8 px-2"
                  title="Restore dismissed notifications"
                >
                  Clear Dismissed ({dismissedIds.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Notification Feed */}
        {totalActiveNotificationsCount === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-[#111312] p-12 text-center flex flex-col items-center justify-center my-6">
            <div className="h-16 w-16 bg-[#3DDC97]/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-[#3DDC97]" />
            </div>
            <h3 className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-lg text-white">You're completely caught up!</h3>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-md">
              No pending invitations or urgent calendar deadlines at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">

            {/* Render Invitations */}
            {(tab === 'all' || tab === 'invites') && activeInvites.map((inv: any) => (
              <div 
                key={inv.id} 
                className="bg-[#111312] border border-white/10 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#3DDC97]/40"
              >
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 bg-[#3DDC97]/10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 border border-[#3DDC97]/20">
                    <UserPlus className="h-5 w-5 text-[#3DDC97]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3DDC97]/20 text-[#3DDC97] border border-[#3DDC97]/30">
                        Planner Invitation
                      </span>
                    </div>
                    <h3 className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-base text-white mt-1">
                      Collaboration Request for <span className="text-[#3DDC97]">{inv.planner_name}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <strong className="text-white">{inv.inviter_email}</strong> invited you to collaborate on their planner workspace.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button size="sm" className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold rounded-xl text-xs" onClick={() => handleInviteAction(inv.id, 'accepted')}>
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10 rounded-xl text-xs" onClick={() => handleInviteAction(inv.id, 'declined')}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}

            {/* Render Calendar Reminders & Deadlines */}
            {(tab === 'all' || tab === 'deadlines') && filteredCalendarItems.map((item) => {
              const isOverdue = item.urgency === 'overdue';
              const isToday = item.urgency === 'today';
              const isThisWeek = item.urgency === 'this_week';

              const IconComponent = 
                item.type === 'invoice' ? FileText :
                item.type === 'loan' ? Landmark :
                item.type === 'goal' ? Target :
                item.type === 'tax' ? AlertCircle :
                item.type === 'subscription' ? Clock : ShieldCheck;

              return (
                <div 
                  key={item.id} 
                  className={`bg-[#111312] border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isOverdue 
                      ? "border-red-500/40 bg-red-500/[0.03]" 
                      : isToday 
                        ? "border-orange-500/40 bg-orange-500/[0.03]" 
                        : isThisWeek 
                          ? "border-yellow-500/30 bg-yellow-500/[0.02]" 
                          : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      isOverdue 
                        ? "bg-red-500/15 border-red-500/30 text-red-400" 
                        : isToday 
                          ? "bg-orange-500/15 border-orange-500/30 text-orange-400" 
                          : isThisWeek 
                            ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-400" 
                            : "bg-[#3DDC97]/15 border-[#3DDC97]/30 text-[#3DDC97]"
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isOverdue 
                            ? "bg-red-500/20 text-red-400 border-red-500/30" 
                            : isToday 
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/30" 
                              : isThisWeek 
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
                                : "bg-[#3DDC97]/20 text-[#3DDC97] border-[#3DDC97]/30"
                        }`}>
                          {isOverdue 
                            ? `Overdue by ${Math.abs(item.daysDiff)} ${Math.abs(item.daysDiff) === 1 ? 'day' : 'days'}` 
                            : isToday 
                              ? 'Due Today' 
                              : `Due in ${item.daysDiff} ${item.daysDiff === 1 ? 'day' : 'days'}`}
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {item.type}
                        </span>
                      </div>

                      <h3 className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-base text-white">
                        {item.title}
                      </h3>

                      <p className="text-xs text-muted-foreground">
                        {item.subtitle} {item.date && `· Date: ${item.date}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {item.amount !== undefined && item.amount > 0 && (
                      <div className="text-right hidden sm:block mr-2">
                        <span className="text-[10px] text-muted-foreground font-medium block">Amount</span>
                        <span className="text-sm font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white">
                          {formatMoney(item.amount, currency)}
                        </span>
                      </div>
                    )}

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate({ to: `/app/p/${plannerId}/calendar`, params: { plannerId } })}
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl text-xs gap-1.5 h-8"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#3DDC97]" /> Calendar
                    </Button>

                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDismiss(item.id)}
                      className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl text-xs h-8 px-2"
                      title="Dismiss notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* Add Custom Calendar Reminder Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[#0c100e] border-white/10 text-white rounded-3xl font-['Questrial',_sans-serif]">
          <DialogHeader>
            <DialogTitle className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-lg text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-[#3DDC97]" /> Add Calendar Reminder / Deadline
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Reminder Title</label>
              <Input 
                value={eventTitle} 
                onChange={(e) => setEventTitle(e.target.value)} 
                placeholder="e.g. Q3 Estimated Tax Filing / AWS Renewal" 
                className="bg-black/60 border-white/10 text-white rounded-xl focus:border-[#3DDC97] text-xs" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Category</label>
                <Select value={eventKind} onValueChange={(v: any) => setEventKind(v)}>
                  <SelectTrigger className="bg-black/60 border-white/10 text-white rounded-xl text-xs">
                    <SelectValue placeholder="Category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c100e] border-white/10 text-white rounded-xl">
                    <SelectItem value="tax">Tax Deadline</SelectItem>
                    <SelectItem value="subscription">Subscription / Bill</SelectItem>
                    <SelectItem value="custom">Custom Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Target Date</label>
                <Input 
                  type="date"
                  value={eventDate} 
                  onChange={(e) => setEventDate(e.target.value)} 
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-[#3DDC97] text-xs" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Associated Amount (Optional)</label>
              <Input 
                type="number"
                value={eventAmount} 
                onChange={(e) => setEventAmount(e.target.value)} 
                placeholder="0.00" 
                className="bg-black/60 border-white/10 text-white rounded-xl focus:border-[#3DDC97] text-xs" 
              />
            </div>

            <div>
              <label className="text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white/80 block mb-1.5">Notes / Description (Optional)</label>
              <Input 
                value={eventSubtitle} 
                onChange={(e) => setEventSubtitle(e.target.value)} 
                placeholder="e.g. IRS quarterly payment due" 
                className="bg-black/60 border-white/10 text-white rounded-xl focus:border-[#3DDC97] text-xs" 
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)} className="rounded-xl text-xs font-bold text-muted-foreground hover:text-white">Cancel</Button>
            <Button onClick={() => createReminderMutation.mutate()} className="bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black rounded-xl text-xs font-['Samsung_Sharp_Sans',_sans-serif] font-bold">
              Save to Calendar & Notifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
