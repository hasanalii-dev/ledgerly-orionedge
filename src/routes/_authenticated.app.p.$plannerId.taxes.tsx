import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { formatMoney } from "@/lib/format";
import { calculatePakistanTax, TaxProfile, TaxTransaction } from "@/lib/tax-engine-pk";
import { Scale, CheckCircle2, AlertCircle, FileText, Briefcase, Landmark, Info } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function TaxesPage() {
  const { plannerId } = Route.useParams();
  const currency = usePlannerCurrency(plannerId);
  const qc = useQueryClient();

  const { data: planner, isLoading: isPlannerLoading } = useQuery({
    queryKey: ["planner", plannerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("planners").select("*").eq("id", plannerId).single();
      if (error) throw error;
      const localConfigs = JSON.parse(localStorage.getItem("capient_planner_configs") || "{}");
      return {
        ...data,
        custom_config: localConfigs[data.id]?.custom_config || data.custom_config || {}
      };
    },
  });

  const { data: transactions = [], isLoading: isTxLoading } = useQuery({
    queryKey: ["tax-transactions", plannerId],
    queryFn: async () => {
      // Fetch income
      const { data: incomeData } = await supabase.from("income_entries").select("id, amount, date, income_categories(name)").eq("planner_id", plannerId);
      // Fetch expenses
      const { data: expenseData } = await supabase.from("expense_entries").select("id, amount, date, expense_categories(name)").eq("planner_id", plannerId);
      // Fetch monthly tracking (allocations)
      const { data: monthlyData } = await (supabase as any).from("monthly_allocations").select("id, amount, allocation_type, category").eq("planner_id", plannerId);
      
      const txs: TaxTransaction[] = [];
      
      incomeData?.forEach(inc => {
        const catName = inc.income_categories?.name || "";
        const isItExport = catName.toLowerCase().includes("it export");
        const isDividend = catName.toLowerCase().includes("dividend");
        
        txs.push({
          id: inc.id,
          amount: inc.amount,
          type: "income",
          categoryName: catName,
          regime: (isItExport || isDividend) ? "FTR" : "NTR",
          isITExport: isItExport
        });
      });
      
      expenseData?.forEach(exp => {
        const catName = exp.expense_categories?.name || "";
        const isTax = catName.toLowerCase().includes("tax");
        
        txs.push({
          id: exp.id,
          amount: exp.amount,
          type: isTax ? "withholding" : "expense",
          categoryName: catName,
          regime: "NTR"
        });
      });
      
      monthlyData?.forEach((m: any) => {
        const isItExport = m.category.toLowerCase().includes("it export");
        const isDividend = m.category.toLowerCase().includes("dividend");
        const isTax = m.category.toLowerCase().includes("tax");
        
        if (m.allocation_type === "earning") {
           txs.push({
             id: m.id,
             amount: m.amount,
             type: "income",
             categoryName: m.category,
             regime: (isItExport || isDividend) ? "FTR" : "NTR",
             isITExport: isItExport
           });
        } else if (m.allocation_type === "expense") {
           txs.push({
             id: m.id,
             amount: m.amount,
             type: isTax ? "withholding" : "expense",
             categoryName: m.category,
             regime: "NTR"
           });
        }
      });
      
      return txs;
    }
  });

  const workspaceType = planner?.workspace_type || "personal";
  
  let defaultEntity = "Salaried";
  if (workspaceType === "freelance" || workspaceType === "agency") {
    defaultEntity = "Business";
  } else if (workspaceType === "startup") {
    defaultEntity = "SmallCompany";
  }

  const defaultProfile: TaxProfile = {
    taxYear: "2026-2027",
    isFiler: false,
    residencyStatus: "Resident",
    entityType: defaultEntity as any,
    isPsebRegistered: false,
    isTeacherResearcher: false,
    openingWealth: 0,
  };

  const taxProfile = (planner?.custom_config?.taxProfile as TaxProfile) || defaultProfile;
  const [profile, setProfile] = useState<TaxProfile>(taxProfile);

  useEffect(() => {
    if (planner?.custom_config?.taxProfile) {
      setProfile(planner.custom_config.taxProfile as TaxProfile);
    }
  }, [planner?.custom_config?.taxProfile]);

  const saveProfileMutation = useMutation({
    mutationFn: async (newProfile: TaxProfile) => {
      const targetId = plannerId;
      const localConfigs = JSON.parse(localStorage.getItem("capient_planner_configs") || "{}");
      
      const updatedConfig = {
        ...(planner?.custom_config || {}),
        taxProfile: newProfile
      };
      
      if (!localConfigs[targetId]) {
         localConfigs[targetId] = { custom_config: {} };
      }
      localConfigs[targetId].custom_config = updatedConfig;
      
      localStorage.setItem("capient_planner_configs", JSON.stringify(localConfigs));
      
      // Removed database update because custom_config column does not exist on planners in production schema
      // This ensures offline-first local saving works instantly.
    },
    onSuccess: () => {
      toast.success("Tax profile saved successfully!");
      qc.invalidateQueries({ queryKey: ["planner", plannerId] });
    },
    onError: (err: any) => {
      toast.error("Failed to save profile: " + err.message);
    }
  });

  if (isPlannerLoading || isTxLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Calculate current wealth (simplified sum of account balances)
  // For a real implementation, we'd query the accounts table.
  const closingWealth = 0; // Placeholder for now, needs real account balances if doing full 116.

  const result = calculatePakistanTax(taxProfile, transactions, closingWealth);

  return (
    <div className="flex-1 p-4 md:p-8 w-full pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-[#3DDC97]" />
            <h1 className="text-3xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-white tracking-tight">Tax Center</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl font-['Questrial',_sans-serif]">
            Automated tax calculation engine optimized for the Pakistan Income Tax Ordinance, 2001 (Finance Act 2026).
          </p>
          <p className="text-[11px] text-muted-foreground/60 max-w-2xl mt-1">
            Disclaimer: These calculations are estimates based on logged cashflow and current statutory rules. They do not constitute formal legal or financial advice. Please consult with an FBR-certified tax practitioner before filing your returns.
          </p>
        </div>

        {/* Eligibility Banner */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${result.totalTaxLiability > 0 ? 'bg-[#FF5F56]/10 border-[#FF5F56]/30 text-[#FF5F56]' : 'bg-[#3DDC97]/10 border-[#3DDC97]/30 text-[#3DDC97]'}`}>
           {result.totalTaxLiability > 0 ? <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />}
           <div>
              <h4 className="font-semibold text-sm">
                {result.totalTaxLiability > 0 ? "You are liable to pay tax." : "You fall under the tax exemption threshold."}
              </h4>
              <p className="text-xs mt-1 opacity-90 leading-relaxed">
                {result.totalTaxLiability > 0 
                  ? `Based on your monthly tracking, your income exceeds the statutory limits. Your total estimated liability is ${formatMoney(result.totalTaxLiability, currency)}.`
                  : "Based on your monthly tracking, your taxable income is currently below the PKR 600,000 exemption limit and you have no FTR income."}
              </p>
           </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
            <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-[#3DDC97] data-[state=active]:text-black transition-all">Overview</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-[#3DDC97] data-[state=active]:text-black transition-all">Tax Profile</TabsTrigger>
            <TabsTrigger value="reconciliation" className="rounded-lg data-[state=active]:bg-[#3DDC97] data-[state=active]:text-black transition-all">Wealth Reconciliation</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* Liability Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Gross Taxable Income (NTR)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white font-['Samsung_Sharp_Sans',_sans-serif]">
                    {formatMoney(result.grossTaxableIncomeNTR, currency)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.isTreatedAsSalaried ? "Taxed under Salaried Slabs" : "Taxed under Business Slabs"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Gross FTR Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white font-['Samsung_Sharp_Sans',_sans-serif]">
                    {formatMoney(result.grossIncomeFTR, currency)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Subject to Final Tax Regime
                  </p>
                </CardContent>
              </Card>

              <Card className={`border backdrop-blur-xl ${result.netPayableOrRefundable > 0 ? 'bg-[#FF5F56]/10 border-[#FF5F56]/30' : 'bg-[#3DDC97]/10 border-[#3DDC97]/30'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    {result.netPayableOrRefundable > 0 ? 'Net Tax Payable' : 'Net Tax Refundable'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white font-['Samsung_Sharp_Sans',_sans-serif]">
                    {formatMoney(Math.abs(result.netPayableOrRefundable), currency)}
                  </div>
                  <p className="text-xs text-white/70 mt-1">
                    Total Liability: {formatMoney(result.totalTaxLiability, currency)}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Detailed Breakdown */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">Computation Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-muted-foreground">Normal Tax (Base)</span>
                   <span className="font-mono text-white">{formatMoney(result.baseTaxNTR, currency)}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-muted-foreground">Final Tax (FTR)</span>
                   <span className="font-mono text-white">{formatMoney(result.taxFTR, currency)}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-muted-foreground">Super Tax (Sec 4C)</span>
                   <span className="font-mono text-white">{formatMoney(result.superTax, currency)}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-[#3DDC97]">Less: Withholding Taxes Paid</span>
                   <span className="font-mono text-[#3DDC97]">-{formatMoney(result.totalWithholdingPaid, currency)}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 font-bold text-lg">
                   <span className="text-white">Net Position</span>
                   <span className={`font-mono ${result.netPayableOrRefundable > 0 ? 'text-[#FF5F56]' : 'text-[#3DDC97]'}`}>
                     {formatMoney(result.netPayableOrRefundable, currency)}
                   </span>
                 </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="profile" className="mt-6">
             <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
               <CardHeader>
                 <CardTitle className="text-lg text-white">Tax Compliance Profile</CardTitle>
                 <CardDescription>Configure your entity type and statutory parameters.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <Label>Entity Type</Label>
                     <Select value={profile.entityType} onValueChange={(val: any) => setProfile(p => ({...p, entityType: val}))}>
                        <SelectTrigger className="bg-black/20 border-white/10 text-white h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a1010] border-white/10">
                          <SelectItem value="Salaried">Salaried Individual</SelectItem>
                          <SelectItem value="Business">Business / Sole Proprietor</SelectItem>
                          <SelectItem value="AOP">Association of Persons (AOP)</SelectItem>
                          <SelectItem value="SmallCompany">Small Company</SelectItem>
                          <SelectItem value="Corporate">Corporate / General</SelectItem>
                        </SelectContent>
                     </Select>
                   </div>
                   
                   <div className="space-y-2">
                     <Label>Tax Year</Label>
                     <Select value={profile.taxYear} onValueChange={(val: any) => setProfile(p => ({...p, taxYear: val}))}>
                        <SelectTrigger className="bg-black/20 border-white/10 text-white h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a1010] border-white/10">
                          <SelectItem value="2026-2027">2026-2027 (FY27)</SelectItem>
                          <SelectItem value="2025-2026">2025-2026 (FY26)</SelectItem>
                        </SelectContent>
                     </Select>
                   </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium text-sm">FBR Active Taxpayer (ATL)</h4>
                        <p className="text-xs text-muted-foreground">Are you currently listed on the Active Taxpayers List?</p>
                      </div>
                      <Switch checked={profile.isFiler} onCheckedChange={(c) => setProfile(p => ({...p, isFiler: c}))} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium text-sm">PSEB Registered (IT Export)</h4>
                        <p className="text-xs text-muted-foreground">Applies 0.25% FTR instead of 1% on IT Exports.</p>
                      </div>
                      <Switch checked={profile.isPsebRegistered} onCheckedChange={(c) => setProfile(p => ({...p, isPsebRegistered: c}))} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium text-sm">Full-Time Teacher / Researcher</h4>
                        <p className="text-xs text-muted-foreground">Grants 25% rebate on salaried tax liability.</p>
                      </div>
                      <Switch checked={profile.isTeacherResearcher} onCheckedChange={(c) => setProfile(p => ({...p, isTeacherResearcher: c}))} />
                    </div>
                 </div>
                 
                 <Button onClick={() => saveProfileMutation.mutate(profile)} disabled={saveProfileMutation.isPending} className="w-full h-12 mt-6 glow-emerald bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-bold">
                   {saveProfileMutation.isPending ? "Saving..." : "Save Profile"}
                 </Button>

               </CardContent>
             </Card>
          </TabsContent>
          
          <TabsContent value="reconciliation" className="mt-6">
             <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
               <CardHeader>
                 <CardTitle className="text-lg text-white">Section 116 Wealth Reconciliation</CardTitle>
                 <CardDescription>Ensure your wealth matches your net inflows perfectly to avoid FBR notices.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                  
                  <div className={`p-4 rounded-xl border ${result.wealthReconciliationVariance === 0 ? 'bg-[#3DDC97]/10 border-[#3DDC97]/30 text-[#3DDC97]' : 'bg-[#FF5F56]/10 border-[#FF5F56]/30 text-[#FF5F56]'}`}>
                     <div className="flex items-center gap-3">
                        {result.wealthReconciliationVariance === 0 ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        <div>
                           <h4 className="font-semibold text-sm">
                             {result.wealthReconciliationVariance === 0 ? "Perfectly Reconciled" : "Un-Reconciled Variance"}
                           </h4>
                           <p className="text-xs mt-0.5 font-mono">
                              Variance: {formatMoney(result.wealthReconciliationVariance, currency)}
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label>Opening Wealth (July 1st)</Label>
                     <Input 
                       type="number"
                       value={profile.openingWealth || 0}
                       onChange={(e) => setProfile(p => ({...p, openingWealth: parseFloat(e.target.value) || 0}))}
                       className="bg-black/20 border-white/10 text-white h-12"
                     />
                     <p className="text-xs text-muted-foreground mt-2">
                        To accurately reconcile, we subtract Opening Wealth from current Net Worth, then compare the delta against your Net Cashflow (Inflows - Outflows). Note: We currently assume Net Worth = 0 for demonstration.
                     </p>
                     
                     <Button onClick={() => saveProfileMutation.mutate(profile)} disabled={saveProfileMutation.isPending} variant="outline" className="mt-4 border-white/10 hover:bg-white/5 text-white">
                       Save Opening Wealth
                     </Button>
                  </div>

               </CardContent>
             </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/taxes")({
  component: TaxesPage,
});
