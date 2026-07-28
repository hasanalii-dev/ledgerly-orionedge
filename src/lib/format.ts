export function formatMoney(amount: number | string | null | undefined, currency = "USD", compact = false) {
  const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (Number.isNaN(n)) return "—";

  const cryptoSymbols: Record<string, string> = {
    BTC: "₿",
    ETH: "Ξ",
    SOL: "◎",
    USDT: "₮",
    BNB: "BNB",
    XRP: "✕",
  };

  if (cryptoSymbols[currency]) {
    const formattedNum = compact
      ? formatCompact(n)
      : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return `${cryptoSymbols[currency]} ${formattedNum}`;
  }

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

export const CURRENCIES = [
  "USD", "EUR", "GBP", "PKR", "AED", "SAR", "INR", "CAD", "AUD", "JPY", "CHF", "CNY", "SGD",
  "BTC", "ETH", "SOL", "USDT", "BNB", "XRP"
] as const;

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Pakistan",
  "United Arab Emirates",
  "Saudi Arabia",
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
];

export const ACCOUNT_KINDS = [
  { value: "bank", label: "Bank Account" },
  { value: "wallet", label: "Digital Wallet" },
  { value: "cash", label: "Cash" },
  { value: "crypto_wallet", label: "Crypto Wallet" },
  { value: "forex_account", label: "Forex Account" },
  { value: "credit_card", label: "Credit Card" },
  { value: "loan_account", label: "Loan / Debt" },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Rent & Housing", color: "#F43F5E" },
  { name: "Software & SaaS", color: "#38BDF8" },
  { name: "Marketing & Ads", color: "#EC4899" },
  { name: "Subcontractors", color: "#A855F7" },
  { name: "Office Supplies", color: "#FB923C" },
  { name: "Travel & Meals", color: "#EAB308" },
  { name: "Utilities & Wifi", color: "#6366F1" },
  { name: "Taxes & Legal", color: "#64748B" },
];

export const DEFAULT_FOLDERS = ["Tax Documents", "Receipts", "Contracts", "Bank Statements"];

export const INCOME_STATUSES = [
  { value: "received", label: "Received" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

export const INVOICE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export const PROJECT_STATUSES = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
];
