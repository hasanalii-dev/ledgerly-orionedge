import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { formatMoney } from "@/lib/format";
import { useEffect, useState } from "react";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Download, TrendingDown, Import, Calendar } from "lucide-react";
import { exportToExcel } from "@/lib/export-excel";
import { toast } from "sonner";

type Row = {
  id: string;
  date: string;
  vendor: string | null;
  description: string | null;
  category_id: string | null;
  amount: number;
  currency: string;
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

function ExpensesPage() {
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
    queryKey: ["expenses", plannerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("expense_entries").select("*").eq("planner_id", plannerId).order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const { data: cats = [] } = useQuery({
    queryKey: ["expense_categories", plannerId],
    queryFn: async () => (await supabase.from("expense_categories").select("id, name").eq("planner_id", plannerId).order("name")).data ?? [],
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", plannerId],
    queryFn: async () => (await supabase.from("accounts").select("id, name").eq("planner_id", plannerId)).data ?? [],
  });

  // Fetch monthly allocations for importing expenses (exclude earning and income types)
  const { data: monthlyAllocations = [] } = useQuery({
    queryKey: ["monthly_allocations_expenses", plannerId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("monthly_allocations")
        .select("*")
        .eq("planner_id", plannerId)
        .not("allocation_type", "in", '("earning","income")')
        .order("month_year", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MonthlyAllocation[];
    },
  });

  const handleExport = () => {
    const headers = ["Date", "Vendor", "Description", "Category", "Amount", "Currency", "Account", "Notes"];
    const exportRows = rows.map((r) => [
      r.date ?? "",
      r.vendor ?? "",
      r.description ?? "",
      cats.find((c) => c.id === r.category_id)?.name ?? "",
      r.amount ?? 0,
      r.currency ?? currency,
      accounts.find((a) => a.id === r.account_id)?.name ?? "",
      r.notes ?? "",
    ]);
    exportToExcel("Expense_Registry", headers, exportRows);
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
        description: a.description ? `${a.category} - ${a.description}` : a.category || "Monthly Expense",
        amount: Number(a.amount || 0),
        currency: currency,
      }));

      const { error } = await supabase.from("expense_entries").insert(toInsert);
      if (error) throw error;

      toast.success(`Successfully imported ${toInsert.length} expense entries from Monthly Tracking!`);
      qc.invalidateQueries({ queryKey: ["expenses", plannerId] });
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
            <TrendingDown className="h-7 w-7 text-[#FF5F56]" /> Expenses
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">Every spend logged. Autosaves as you type.</p>
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
        table="expense_entries"
        rows={rows}
        planner_id={plannerId}
        user_id={uid}
        invalidateKeys={[["expenses", plannerId], ["dashboard", plannerId]]}
        onNewRow={() => ({ date: new Date().toISOString().slice(0, 10), amount: 0, currency })}
        currency={currency}
        totals={{ amountKey: "amount", label: "Total" }}
        columns={[
          { key: "date", label: "Date", width: "115px", render: (r, on) => <CellInput type="date" value={r.date ?? ""} onChange={(v) => on({ date: v })} /> },
          { key: "vendor", label: "Vendor / Payee", width: "140px", render: (r, on) => <CellInput value={r.vendor ?? ""} onChange={(v) => on({ vendor: v })} /> },
          { key: "description", label: "Description", render: (r, on) => <CellInput value={r.description ?? ""} onChange={(v) => on({ description: v })} /> },
          { key: "category_id", label: "Category", width: "130px", render: (r, on) => <CellSelect value={r.category_id ?? ""} onChange={(v) => on({ category_id: v || null })} options={cats.map((c) => ({ value: c.id, label: c.name }))} /> },
          { key: "amount", label: "Amount", width: "100px", render: (r, on) => <CellInput type="number" value={String(r.amount ?? 0)} onChange={(v) => on({ amount: parseFloat(v) || 0 })} className="text-right font-sans" /> },
          { key: "currency", label: "CCY", width: "65px", render: (r, on) => <CellInput value={r.currency ?? currency} onChange={(v) => on({ currency: v.toUpperCase() })} className="uppercase font-sans" /> },
          { key: "account_id", label: "Paid From Account", width: "140px", render: (r, on) => <CellSelect value={r.account_id ?? ""} onChange={(v) => on({ account_id: v || null })} options={accounts.map((a) => ({ value: a.id, label: a.name }))} /> },
          { key: "notes", label: "Notes", render: (r, on) => <CellInput value={r.notes ?? ""} onChange={(v) => on({ notes: v })} /> },
        ]}
      />

      {/* IMPORT FROM MONTHLY DIALOG */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="bg-[#0b0e0c] border border-white/10 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Import className="h-5 w-5 text-[#3DDC97]" /> Import Expenses from Monthly Tracking
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select monthly expense & allocation items to import into your main Expense Registry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto py-2 pr-1">
            {monthlyAllocations.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No expense allocations found in Monthly Tracking for this planner.
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
                            <Calendar className="w-3 h-3 text-muted-foreground" /> {alloc.month_year} ({alloc.allocation_type})
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

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/expenses")({
  component: ExpensesPage,
});
