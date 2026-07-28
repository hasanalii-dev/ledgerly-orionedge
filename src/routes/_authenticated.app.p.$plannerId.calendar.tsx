import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { formatMoney, formatDate } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock,
  FileText, TrendingUp, TrendingDown, Target, Landmark, ShieldCheck, AlertCircle, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO
} from "date-fns";
import { exportToExcel } from "@/lib/export-excel";

type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  amount?: number | null;
  kind: "income" | "expense" | "loan" | "invoice" | "goal" | "tax" | "subscription" | "custom";
  subtitle?: string;
};

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  income: { bg: "bg-emerald-500/15", text: "text-[#3DDC97]", border: "border-emerald-500/30" },
  expense: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
  loan: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" },
  invoice: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  goal: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30" },
  tax: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  subscription: { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/30" },
  custom: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
};

function FinancialCalendarPage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);
  const qc = useQueryClient();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addOpen, setAddOpen] = useState(false);

  // Form State for custom financial event
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [eventAmount, setEventAmount] = useState("");
  const [eventKind, setEventKind] = useState<any>("tax");
  const [eventSubtitle, setEventSubtitle] = useState("");

  // Aggregate all planner events across modules
  const { data: events = [] } = useQuery({
    queryKey: ["financial_calendar_events", plannerId],
    queryFn: async () => {
      const [
        { data: income },
        { data: expenses },
        { data: loans },
        { data: invoices },
        { data: goals },
        { data: activityEvents },
      ] = await Promise.all([
        supabase.from("income_entries").select("*").eq("planner_id", plannerId),
        supabase.from("expense_entries").select("*").eq("planner_id", plannerId),
        supabase.from("loans" as any).select("*").eq("planner_id", plannerId),
        supabase.from("invoices").select("*").eq("planner_id", plannerId),
        supabase.from("goals").select("*").eq("planner_id", plannerId),
        supabase.from("activity_events").select("*").eq("planner_id", plannerId),
      ]);

      const allEvents: CalendarEvent[] = [];

      (income ?? []).forEach((i: any) => {
        if (i.date) {
          allEvents.push({
            id: `inc_${i.id}`,
            title: i.description || "Income Payout",
            date: i.date,
            amount: Number(i.amount || 0),
            kind: "income",
            subtitle: "Received Income",
          });
        }
      });

      (expenses ?? []).forEach((e: any) => {
        if (e.date) {
          allEvents.push({
            id: `exp_${e.id}`,
            title: e.description || e.vendor || "Expense Bill",
            date: e.date,
            amount: Number(e.amount || 0),
            kind: "expense",
            subtitle: e.vendor ? `Vendor: ${e.vendor}` : "Bill Payment",
          });
        }
      });

      (loans ?? []).forEach((l: any) => {
        if (l.due_date) {
          allEvents.push({
            id: `loan_${l.id}`,
            title: `Loan Due: ${l.name}`,
            date: l.due_date,
            amount: Number(l.monthly_payment || l.remaining_amount || 0),
            kind: "loan",
            subtitle: `Counterparty: ${l.counterparty}`,
          });
        }
      });

      (invoices ?? []).forEach((inv: any) => {
        if (inv.due_date || inv.issue_date || inv.created_at) {
          const dt = (inv.due_date || inv.issue_date || inv.created_at).split("T")[0];
          allEvents.push({
            id: `inv_${inv.id}`,
            title: `Invoice #${inv.number}`,
            date: dt,
            amount: Number(inv.total_amount || 0),
            kind: "invoice",
            subtitle: `Status: ${inv.status.toUpperCase()}`,
          });
        }
      });

      (goals ?? []).forEach((g: any) => {
        if (g.target_date) {
          allEvents.push({
            id: `goal_${g.id}`,
            title: `Goal Target: ${g.name}`,
            date: g.target_date,
            amount: Number(g.target_amount || 0),
            kind: "goal",
            subtitle: "Savings Target Milestone",
          });
        }
      });

      (activityEvents ?? []).forEach((a: any) => {
        if (a.kind === "tax" || a.kind === "subscription" || a.kind === "custom") {
          const dt = (a.created_at || new Date().toISOString()).split("T")[0];
          allEvents.push({
            id: `act_${a.id}`,
            title: a.title,
            date: dt,
            kind: (a.kind as any) || "custom",
            subtitle: a.subtitle || "Custom Scheduled Deadline",
          });
        }
      });

      return allEvents;
    },
  });

  // Post custom event mutation
  const createCustomEventMutation = useMutation({
    mutationFn: async () => {
      if (!eventTitle) throw new Error("Title is required");
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
      toast.success("Deadline added to Financial Calendar!");
      setAddOpen(false);
      setEventTitle("");
      setEventAmount("");
      setEventSubtitle("");
      qc.invalidateQueries({ queryKey: ["financial_calendar_events", plannerId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Month Grid Calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Selected date events
  const selectedDayStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDayEvents = events.filter((e) => e.date === selectedDayStr);

  const handleExport = () => {
    const headers = ["Title", "Category", "Date", "Amount", "Currency", "Subtitle"];
    const exportRows = events.map((e) => [
      e.title,
      e.kind.toUpperCase(),
      e.date,
      e.amount ?? 0,
      currency,
      e.subtitle ?? "",
    ]);
    exportToExcel("Financial_Calendar_Events", headers, exportRows);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 sm:h-7 sm:w-7 text-[#3DDC97]" /> Financial Calendar
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-sans">
            Paydays, Bills, Tax Deadlines, Invoices & Loan payments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-sans text-xs gap-1.5 h-8 px-2.5"
          >
            <Download className="h-3.5 w-3.5 text-[#3DDC97]" /> Export
          </Button>

          <Button size="sm" onClick={() => setAddOpen(true)} className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-semibold gap-1.5 font-sans h-8 px-2.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Event
          </Button>
        </div>
      </div>

      {/* Main Grid: Calendar + Selected Day Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 font-sans">
        {/* Calendar View (3 Columns) */}
        <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-[#0c100e] p-3 sm:p-5 shadow-xl flex flex-col justify-between font-sans">
          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-white/10 pb-3 sm:pb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-lg sm:text-2xl font-bold text-white tracking-wide">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(new Date());
                }}
                className="text-xs bg-white/5 border border-white/10 text-muted-foreground hover:text-white font-sans px-2.5 h-7"
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0 text-white/70 hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0 text-white/70 hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2 font-sans">
            {["S", "M", "T", "W", "T", "F", "S"].map((dayName, i) => (
              <div key={i} className="py-0.5 sm:py-1 hidden sm:block">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}</div>
            ))}
            {["S", "M", "T", "W", "T", "F", "S"].map((dayName, i) => (
              <div key={`m${i}`} className="py-0.5 sm:hidden">{dayName}</div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5 flex-1 min-h-[320px] sm:min-h-[480px]">
            {days.map((d, idx) => {
              const dStr = format(d, "yyyy-MM-dd");
              const dayEvents = events.filter((e) => e.date === dStr);
              const isSelected = isSameDay(d, selectedDate);
              const isCurrentMonth = isSameMonth(d, monthStart);
              const isToday = isSameDay(d, new Date());

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(d)}
                  className={`min-h-[52px] sm:min-h-[85px] p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer flex flex-col font-sans ${
                    isSelected
                      ? "border-[#3DDC97] bg-white/10 shadow-lg"
                      : isToday
                      ? "border-amber-500/50 bg-amber-500/5"
                      : isCurrentMonth
                      ? "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/5"
                      : "border-transparent bg-white/[0.005] opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between font-sans">
                    <span
                      className={`text-[10px] sm:text-xs font-semibold h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center font-sans ${
                        isToday
                          ? "bg-[#3DDC97] text-black font-bold"
                          : isSelected
                          ? "bg-white text-black font-bold"
                          : "text-foreground/80"
                      }`}
                    >
                      {format(d, "d")}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[8px] sm:text-[10px] font-sans px-1 sm:px-1.5 py-0.5 rounded-full bg-white/10 text-white font-medium">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Badges - hidden on small mobile, visible sm+ */}
                  <div className="hidden sm:block space-y-1 mt-1 overflow-hidden font-sans">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const color = EVENT_COLORS[ev.kind] || EVENT_COLORS.custom;
                      return (
                        <div
                          key={ev.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-sans truncate border ${color.bg} ${color.text} ${color.border}`}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-muted-foreground italic font-sans">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                  {/* Mobile: show colored dots instead of full badges */}
                  <div className="flex gap-0.5 mt-1 sm:hidden flex-wrap">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const color = EVENT_COLORS[ev.kind] || EVENT_COLORS.custom;
                      return (
                        <div key={ev.id} className={`h-1.5 w-1.5 rounded-full ${color.text.replace('text-', 'bg-')}`} />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Agenda Sidebar */}
        <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-5 shadow-xl flex flex-col justify-between font-sans">
          <div>
            <div className="border-b border-white/10 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-white">
                {format(selectedDate, "EEE, MMM d, yyyy")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                {selectedDayEvents.length} financial deadlines / events
              </p>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-1 font-sans">
              {selectedDayEvents.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground font-sans">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-30 text-white" />
                  No bills, paydays, or deadlines scheduled for this date.
                </div>
              ) : (
                selectedDayEvents.map((ev) => {
                  const color = EVENT_COLORS[ev.kind] || EVENT_COLORS.custom;
                  return (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-xl border font-sans ${color.bg} ${color.border} space-y-1`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${color.bg} ${color.text} border ${color.border}`}>
                          {ev.kind}
                        </span>
                        {ev.amount !== undefined && ev.amount !== null && (
                          <span className={`font-display font-bold text-sm ${color.text}`}>
                            {formatMoney(ev.amount, currency)}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white font-sans">{ev.title}</h4>
                      {ev.subtitle && (
                        <p className="text-xs text-muted-foreground font-sans">{ev.subtitle}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Button
            onClick={() => {
              setEventDate(format(selectedDate, "yyyy-MM-dd"));
              setAddOpen(true);
            }}
            className="mt-4 w-full gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold font-sans"
          >
            <Plus className="h-3.5 w-3.5 text-[#3DDC97]" /> Add Deadline on {format(selectedDate, "MMM d")}
          </Button>
        </div>
      </div>

      {/* Add Custom Event Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md bg-[#0c100e] border-white/10 text-white font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <CalendarIcon className="h-5 w-5 text-[#3DDC97]" /> Add Financial Event / Deadline
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3 font-sans">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium font-sans">Event Title</label>
              <Input
                placeholder="e.g. Q3 Tax Payment, Netflix Subscription, Payday"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="bg-white/5 border-white/10 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 font-sans">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Event Category</label>
                <Select value={eventKind} onValueChange={(v: any) => setEventKind(v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c100e] border-white/10 text-white font-sans">
                    <SelectItem value="tax">Tax Deadline</SelectItem>
                    <SelectItem value="expense">Bill Due</SelectItem>
                    <SelectItem value="income">Payday / Income</SelectItem>
                    <SelectItem value="loan">Loan Payment</SelectItem>
                    <SelectItem value="invoice">Invoice Due</SelectItem>
                    <SelectItem value="subscription">Subscription Renewal</SelectItem>
                    <SelectItem value="goal">Goal Milestone</SelectItem>
                    <SelectItem value="custom">Other Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Date</label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="bg-white/5 border-white/10 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-sans">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Amount ({currency})</label>
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  value={eventAmount}
                  onChange={(e) => setEventAmount(e.target.value)}
                  className="bg-white/5 border-white/10 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Notes / Details</label>
                <Input
                  placeholder="e.g. Auto-debit from Chase"
                  value={eventSubtitle}
                  onChange={(e) => setEventSubtitle(e.target.value)}
                  className="bg-white/5 border-white/10 font-sans"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)} className="font-sans">Cancel</Button>
            <Button onClick={() => createCustomEventMutation.mutate()} className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-semibold font-sans">
              Save Deadline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/calendar")({
  component: FinancialCalendarPage,
});
