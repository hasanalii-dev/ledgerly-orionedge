export type WorkspaceType =
  | "personal"
  | "freelancer"
  | "business"
  | "agency"
  | "startup"
  | "creator"
  | "student"
  | "nonprofit"
  | "other";

export interface WorkspaceTypeOption {
  id: WorkspaceType;
  title: string;
  description: string;
  iconName: string;
  isBusiness: boolean;
}

export const WORKSPACE_TYPES: WorkspaceTypeOption[] = [
  {
    id: "personal",
    title: "Personal Finance",
    description: "Manage household budget, savings goals, and daily expenses",
    iconName: "User",
    isBusiness: false,
  },
  {
    id: "freelancer",
    title: "Freelancer / Solopreneur",
    description: "Track client invoices, project profits, and personal income",
    iconName: "Briefcase",
    isBusiness: true,
  },
  {
    id: "business",
    title: "Small / Medium Business",
    description: "Full financial suite for company revenue, expenses, and cash flow",
    iconName: "Building2",
    isBusiness: true,
  },
  {
    id: "agency",
    title: "Marketing / Digital Agency",
    description: "Manage retainers, client accounts, contractor costs, and margin",
    iconName: "Megaphone",
    isBusiness: true,
  },
  {
    id: "startup",
    title: "High-Growth Startup",
    description: "Track burn rate, runway, investor reports, and capital metrics",
    iconName: "Rocket",
    isBusiness: true,
  },
  {
    id: "creator",
    title: "Creator / Influencer",
    description: "Monetize sponsorships, ad revenue, merch, and content costs",
    iconName: "Sparkles",
    isBusiness: false,
  },
  {
    id: "student",
    title: "Student",
    description: "Keep track of allowances, tuition, food, and savings targets",
    iconName: "GraduationCap",
    isBusiness: false,
  },
  {
    id: "nonprofit",
    title: "Non-Profit / NGO",
    description: "Track grants, donor contributions, and operational expenses",
    iconName: "HeartHandshake",
    isBusiness: true,
  },
  {
    id: "other",
    title: "Other / Custom",
    description: "Custom financial configuration tailored to your workflow",
    iconName: "LayoutGrid",
    isBusiness: false,
  },
];

export const INDUSTRIES = [
  "Marketing Agency",
  "Software & IT Services",
  "E-Commerce & Retail",
  "Consulting & Professional Services",
  "Real Estate & Property Management",
  "Healthcare & Wellness",
  "Construction & Contracting",
  "Restaurant & Hospitality",
  "Education & EdTech",
  "Finance & Accounting",
  "Media & Entertainment",
  "Manufacturing & Logistics",
  "Non-Profit & Community",
  "Legal Services",
  "Design & Creative Services",
  "Other Industry",
];

export const COMPANY_SIZES = [
  { id: "1", label: "Just Me" },
  { id: "2-10", label: "2–10 Employees" },
  { id: "11-50", label: "11–50 Employees" },
  { id: "50+", label: "50+ Employees" },
];

export const WORKFLOW_OPTIONS = [
  { id: "excel", label: "Microsoft Excel", icon: "Table" },
  { id: "sheets", label: "Google Sheets", icon: "Sheet" },
  { id: "notion", label: "Notion", icon: "FileText" },
  { id: "quickbooks", label: "QuickBooks", icon: "BookOpen" },
  { id: "xero", label: "Xero", icon: "CreditCard" },
  { id: "wave", label: "Wave Accounting", icon: "Activity" },
  { id: "other_app", label: "Another App", icon: "Smartphone" },
  { id: "none", label: "I don't track currently", icon: "CircleDashed" },
];

export const PRIMARY_GOAL_OPTIONS = [
  { id: "budget_better", label: "Budget Better" },
  { id: "track_expenses", label: "Track Expenses" },
  { id: "manage_cash_flow", label: "Manage Cash Flow" },
  { id: "save_money", label: "Save Money" },
  { id: "financial_planning", label: "Financial Planning" },
  { id: "invoicing", label: "Invoicing & Billing" },
  { id: "client_management", label: "Client Management" },
  { id: "tax_prep", label: "Tax Preparation" },
  { id: "project_profitability", label: "Project Profitability" },
  { id: "business_reports", label: "Business Reports" },
  { id: "investments", label: "Investments & Wealth" },
];

export interface CategoryPreset {
  name: string;
  color: string;
  type: "income" | "expense";
}

export function getCategoryPresets(workspaceType: WorkspaceType): CategoryPreset[] {
  switch (workspaceType) {
    case "student":
      return [
        { name: "Allowance", color: "#3DDC97", type: "income" },
        { name: "Scholarship & Grants", color: "#38BDF8", type: "income" },
        { name: "Part-time Job", color: "#A855F7", type: "income" },
        { name: "Food & Groceries", color: "#F43F5E", type: "expense" },
        { name: "Transportation", color: "#FB923C", type: "expense" },
        { name: "Tuition & Books", color: "#EAB308", type: "expense" },
        { name: "Entertainment", color: "#EC4899", type: "expense" },
        { name: "Subscriptions", color: "#6366F1", type: "expense" },
      ];

    case "agency":
    case "freelancer":
      return [
        { name: "Client Retainers", color: "#3DDC97", type: "income" },
        { name: "Project Milestones", color: "#38BDF8", type: "income" },
        { name: "Consulting Fees", color: "#A855F7", type: "income" },
        { name: "Software & Tools (Figma/Adobe)", color: "#F43F5E", type: "expense" },
        { name: "Hosting & Cloud Infra", color: "#FB923C", type: "expense" },
        { name: "Subcontractors & Payroll", color: "#EAB308", type: "expense" },
        { name: "Marketing & Ads", color: "#EC4899", type: "expense" },
        { name: "Office & Operations", color: "#64748B", type: "expense" },
      ];

    case "business":
    case "startup":
      return [
        { name: "Product Sales Revenue", color: "#3DDC97", type: "income" },
        { name: "Service Revenue", color: "#38BDF8", type: "income" },
        { name: "Investment & Grants", color: "#A855F7", type: "income" },
        { name: "Payroll & Salaries", color: "#F43F5E", type: "expense" },
        { name: "Marketing & Acquisition", color: "#FB923C", type: "expense" },
        { name: "Software & Subscriptions", color: "#EAB308", type: "expense" },
        { name: "Office Rent & Utilities", color: "#EC4899", type: "expense" },
        { name: "Legal & Taxes", color: "#64748B", type: "expense" },
      ];

    case "creator":
      return [
        { name: "Sponsorships & Deals", color: "#3DDC97", type: "income" },
        { name: "AdSense & Ad Revenue", color: "#38BDF8", type: "income" },
        { name: "Merchandise & Digital Products", color: "#A855F7", type: "income" },
        { name: "Production & Equipment", color: "#F43F5E", type: "expense" },
        { name: "Software & Plugins", color: "#FB923C", type: "expense" },
        { name: "Editors & Thumbnail Artists", color: "#EAB308", type: "expense" },
        { name: "Travel & Events", color: "#EC4899", type: "expense" },
      ];

    case "nonprofit":
      return [
        { name: "Individual Donations", color: "#3DDC97", type: "income" },
        { name: "Government & Foundation Grants", color: "#38BDF8", type: "income" },
        { name: "Corporate Sponsorships", color: "#A855F7", type: "income" },
        { name: "Program Delivery", color: "#F43F5E", type: "expense" },
        { name: "Staff Payroll", color: "#FB923C", type: "expense" },
        { name: "Fundraising Operations", color: "#EAB308", type: "expense" },
        { name: "Administrative Costs", color: "#64748B", type: "expense" },
      ];

    case "personal":
    default:
      return [
        { name: "Salary & Wages", color: "#3DDC97", type: "income" },
        { name: "Freelance & Side Hustles", color: "#38BDF8", type: "income" },
        { name: "Investment Dividends", color: "#A855F7", type: "income" },
        { name: "Rent & Mortgage", color: "#F43F5E", type: "expense" },
        { name: "Groceries & Dining", color: "#FB923C", type: "expense" },
        { name: "Utilities & Bills", color: "#EAB308", type: "expense" },
        { name: "Shopping & Personal", color: "#EC4899", type: "expense" },
        { name: "Travel & Leisure", color: "#64748B", type: "expense" },
      ];
  }
}

export interface WorkspaceDefaults {
  hideModules: string[]; // Modules hidden by default (user can unhide anytime)
  primaryMetrics: string[];
  clientTerm: string; // e.g. "Clients", "Customers", "Donors", "Sponsors"
}

export function getWorkspaceDefaults(workspaceType: WorkspaceType): WorkspaceDefaults {
  switch (workspaceType) {
    case "student":
    case "personal":
      return {
        hideModules: ["clients", "projects", "invoices"], // Hidden by default, customizable anytime
        primaryMetrics: ["balance", "income", "expenses", "budget_progress", "goals"],
        clientTerm: "Clients",
      };

    case "agency":
    case "freelancer":
      return {
        hideModules: [],
        primaryMetrics: ["clients", "project_profit", "upcoming_invoices", "cash_flow", "income"],
        clientTerm: "Clients",
      };

    case "business":
    case "startup":
      return {
        hideModules: [],
        primaryMetrics: ["monthly_revenue", "outstanding_invoices", "team_costs", "cash_flow", "break_even"],
        clientTerm: "Customers",
      };

    case "creator":
      return {
        hideModules: ["invoices"],
        primaryMetrics: ["sponsorship_income", "production_costs", "net_margin", "goals"],
        clientTerm: "Sponsors",
      };

    case "nonprofit":
      return {
        hideModules: [],
        primaryMetrics: ["grants_received", "program_expenses", "fundraising_goals", "cash_flow"],
        clientTerm: "Donors",
      };

    default:
      return {
        hideModules: [],
        primaryMetrics: ["balance", "income", "expenses", "budget_progress"],
        clientTerm: "Clients",
      };
  }
}
