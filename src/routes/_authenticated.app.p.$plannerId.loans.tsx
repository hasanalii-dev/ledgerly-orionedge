import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { formatMoney, formatDate } from "@/lib/format";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Plus, Landmark, TrendingDown, TrendingUp, Calendar, Trash2, CheckCircle2, CreditCard, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel } from "@/lib/export-excel";

type Loan = {
  id: string;
  planner_id: string;
  name: string;
  type: "borrowed" | "lent"; // borrowed = liability (I owe), lent = asset (owed to me)
  counterparty: string; // lender or borrower name
  original_amount: number;
  remaining_amount: number;
  interest_rate: number; // percentage e.g. 5.5
  monthly_payment: number;
  due_date?: string | null;
  status: "active" | "paid_off";
  created_at: string;
};

function LoansPage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);
  const qc = useQueryClient();

  const [addOpen, setAddOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // New Loan Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"borrowed" | "lent">("borrowed");
  const [counterparty, setCounterparty] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Payment Modal Form State
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paySourceAcc, setPaySourceAcc] = useState("");

  // Fetch Loans from Supabase (or fallback to local storage)
  const { data: loans = [] } = useQuery({
    queryKey: ["loans", plannerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("loans" as any)
          .select("*")
          .eq("planner_id", plannerId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        localStorage.setItem(`capient_loans_${plannerId}`, JSON.stringify(data));
        return (data || []) as Loan[];
      } catch (e) {
        const local = localStorage.getItem(`capient_loans_${plannerId}`);
        return local ? (JSON.parse(local) as Loan[]) : [];
      }
    },
  });

  // Fetch Accounts for Payment Source selection
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", plannerId],
    queryFn: async () => (await supabase.from("accounts").select("id, name, opening_balance").eq("planner_id", plannerId)).data ?? [],
  });

  // Create Loan Mutation
  const createLoanMutation = useMutation({
    mutationFn: async () => {
      if (!name || !originalAmount) throw new Error("Loan name and original amount are required");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const orig = parseFloat(originalAmount) || 0;
      const newLoan: Loan = {
        id: crypto.randomUUID(),
        planner_id: plannerId,
        name,
        type,
        counterparty: counterparty || (type === "borrowed" ? "Bank / Lender" : "Borrower"),
        original_amount: orig,
        remaining_amount: orig,
        interest_rate: parseFloat(interestRate) || 0,
        monthly_payment: parseFloat(monthlyPayment) || 0,
        due_date: dueDate || null,
        status: "active",
        created_at: new Date().toISOString(),
      };

      try {
        await (supabase as any).from("loans").insert({
          ...newLoan,
          user_id: user.id,
        });
      } catch (e) {
        console.warn("Saved loan locally", e);
      }

      const updated = [newLoan, ...loans];
      localStorage.setItem(`capient_loans_${plannerId}`, JSON.stringify(updated));
      qc.setQueryData(["loans", plannerId], updated);
    },
    onSuccess: () => {
      toast.success("Loan added successfully!");
      setAddOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["loans", plannerId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Pay Loan Mutation
  const payLoanMutation = useMutation({
    mutationFn: async () => {
      if (!selectedLoan || !paymentAmount) throw new Error("Enter a valid payment amount");
      const pAmt = parseFloat(paymentAmount) || 0;
      if (pAmt <= 0) throw new Error("Amount must be greater than zero");

      const { data: { user } } = await supabase.auth.getUser();

      const newRemaining = Math.max(0, selectedLoan.remaining_amount - pAmt);
      const isPaidOff = newRemaining === 0;

      if (paySourceAcc && user) {
        if (selectedLoan.type === "borrowed") {
          await supabase.from("expense_entries").insert({
            planner_id: plannerId,
            user_id: user.id,
            account_id: paySourceAcc,
            amount: pAmt,
            description: `Loan Repayment: ${selectedLoan.name}`,
            date: new Date().toISOString().split("T")[0],
          });
        } else {
          await supabase.from("income_entries").insert({
            planner_id: plannerId,
            user_id: user.id,
            account_id: paySourceAcc,
            amount: pAmt,
            description: `Lent Loan Repayment Received: ${selectedLoan.name}`,
            date: new Date().toISOString().split("T")[0],
          });
        }
      }

      try {
        await (supabase as any).from("loans").update({
          remaining_amount: newRemaining,
          status: isPaidOff ? "paid_off" : "active",
        }).eq("id", selectedLoan.id);
      } catch (e) {
        console.warn("Updated loan balance locally", e);
      }

      const updated = loans.map(l => l.id === selectedLoan.id ? { ...l, remaining_amount: newRemaining, status: (isPaidOff ? "paid_off" : "active") as any } : l);
      localStorage.setItem(`capient_loans_${plannerId}`, JSON.stringify(updated));
      qc.setQueryData(["loans", plannerId], updated);
    },
    onSuccess: () => {
      toast.success("Payment recorded and account balance updated!");
      setPayOpen(false);
      setPaymentAmount("");
      setPaySourceAcc("");
      qc.invalidateQueries({ queryKey: ["loans", plannerId] });
      qc.invalidateQueries({ queryKey: ["accounts", plannerId] });
      qc.invalidateQueries({ queryKey: ["account_balances", plannerId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Delete Loan handler
  const confirmDeleteLoan = async (id: string) => {
    try {
      await (supabase as any).from("loans").delete().eq("id", id);
    } catch (e) {}
    const updated = loans.filter(l => l.id !== id);
    localStorage.setItem(`capient_loans_${plannerId}`, JSON.stringify(updated));
    qc.setQueryData(["loans", plannerId], updated);
    setDeleteTargetId(null);
    toast.success("Loan deleted");
  };

  function resetForm() {
    setName("");
    setType("borrowed");
    setCounterparty("");
    setOriginalAmount("");
    setInterestRate("");
    setMonthlyPayment("");
    setDueDate("");
  }

  // Analytics & Calculations
  const borrowedLoans = loans.filter(l => l.type === "borrowed");
  const lentLoans = loans.filter(l => l.type === "lent");

  const totalBorrowedOwed = borrowedLoans.reduce((s, l) => s + Number(l.remaining_amount || 0), 0);
  const totalLentOutstanding = lentLoans.reduce((s, l) => s + Number(l.remaining_amount || 0), 0);
  const monthlyDebtService = borrowedLoans.filter(l => l.status === "active").reduce((s, l) => s + Number(l.monthly_payment || 0), 0);

  const totalBorrowedOriginal = borrowedLoans.reduce((s, l) => s + Number(l.original_amount || 0), 0);
  const totalPaidOff = totalBorrowedOriginal > 0 ? ((totalBorrowedOriginal - totalBorrowedOwed) / totalBorrowedOriginal) * 100 : 100;

  const handleExport = () => {
    const headers = ["Loan Name", "Type", "Counterparty", "Original Amount", "Remaining Balance", "Interest Rate %", "Monthly Payment", "Due Date", "Status"];
    const exportRows = loans.map((l) => [
      l.name,
      l.type.toUpperCase(),
      l.counterparty,
      l.original_amount ?? 0,
      l.remaining_amount ?? 0,
      l.interest_rate ?? 0,
      l.monthly_payment ?? 0,
      l.due_date ?? "",
      l.status.toUpperCase(),
    ]);
    exportToExcel("Loans_Debts_Registry", headers, exportRows);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Landmark className="h-7 w-7 text-[#3DDC97]" /> Loans & Debts
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Track mortgages, liabilities, personal loans, and money lent to others.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-sans">
          <Button
            variant="outline"
            onClick={handleExport}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-sans text-xs gap-2"
          >
            <Download className="h-4 w-4 text-[#3DDC97]" /> Export Excel
          </Button>

          <Button onClick={() => setAddOpen(true)} className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-semibold gap-2 font-sans">
            <Plus className="h-4 w-4" /> Add Loan / Liability
          </Button>
        </div>
      </div>

      {/* KPI Cards (Colors: Emerald, Orange, Yellow, Amber) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Total Owed (Liabilities)</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400"><TrendingDown className="h-5 w-5" /></div>
          </div>
          <div className="mt-3 font-display text-2xl lg:text-3xl font-bold text-orange-400">
            {formatMoney(totalBorrowedOwed, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">{borrowedLoans.filter(l => l.status === "active").length} active liabilities</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Money Lent (Assets)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-[#3DDC97]"><TrendingUp className="h-5 w-5" /></div>
          </div>
          <div className="mt-3 font-display text-2xl lg:text-3xl font-bold text-[#3DDC97]">
            {formatMoney(totalLentOutstanding, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">{lentLoans.filter(l => l.status === "active").length} active receivables</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Monthly Debt Payment</span>
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400"><Calendar className="h-5 w-5" /></div>
          </div>
          <div className="mt-3 font-display text-2xl lg:text-3xl font-bold text-yellow-400">
            {formatMoney(monthlyDebtService, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">Due every month</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">Debt Payoff Progress</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><CheckCircle2 className="h-5 w-5" /></div>
          </div>
          <div className="mt-3 font-display text-2xl lg:text-3xl font-bold text-amber-400">
            {totalPaidOff.toFixed(1)}%
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, totalPaidOff))}%` }} />
          </div>
        </div>
      </div>

      {/* Loans Grid / Cards */}
      <div className="space-y-4 font-sans">
        <h2 className="text-lg font-semibold text-foreground tracking-wide font-display">Active Loans & Liabilities</h2>

        {loans.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-12 text-center text-muted-foreground shadow-xl font-sans">
            <Landmark className="h-10 w-10 mx-auto mb-3 text-white/30" />
            <h3 className="text-base font-semibold text-foreground font-display">No loans or debts tracked yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto font-sans">
              Add your mortgages, car loans, personal debts, or money lent to friends to track payoffs seamlessly.
            </p>
            <Button onClick={() => setAddOpen(true)} className="mt-4 gap-2 bg-[#3DDC97]/10 text-[#3DDC97] border border-[#3DDC97]/30 hover:bg-[#3DDC97]/20 font-sans">
              <Plus className="h-4 w-4" /> Add First Loan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-sans">
            {loans.map((loan) => {
              const isBorrowed = loan.type === "borrowed";
              const progress = loan.original_amount > 0 ? ((loan.original_amount - loan.remaining_amount) / loan.original_amount) * 100 : 100;
              const isPaid = loan.remaining_amount === 0 || loan.status === "paid_off";

              return (
                <div
                  key={loan.id}
                  className={`rounded-2xl border bg-[#0c100e] p-5 shadow-xl relative flex flex-col justify-between transition-all hover:border-white/20 font-sans ${
                    isPaid ? "border-[#3DDC97]/30 bg-[#3DDC97]/[0.02]" : "border-white/10"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 font-sans">
                      <div>
                        <div className="flex items-center gap-2 font-sans">
                          <span className={`text-[10px] uppercase font-sans px-2 py-0.5 rounded-md font-semibold border ${
                            isBorrowed ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-emerald-500/10 text-[#3DDC97] border-emerald-500/20"
                          }`}>
                            {isBorrowed ? "I Owe (Liability)" : "Lent (Asset)"}
                          </span>
                          {isPaid && (
                            <span className="text-[10px] uppercase font-sans px-2 py-0.5 rounded-md font-semibold bg-[#3DDC97]/20 text-[#3DDC97] border border-[#3DDC97]/40">
                              Paid Off
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold font-display text-foreground mt-2 truncate">{loan.name}</h3>
                        <p className="text-xs text-muted-foreground font-sans">{loan.counterparty}</p>
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => setDeleteTargetId(loan.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-orange-400 font-sans">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-5 space-y-3 font-sans">
                      <div className="flex justify-between items-baseline font-sans">
                        <span className="text-xs text-muted-foreground font-sans">Remaining Principal</span>
                        <span className={`font-display text-xl font-bold ${isBorrowed ? "text-orange-400" : "text-[#3DDC97]"}`}>
                          {formatMoney(loan.remaining_amount, currency)}
                        </span>
                      </div>

                      {/* Payoff Progress Bar */}
                      <div className="space-y-1 font-sans">
                        <div className="flex justify-between text-[11px] text-muted-foreground font-sans">
                          <span>Original: {formatMoney(loan.original_amount, currency)}</span>
                          <span>{progress.toFixed(0)}% Paid</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${isBorrowed ? "bg-orange-500" : "bg-[#3DDC97]"}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs text-muted-foreground font-sans">
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-sans">Interest (APR)</span>
                          <span className="font-sans font-medium text-foreground">{loan.interest_rate > 0 ? `${loan.interest_rate}%` : "0% (Interest-Free)"}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-sans">Monthly Payment</span>
                          <span className="font-sans font-medium text-foreground">{loan.monthly_payment > 0 ? formatMoney(loan.monthly_payment, currency) : "Flexible"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isPaid && (
                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-end font-sans">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setPaymentAmount(String(loan.monthly_payment > 0 ? loan.monthly_payment : ""));
                          setPayOpen(true);
                        }}
                        className="w-full gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold font-sans"
                      >
                        <CreditCard className="h-3.5 w-3.5 text-[#3DDC97]" />
                        Record Repayment
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Loan Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md bg-[#0c100e] border-white/10 text-white font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Landmark className="h-5 w-5 text-[#3DDC97]" /> Add Loan / Liability
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3 font-sans">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium font-sans">Loan Name</label>
              <Input
                placeholder="e.g. Bank Car Loan, Mortgage, Student Loan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Type</label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c100e] border-white/10 text-white font-sans">
                    <SelectItem value="borrowed">I Owe (Liability)</SelectItem>
                    <SelectItem value="lent">Money Lent (Asset)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Lender / Borrower</label>
                <Input
                  placeholder="e.g. Chase Bank, Friend Name"
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  className="bg-white/5 border-white/10 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-sans">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Principal Amount ({currency})</label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  className="bg-white/5 border-white/10 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Interest Rate (APR %)</label>
                <Input
                  type="number"
                  placeholder="e.g. 5.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="bg-white/5 border-white/10 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-sans">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Monthly Payment ({currency})</label>
                <Input
                  type="number"
                  placeholder="e.g. 350"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  className="bg-white/5 border-white/10 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium font-sans">Next Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white/5 border-white/10 font-sans"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)} className="font-sans">Cancel</Button>
            <Button onClick={() => createLoanMutation.mutate()} className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-semibold font-sans">
              Save Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Repayment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md bg-[#0c100e] border-white/10 text-white font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <CreditCard className="h-5 w-5 text-[#3DDC97]" /> Record Loan Payment
            </DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4 py-3 font-sans">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs font-sans">
                <span>{selectedLoan.name}</span>
                <span className="text-[#3DDC97] font-bold">Remaining: {formatMoney(selectedLoan.remaining_amount, currency)}</span>
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-xs text-muted-foreground font-medium font-sans">Payment Amount ({currency})</label>
                <Input
                  type="number"
                  placeholder="e.g. 350"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="bg-white/5 border-white/10 font-sans text-lg"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-xs text-muted-foreground font-medium font-sans">Pay From Account (Optional)</label>
                <Select value={paySourceAcc} onValueChange={setPaySourceAcc}>
                  <SelectTrigger className="bg-white/5 border-white/10 font-sans">
                    <SelectValue placeholder="Select Bank/Wallet Account..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c100e] border-white/10 text-white font-sans">
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground font-sans">
                  Selecting an account will automatically record an expense transaction and adjust your account live balance.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayOpen(false)} className="font-sans">Cancel</Button>
            <Button onClick={() => payLoanMutation.mutate()} className="glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-semibold font-sans">
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog (No browser popup!) */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent className="bg-[#0c100e] border-white/10 text-white sm:max-w-md font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400" /> Delete Loan Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground font-sans">
              Are you sure you want to delete this loan record? This action cannot be undone and will remove it from your planner tracking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)} className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-sans">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTargetId && confirmDeleteLoan(deleteTargetId)} className="bg-orange-500 hover:bg-orange-400 text-black font-semibold font-sans">
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/loans")({
  component: LoansPage,
});
