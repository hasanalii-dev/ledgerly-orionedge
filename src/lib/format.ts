export function formatMoney(amount: number | string | null | undefined, currency = "USD", compact = false) {
  const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatDate(d: string | Date | null | undefined, fmt = "medium") {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: fmt === "short" ? "short" : "short",
    day: "numeric",
  });
}

export const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "AED", "INR", "CAD", "AUD", "JPY"] as const;

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Pakistan",
  "United Arab Emirates",
  "India",
  "Japan",
  "Singapore",
  "Brazil",
  "Mexico",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "South Africa",
  "Other Country",
] as const;
export const ACCOUNT_KINDS = ["bank", "wallet", "cash", "other"] as const;
export const INCOME_STATUSES = ["pending", "advance", "partial", "paid", "refunded"] as const;
export const INVOICE_STATUSES = ["pending", "sent", "paid", "overdue", "cancelled"] as const;
export const PROJECT_STATUSES = ["active", "on-hold", "completed", "cancelled"] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Marketing", color: "#3DDC97" },
  { name: "Software", color: "#7CC4FF" },
  { name: "Hosting", color: "#FFB86B" },
  { name: "Domains", color: "#B794F4" },
  { name: "Education", color: "#F687B3" },
  { name: "Hardware", color: "#68D391" },
  { name: "Office", color: "#F6AD55" },
  { name: "Internet", color: "#4FD1C5" },
  { name: "Phone", color: "#9F7AEA" },
  { name: "Transportation", color: "#F56565" },
  { name: "Food", color: "#ED8936" },
  { name: "Taxes", color: "#E53E3E" },
  { name: "Miscellaneous", color: "#A0AEC0" },
];

export const DEFAULT_FOLDERS = [
  "Invoices",
  "Payment Proofs",
  "Receipts",
  "Contracts",
  "Tax Documents",
  "Other Documents",
];
