import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { INCOME_STATUSES, formatMoney } from "@/lib/format";
import { useEffect, useState } from "react";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Download, TrendingUp, Import, Calendar } from "lucide-react";
import { exportToExcel } from "@/lib/export-excel";
import { toast } from "sonner";

type Row = {
  id: string;
  date: string;
  description: string | null;
  client_id: string | null;
  project_id: string | null;
  invoice_id: string | null;
  amount: number;
  currency: string;
  status: string;
  account_id: string | null;
  notes: string | null;
};

type MonthlyAllocation = {
  id: string;
  month_year: string;
  allocation_type: string;
  category: string;
  description: string | null;
  amount: number;
};

function IncomePage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState<string>("");
  const currency = usePlannerCurrency(plannerId);
  const qc = useQueryClient();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedAllocIds, setSelectedAllocIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => { 
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? "")); 
  }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["income", plannerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("income_entries").select("*").eq("planner_id", plannerId).order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients", plannerId],
    queryFn: async () => (await supabase.from("clients").select("id, name").eq("planner_id", plannerId)).data ?? [],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects", plannerId],
    queryFn: async () => (await supabase.from("projects").select("id, name").eq("planner_id", plannerId)).data ?? [],
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", plannerId],
    queryFn: async () => (await supabase.from("accounts").select("id, name").eq("planner_id", plannerId)).data ?? [],
  });

  // Fetch monthly allocations for importing income (earning / income allocation types)
  const { data: monthlyAllocations = [] } = useQuery({
    queryKey: ["monthly_allocations_income", plannerId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("monthly_allocations")
        .select("*")
        .eq("planner_id", plannerId)
        .in("allocation_type", ["earning", "income"])
        .order("month_year", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MonthlyAllocation[];
    },
  });

  const handleExport = () => {
    const headers = ["Date", "Description", "Client", "Project", "Amount", "Currency", "Status", "Account", "Notes"];
    const exportRows = rows.map((r) => [
      r.date ?? "",
      r.description ?? "",
      clients.find((c) => c.id === r.client_id)?.name ?? "",
      projects.find((p) => p.id === r.project_id)?.name ?? "",
      r.amount ?? 0,
      r.currency ?? currency,
      r.status ?? "",
      accounts.find((a) => a.id === r.account_id)?.name ?? "",
      r.notes ?? "",
    ]);
    exportToExcel("Income_Registry", headers, exportRows);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAllocIds(monthlyAllocations.map(a => a.id));
    } else {
      setSelectedAllocIds([]);
    }
  };

  const toggleAllocSelection = (id: string) => {
    setSelectedAllocIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleImportSelected = async () => {
    if (selectedAllocIds.length === 0) {
      toast.error("Please select at least one allocation to import.");
      return;
    }

    setIsImporting(true);
    try {
      const selectedAllocations = monthlyAllocations.filter(a => selectedAllocIds.includes(a.id));
      const toInsert = selectedAllocations.map(a => ({
        planner_id: plannerId,
        user_id: uid || null,
        date: a.month_year ? `${a.month_year}-01` : new Date().toISOString().slice(0, 10),
        description: a.description ? `${a.category} - ${a.description}` : a.category || "Monthly Income",
        amount: Number(a.amount || 0),
        currency: currency,
        status: "received",
      }));

      const { error } = await supabase.from("income_entries").insert(toInsert);
      if (error) throw error;

      toast.success(`Successfully imported ${toInsert.length} income entries from Monthly Tracking!`);
      qc.invalidateQueries({ queryKey: ["income", plannerId] });
      qc.invalidateQueries({ queryKey: ["dashboard", plannerId] });
      setIsImportOpen(false);
      setSelectedAllocIds([]);
    } catch (err: any) {
      toast.error("Import failed: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-[#3DDC97]" /> Income
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">Every payment received. Autosaves as you type.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            onClick={() => setIsImportOpen(true)}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-sans text-xs gap-2"
          >
            <Import className="h-4 w-4 text-white" /> Import from Monthly
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-sans text-xs gap-2"
          >
            <Download className="h-4 w-4 text-white" /> Export Excel
          </Button>
        </div>
      </div>

      <EditableTable<Row>
        table="income_entries"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["income", plannerId], ["dashboard", plannerId]]}
        onNewRow={() => ({ date: new Date().toISOString().slice(0, 10), amount: 0, currency, status: "pending" })}
        currency={currency}
        totals={{ amountKey: "amount", label: "Total" }}
        columns={[
          { key: "date", label: "Date", width: "120px", render: (r, on) => <CellInput type="date" value={r.date ?? ""} onChange={(v) => on({ date: v })} /> },
          { key: "description", label: "Source / Description", render: (r, on) => <CellInput value={r.description ?? ""} onChange={(v) => on({ description: v })} /> },
          { key: "client_id", label: "Client", width: "135px", render: (r, on) => <CellSelect value={r.client_id ?? ""} onChange={(v) => on({ client_id: v || null })} options={clients.map((c) => ({ value: c.id, label: c.name }))} /> },
          { key: "project_id", label: "Project", width: "135px", render: (r, on) => <CellSelect value={r.project_id ?? ""} onChange={(v) => on({ project_id: v || null })} options={projects.map((p) => ({ value: p.id, label: p.name }))} /> },
          { key: "amount", label: "Amount", width: "115px", render: (r, on) => <CellInput type="number" value={String(r.amount ?? 0)} onChange={(v) => on({ amount: parseFloat(v) || 0 })} className="text-right font-sans" /> },
          { key: "currency", label: "CCY", width: "55px", render: (r, on) => <CellInput value={r.currency ?? currency} onChange={(v) => on({ currency: v.toUpperCase() })} className="uppercase font-sans" /> },
          { key: "status", label: "Status", width: "105px", render: (r, on) => <CellSelect value={r.status ?? "pending"} onChange={(v) => on({ status: v })} options={INCOME_STATUSES} /> },
          { key: "account_id", label: "Account", width: "110px", render: (r, on) => <CellSelect value={r.account_id ?? ""} onChange={(v) => on({ account_id: v || null })} options={accounts.map((a) => ({ value: a.id, label: a.name }))} /> },
          { key: "notes", label: "Notes", render: (r, on) => <CellInput value={r.notes ?? ""} onChange={(v) => on({ notes: v })} /> },
        ]}
      />

      {/* IMPORT FROM MONTHLY DIALOG */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="bg-[#0b0e0c] border border-white/10 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Import className="h-5 w-5 text-[#3DDC97]" /> Import Income from Monthly Tracking
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select monthly income allocations to import into your main Income Registry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto py-2 pr-1">
            {monthlyAllocations.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No income allocations found in Monthly Tracking for this planner.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedAllocIds.length === monthlyAllocations.length && monthlyAllocations.length > 0}
                      onCheckedChange={(c) => handleSelectAll(!!c)}
                    />
                    <span>Select All ({monthlyAllocations.length})</span>
                  </div>
                  <span>Amount</span>
                </div>

                <div className="space-y-2">
                  {monthlyAllocations.map(alloc => (
                    <div 
                      key={alloc.id} 
                      onClick={() => toggleAllocSelection(alloc.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedAllocIds.includes(alloc.id) 
                          ? 'bg-[#3DDC97]/15 border-[#3DDC97]/40' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedAllocIds.includes(alloc.id)} />
                        <div>
                          <div className="text-sm font-semibold text-white">{alloc.category}</div>
                          {alloc.description && (
                            <div className="text-xs text-muted-foreground">{alloc.description}</div>
                          )}
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 font-['Questrial',_sans-serif]">
                            <Calendar className="w-3 h-3 text-muted-foreground" /> {alloc.month_year}
                          </div>
                        </div>
                      </div>
                      <div className="font-['Questrial',_sans-serif] font-bold text-sm text-white">
                        {formatMoney(alloc.amount, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsImportOpen(false)} className="border-white/10 text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button 
              onClick={handleImportSelected} 
              disabled={isImporting || selectedAllocIds.length === 0} 
              className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-bold"
            >
              {isImporting ? "Importing..." : `Import Selected (${selectedAllocIds.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/income")({
  component: IncomePage,
});
