import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, FileText, StickyNote, Plus, Search } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

type TimelineItem = {
  id: string;
  type: "income" | "expense" | "transfer" | "invoice" | "note" | "activity";
  title: string;
  subtitle: string;
  amount?: number | null;
  date: string;
  color: string;
};

function safeString(val: any, fallback = ""): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    return String(val.label ?? val.title ?? val.name ?? val.value ?? fallback);
  }
  return fallback;
}

export function TimelinePage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [postOpen, setPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postSubtitle, setPostSubtitle] = useState("");

  // Fetch all planner data in parallel for a rich, comprehensive timeline
  const { data: rawData = [] } = useQuery({
    queryKey: ["timeline_all", plannerId],
    queryFn: async () => {
      const [
        { data: activities },
        { data: income },
        { data: expenses },
        { data: transfers },
        { data: invoices },
        { data: notes },
      ] = await Promise.all([
        supabase.from("activity_events").select("*").eq("planner_id", plannerId),
        supabase.from("income_entries").select("*").eq("planner_id", plannerId),
        supabase.from("expense_entries").select("*").eq("planner_id", plannerId),
        supabase.from("transfers").select("*").eq("planner_id", plannerId),
        supabase.from("invoices").select("*").eq("planner_id", plannerId),
        supabase.from("notes").select("*").eq("planner_id", plannerId),
      ]);

      const items: TimelineItem[] = [];

      (activities ?? []).forEach((a: any) => {
        items.push({
          id: `act_${a.id}`,
          type: "activity",
          title: safeString(a.title, "Activity Event"),
          subtitle: safeString(a.subtitle || a.kind, "System Log"),
          date: safeString(a.created_at, new Date().toISOString()),
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        });
      });

      (income ?? []).forEach((i: any) => {
        items.push({
          id: `inc_${i.id}`,
          type: "income",
          title: safeString(i.description, "Income Entry"),
          subtitle: "Received income into account",
          amount: Number(i.amount || 0),
          date: safeString(i.date || i.created_at, new Date().toISOString()),
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        });
      });

      (expenses ?? []).forEach((e: any) => {
        items.push({
          id: `exp_${e.id}`,
          type: "expense",
          title: safeString(e.description, "Expense Entry"),
          subtitle: "Expense payout",
          amount: Number(e.amount || 0),
          date: safeString(e.date || e.created_at, new Date().toISOString()),
          color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        });
      });

      (transfers ?? []).forEach((t: any) => {
        items.push({
          id: `trf_${t.id}`,
          type: "transfer",
          title: safeString(t.description, "Account Transfer"),
          subtitle: "Transferred between accounts",
          amount: Number(t.amount || 0),
          date: safeString(t.created_at, new Date().toISOString()),
          color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
        });
      });

      (invoices ?? []).forEach((inv: any) => {
        const st = safeString(inv.status, "PENDING");
        items.push({
          id: `inv_${inv.id}`,
          type: "invoice",
          title: `Invoice #${safeString(inv.number, "001")}`,
          subtitle: `Status: ${st.toUpperCase()}`,
          amount: Number(inv.total_amount || 0),
          date: safeString(inv.created_at, new Date().toISOString()),
          color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        });
      });

      (notes ?? []).forEach((n: any) => {
        const cont = safeString(n.content);
        items.push({
          id: `note_${n.id}`,
          type: "note",
          title: safeString(n.title, "Untitled Note"),
          subtitle: cont ? `${cont.slice(0, 60)}...` : "Note created",
          date: safeString(n.updated_at || n.created_at, new Date().toISOString()),
          color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        });
      });

      return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });

  // Post activity mutation
  const postActivityMutation = useMutation({
    mutationFn: async () => {
      if (!postTitle) throw new Error("Title is required");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("activity_events").insert({
        planner_id: plannerId,
        user_id: user.id,
        kind: "custom",
        title: postTitle,
        subtitle: postSubtitle || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Activity logged to timeline!");
      setPostOpen(false);
      setPostTitle("");
      setPostSubtitle("");
      qc.invalidateQueries({ queryKey: ["timeline_all", plannerId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Filter & Search Logic
  const filtered = rawData.filter((item) => {
    const matchesFilter = filterType === "all" || item.type === filterType;
    const matchesSearch =
      search === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case "income":
        return <ArrowDownLeft className="h-3.5 w-3.5" />;
      case "expense":
        return <ArrowUpRight className="h-3.5 w-3.5" />;
      case "transfer":
        return <ArrowLeftRight className="h-3.5 w-3.5" />;
      case "invoice":
        return <FileText className="h-3.5 w-3.5" />;
      case "note":
        return <StickyNote className="h-3.5 w-3.5" />;
      default:
        return <Activity className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-7 w-7 text-[#3DDC97]" /> Planner Activity Timeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Real-time audit log of all financial transactions, invoices, transfers, and notes.
          </p>
        </div>
        <Button onClick={() => setPostOpen(true)} className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-semibold gap-2 self-start sm:self-auto font-sans">
          <Plus className="h-4 w-4" /> Post Activity Event
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0c100e] p-3 rounded-2xl border border-white/10 shadow-xl font-sans">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search timeline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 h-9 text-xs font-sans"
          />
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-1.5 w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
          {[
            { id: "all", label: "All Events" },
            { id: "income", label: "Income" },
            { id: "expense", label: "Expenses" },
            { id: "transfer", label: "Transfers" },
            { id: "invoice", label: "Invoices" },
            { id: "note", label: "Notes" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap font-sans ${
                filterType === cat.id
                  ? "bg-[#3DDC97] text-black font-semibold shadow-md"
                  : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-6 shadow-xl min-h-[400px] font-sans">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground font-sans">
            <Activity className="h-10 w-10 mx-auto mb-3 opacity-30 text-white" />
            <h3 className="text-base font-semibold text-foreground font-display">No matching timeline events</h3>
            <p className="text-xs text-muted-foreground mt-1 font-sans">Try clearing filters or adding new transactions.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-white/10 ml-5 pl-7 space-y-6">
            {filtered.map((item) => (
              <div key={item.id} className="relative group transition-all font-sans">
                {/* Timeline Dot (Center perfectly on border-l-2 line) */}
                <div className={`absolute -left-[43px] top-3 h-7 w-7 rounded-full border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${item.color}`}>
                  {renderTypeIcon(item.type)}
                </div>

                {/* Card Content */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground tracking-wide font-sans">{item.title}</span>
                      <span className="text-[10px] uppercase font-sans px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground border border-white/10">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-sans">{item.subtitle}</p>
                    <p className="text-[11px] font-sans text-muted-foreground/70 mt-1">
                      {formatDate(item.date)}
                    </p>
                  </div>

                  {item.amount !== undefined && item.amount !== null && (
                    <div className={`font-display text-lg font-bold shrink-0 ${
                      item.type === "income" ? "text-[#3DDC97]" : item.type === "expense" ? "text-orange-400" : "text-yellow-400"
                    }`}>
                      {item.type === "income" ? "+" : item.type === "expense" ? "−" : ""}
                      {formatMoney(item.amount, currency)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Activity Dialog */}
      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent className="sm:max-w-md bg-[#0c100e] border-white/10 text-white font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Activity className="h-5 w-5 text-[#3DDC97]" /> Log Custom Timeline Activity
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3 font-sans">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium font-sans">Activity Title</label>
              <Input
                placeholder="e.g. Closed major partnership, Reached $50K MRR"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="bg-white/5 border-white/10 font-sans"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium font-sans">Details / Notes (Optional)</label>
              <Input
                placeholder="e.g. Signed contract with OrionEdge Agency"
                value={postSubtitle}
                onChange={(e) => setPostSubtitle(e.target.value)}
                className="bg-white/5 border-white/10 font-sans"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPostOpen(false)} className="font-sans">Cancel</Button>
            <Button onClick={() => postActivityMutation.mutate()} className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-semibold font-sans">
              Post to Timeline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/timeline")({
  component: TimelinePage,
});
