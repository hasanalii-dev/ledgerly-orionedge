# Personal Finance & Business Planner — v1 Plan

Premium dark-first financial workspace for entrepreneurs. Scope: **Core + Vaults**. Palette: **Graphite + Emerald** (`#0B0F0D` bg, `#141A17` surface, `#1E2622` elevated, `#3DDC97` accent, `#E6E8E6` text). Typography: **General Sans** (display) + **Satoshi** (body) as the Samsung Sharp Sans stand-in — both premium geometric sans, self-hosted via Fontsource.

## What v1 ships

**Auth & profile**
- Email/password + Google (Lovable Cloud), Remember Me, Forgot Password → `/reset-password`, profile page (name, avatar, default currency, theme).

**Multi-Planner workspace**
- Planner switcher in sidebar. Create / rename / duplicate / delete / select. Every row in every module is scoped by `planner_id` via RLS. Duplicate copies structure + entries (not vault files).

**Dashboard** — KPI cards (Total Income, Total Expenses, Net Cash Flow, Current Balance, Business Savings, Personal Savings, Tax Reserve, Emergency Fund) + widgets (Biggest Client, Highest Expense Category, Avg Monthly Income, This Month Profit, Pending Invoices, Recent Transactions, Recent Activity).

**Income ledger** — Editable spreadsheet-style table (TanStack Table + inline edit). Columns: Date, Client, Project, Description, Amount, Currency, Account, Status (Pending / Advance / Partial / Paid / Refunded), Invoice, Payment Proof, Notes. Sort, filter, search, multi-select, delete, duplicate, add/rearrange custom columns (per-planner column config). Autosave.

**Expense ledger** — Same table engine. Columns: Date, Category, Description, Vendor, Amount, Currency, Account, Receipt, Notes. Seeded categories + custom.

**Cash Flow** — Daily / Weekly / Monthly / Yearly aggregates (Income − Expenses) with line chart.

**Accounts** — Multiple accounts (Askari, NayaPay, SadaPay, JazzCash, EasyPaisa, Cash Wallet, custom). Per-account balance, incoming, outgoing, transfers. Transfers create paired ledger entries that don't count as income/expense.

**Clients** — CRUD + auto-rollups (Total Revenue, # Projects, # Invoices, Outstanding).

**Projects** — CRUD linked to client, with Value, Start, Deadline, Status, auto Payments Received / Remaining.

**Invoice Vault** — Invoice # / client / project / date / amount / currency / status / PDF. Preview in modal. Linked to client, project, income entry.

**Payment Proof Vault** — PNG/JPG/PDF upload; link to client, project, invoice, income, account.

**Receipt Vault** — PNG/JPG/PDF upload; auto-links to expense row.

**Document Vault** — Folders (Invoices, Payment Proofs, Receipts, Contracts, Tax Documents, Other). Drag & drop upload, search, preview, download, rename, delete.

**Goals** — Target, saved, deadline, progress bar, %.

**Budget** — Monthly budgets per category with Spent/Remaining/Progress from expense data.

**Charts** — Recharts: pie (expense breakdown, income sources, account distribution), bar (monthly income/expenses, client revenue, category spending), line (income/expense growth, net cash flow, savings growth).

**Timeline** — Activity feed written by triggers on income/expense/invoice/proof/receipt inserts. Click → related item.

**Notes** — Simple per-planner notes.

**Global search** — Cmd/Ctrl+K palette across clients, projects, transactions, invoices, documents, notes.

**Settings** — Default currency, multi-currency toggle, date format, theme, export JSON, import JSON.

## Deferred to v2 (called out so we don't over-promise)

Reports (monthly/quarterly/yearly PDF/CSV/Excel export), backup & restore beyond JSON, keyboard-shortcut cheatsheet, real-time collaboration.

## Technical section

**Stack**: TanStack Start (existing), Lovable Cloud (Supabase) for auth/DB/storage, TanStack Query for data, TanStack Table for spreadsheet UX, Recharts for charts, shadcn/ui + Tailwind v4 tokens, Fontsource for General Sans + Satoshi, `dnd-kit` for drag-and-drop uploads and column reordering, `date-fns` for periods, `zod` for validation.

**Routes** (all authed live under `_authenticated/`):
```
/auth, /auth/callback, /reset-password
/_authenticated/                → redirects to last planner
/_authenticated/p/$plannerId/dashboard
/_authenticated/p/$plannerId/income
/_authenticated/p/$plannerId/expenses
/_authenticated/p/$plannerId/cashflow
/_authenticated/p/$plannerId/accounts
/_authenticated/p/$plannerId/clients   /_authenticated/p/$plannerId/clients/$id
/_authenticated/p/$plannerId/projects  /_authenticated/p/$plannerId/projects/$id
/_authenticated/p/$plannerId/invoices
/_authenticated/p/$plannerId/vault/{payments,receipts,documents}
/_authenticated/p/$plannerId/goals
/_authenticated/p/$plannerId/budget
/_authenticated/p/$plannerId/charts
/_authenticated/p/$plannerId/timeline
/_authenticated/p/$plannerId/notes
/_authenticated/settings, /_authenticated/profile
```

**DB tables** (all with `planner_id` + `user_id`, RLS via `auth.uid()`):
`profiles, planners, accounts, clients, projects, invoices, income_entries, expense_entries, expense_categories, transfers, payment_proofs, receipts, documents, folders, goals, budgets, notes, activity_events, custom_columns, custom_column_values`.

Grants + RLS per Lovable rules. Storage buckets: `invoices`, `payment-proofs`, `receipts`, `documents` (private, signed URL reads). Activity feed populated via `AFTER INSERT` triggers.

**Server functions** (createServerFn + requireSupabaseAuth) for: planner CRUD/duplicate, ledger upserts, transfer creation (atomic paired rows), signed-URL minting, global search, JSON export/import.

**Design tokens** in `src/styles.css`:
```
--background: oklch(0.16 0.01 155)   /* #0B0F0D */
--card:       oklch(0.22 0.008 155)  /* #141A17 */
--elevated:   oklch(0.28 0.01 155)   /* #1E2622 */
--primary:    oklch(0.82 0.17 160)   /* #3DDC97 emerald */
--foreground: oklch(0.94 0.005 155)  /* #E6E8E6 */
--font-display: "General Sans"; --font-sans: "Satoshi";
```
Rounded-2xl cards, hairline borders `oklch(1 0 0 / 6%)`, subtle emerald glow on primary CTAs, no gradients-on-white, no purple.

**Build order**
1. Enable Lovable Cloud, design tokens, fonts, app shell (sidebar + topbar + planner switcher).
2. Auth (email + Google) + `_authenticated` gate + profile.
3. Planner CRUD + routing.
4. Accounts, Clients, Projects (foundation for ledgers).
5. Income + Expense editable tables with custom columns.
6. Invoice, Payment Proof, Receipt, Document vaults + storage.
7. Cash Flow, Charts, Budget, Goals.
8. Timeline (triggers), Notes, Global search, Settings (export/import).

**Out of scope confirmations**: no reports export, no backup/restore beyond JSON, no real-time collab in v1.
