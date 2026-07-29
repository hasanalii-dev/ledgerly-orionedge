// src/lib/tax-engine-pk.ts

export type TaxYear = "2026-2027" | "2025-2026";

export type EntityType = "Salaried" | "Business" | "AOP" | "SmallCompany" | "Corporate";

export interface TaxProfile {
  taxYear: TaxYear;
  isFiler: boolean;
  residencyStatus: "Resident" | "Non-Resident";
  entityType: EntityType;
  isPsebRegistered: boolean;
  isTeacherResearcher: boolean;
  isProfessionalFirmAOP?: boolean; // Caps AOP tax at 40% instead of 45%
  openingWealth?: number;
}

export type TaxRegime = "NTR" | "FTR" | "MTR" | "Exempt";

export interface TaxTransaction {
  id: string;
  amount: number;
  type: "income" | "expense" | "withholding";
  regime: TaxRegime;
  categoryName?: string;
  isForeign?: boolean;
  isITExport?: boolean;
}

export interface TaxResult {
  grossTaxableIncomeNTR: number;
  grossIncomeFTR: number;
  totalWithholdingPaid: number;
  
  // Tax broken down
  baseTaxNTR: number;
  taxFTR: number;
  superTax: number;
  
  // Final numbers
  totalTaxLiability: number;
  netPayableOrRefundable: number;
  
  // Meta
  isTreatedAsSalaried: boolean;
  ntrSalaryRatio: number;
  wealthReconciliationVariance: number;
}

// ---------------------------------------------------------------------------
// SLABS FOR TY 2027 (FY 2026-27)
// ---------------------------------------------------------------------------

const SALARIED_SLABS = [
  { max: 600000, base: 0, rate: 0 },
  { max: 1200000, base: 0, rate: 0.01 },
  { max: 2200000, base: 6000, rate: 0.11 },
  { max: 3200000, base: 116000, rate: 0.20 },
  { max: 4100000, base: 316000, rate: 0.25 },
  { max: 5600000, base: 541000, rate: 0.29 },
  { max: 7000000, base: 976000, rate: 0.32 },
  { max: Infinity, base: 1424000, rate: 0.35 },
];

const NON_SALARIED_SLABS = [
  { max: 600000, base: 0, rate: 0 },
  { max: 1200000, base: 0, rate: 0.15 },
  { max: 1600000, base: 90000, rate: 0.20 },
  { max: 3200000, base: 170000, rate: 0.30 },
  { max: 5600000, base: 650000, rate: 0.40 },
  { max: Infinity, base: 1610000, rate: 0.45 },
];

function calculateProgressiveTax(income: number, slabs: typeof SALARIED_SLABS): number {
  if (income <= 600000) return 0;
  
  let previousMax = 0;
  for (const slab of slabs) {
    if (income <= slab.max) {
      return slab.base + (income - previousMax) * slab.rate;
    }
    previousMax = slab.max;
  }
  return 0; // Fallback
}

export function calculatePakistanTax(
  profile: TaxProfile,
  transactions: TaxTransaction[],
  closingWealth: number = 0
): TaxResult {
  let incomeNTR_Salary = 0;
  let incomeNTR_Business = 0;
  let incomeFTR_ITExport = 0;
  let incomeFTR_Other = 0;
  
  let totalWithholdingPaid = 0;
  let deductibleZakat = 0;
  
  let totalInflows = 0;
  let totalOutflows = 0;

  // 1. Aggregation
  for (const tx of transactions) {
    if (tx.type === "income") {
      totalInflows += tx.amount;
      
      if (tx.regime === "NTR") {
        if (tx.categoryName?.toLowerCase().includes("salary")) {
          incomeNTR_Salary += tx.amount;
        } else {
          incomeNTR_Business += tx.amount;
        }
      } else if (tx.regime === "FTR") {
        if (tx.isITExport) {
          incomeFTR_ITExport += tx.amount;
        } else {
          incomeFTR_Other += tx.amount;
        }
      }
    } else if (tx.type === "expense") {
       totalOutflows += tx.amount;
       if (tx.categoryName?.toLowerCase() === "zakat") {
         deductibleZakat += tx.amount;
       }
    } else if (tx.type === "withholding") {
       totalOutflows += tx.amount;
       totalWithholdingPaid += tx.amount;
    }
  }

  const grossNTR = incomeNTR_Salary + incomeNTR_Business;
  const netTaxableNTR = Math.max(0, grossNTR - deductibleZakat);
  
  // 2. The 75% Rule
  let isTreatedAsSalaried = false;
  const ntrSalaryRatio = grossNTR > 0 ? (incomeNTR_Salary / grossNTR) : 0;
  
  if (profile.entityType === "Salaried" || profile.entityType === "Business") {
    isTreatedAsSalaried = ntrSalaryRatio > 0.75;
  }

  // 3. Progressive Slabs (Base Tax Calculation)
  let baseTaxNTR = 0;
  
  if (profile.entityType === "Corporate") {
    baseTaxNTR = netTaxableNTR * 0.29;
  } else if (profile.entityType === "SmallCompany") {
    baseTaxNTR = netTaxableNTR * 0.20;
  } else {
    if (isTreatedAsSalaried) {
      baseTaxNTR = calculateProgressiveTax(netTaxableNTR, SALARIED_SLABS);
      // Teacher rebate
      if (profile.isTeacherResearcher) {
        baseTaxNTR *= 0.75; 
      }
    } else {
      let calcTax = calculateProgressiveTax(netTaxableNTR, NON_SALARIED_SLABS);
      // AOP cap at 40% if prohibited from incorporation
      if (profile.entityType === "AOP" && profile.isProfessionalFirmAOP) {
        const cappedTax = calculateProgressiveTax(netTaxableNTR, NON_SALARIED_SLABS.slice(0, 5));
        // Recalculate above 5.6m at 40%
        if (netTaxableNTR > 5600000) {
           calcTax = 650000 + ((netTaxableNTR - 3200000) * 0.40);
        }
      }
      
      // Surcharge on non-salaried exceeding 10M
      if (netTaxableNTR > 10000000) {
        calcTax += (calcTax * 0.10);
      }
      baseTaxNTR = calcTax;
    }
  }

  // 4. Final Tax Regime (FTR)
  let taxFTR = 0;
  // IT Exports: 0.25% if PSEB registered, else 1%
  const itExportRate = profile.isPsebRegistered ? 0.0025 : 0.01;
  taxFTR += (incomeFTR_ITExport * itExportRate);
  
  // Other FTR (Simplified assuming 15% generic rate for dividends/e-commerce)
  taxFTR += (incomeFTR_Other * 0.15);

  // 5. Super Tax (Section 4C)
  let superTax = 0;
  const aggregatedIncomeForSuperTax = grossNTR + incomeFTR_ITExport + incomeFTR_Other;
  if (aggregatedIncomeForSuperTax > 500000000) {
    superTax = aggregatedIncomeForSuperTax * 0.10;
  }

  const totalTaxLiability = baseTaxNTR + taxFTR + superTax;
  
  // Withholding penalty for non-filers
  // If the user is a non-filer, we assume the withheld amount stored is ALREADY the doubled amount deducted by their banks.
  const netPayableOrRefundable = totalTaxLiability - totalWithholdingPaid;

  // 6. Wealth Reconciliation: W_t - W_{t-1} = I - E
  // Variance = (W_t - W_{t-1}) - (I - E)
  // If Variance == 0, perfectly reconciled.
  const openingWealth = profile.openingWealth || 0;
  const wealthDelta = closingWealth - openingWealth;
  const cashflowDelta = totalInflows - totalOutflows;
  const wealthReconciliationVariance = wealthDelta - cashflowDelta;

  return {
    grossTaxableIncomeNTR: grossNTR,
    grossIncomeFTR: incomeFTR_ITExport + incomeFTR_Other,
    totalWithholdingPaid,
    baseTaxNTR,
    taxFTR,
    superTax,
    totalTaxLiability,
    netPayableOrRefundable,
    isTreatedAsSalaried,
    ntrSalaryRatio,
    wealthReconciliationVariance
  };
}
