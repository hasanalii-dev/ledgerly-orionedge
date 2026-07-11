import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, LineChart, Wallet, Users, FileText, Sparkles, LayoutGrid, Receipt, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-hairline">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2 font-display font-semibold text-lg">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            Ledgerly
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#modules" className="hover:text-foreground">Modules</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="glow-emerald">Get started<ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, oklch(0.82 0.17 160 / 0.18), transparent 65%), radial-gradient(50% 60% at 80% 40%, oklch(0.72 0.14 200 / 0.10), transparent 60%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-card/50 px-4 py-1.5 text-xs text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Now with multi-planner workspaces
          </div>
          <h1 className="text-5xl md:text-7xl font-display tracking-tight leading-[1.02] max-w-4xl mx-auto">
            The financial <span className="text-primary">operating system</span>
            <br />built for entrepreneurs.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage income, expenses, invoices, clients, and cash flow across unlimited planners. Feels like Notion. Powered like a spreadsheet.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link to="/auth"><Button size="lg" className="h-12 px-6 glow-emerald">Open your workspace<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <a href="#features"><Button size="lg" variant="outline" className="h-12 px-6 border-hairline">Explore features</Button></a>
          </div>

          {/* Mock dashboard */}
          <div className="mt-16 relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-3xl -z-10" />
            <div className="rounded-2xl border border-hairline bg-card/60 backdrop-blur p-4 shadow-2xl">
              <div className="grid grid-cols-4 gap-3 mb-3">
                {[
                  { label: "Total Income", value: "$48,240", tone: "text-primary" },
                  { label: "Total Expenses", value: "$12,910", tone: "text-foreground" },
                  { label: "Net Cash Flow", value: "$35,330", tone: "text-primary" },
                  { label: "Balance", value: "$81,450", tone: "text-foreground" },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl bg-elevated border border-hairline p-4 text-left">
                    <div className="text-xs text-muted-foreground">{k.label}</div>
                    <div className={`mt-2 text-2xl font-display ${k.tone}`}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-elevated border border-hairline h-64 flex items-end justify-between px-6 pb-6 gap-2">
                {[35, 55, 42, 68, 51, 78, 65, 90, 72, 85, 92, 78].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-lg bg-primary/80" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-display tracking-tight">Everything you track. In one calm place.</h2>
            <p className="mt-4 text-muted-foreground">Spreadsheet flexibility, dashboard clarity, and vault-level file organization — without the mess.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: LayoutGrid, title: "Multi-planner workspace", desc: "Separate books for personal, agency, side project. Zero data crossover." },
              { icon: LineChart, title: "Live cash flow", desc: "Daily, weekly, monthly, yearly cuts of income vs expenses." },
              { icon: Wallet, title: "Multiple accounts", desc: "Bank, wallet, cash — transfers don't count as income or expense." },
              { icon: Users, title: "Client CRM", desc: "Revenue, invoices, and outstanding per client, computed automatically." },
              { icon: Receipt, title: "Invoice & receipt vault", desc: "Attach PDFs and screenshots. Link them to income and expense rows." },
              { icon: Target, title: "Goals & budgets", desc: "Track savings goals and monthly budgets with live progress." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-hairline bg-card p-6 hover:bg-elevated transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-24 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-display tracking-tight">Built for how you actually work.</h2>
              <p className="mt-4 text-muted-foreground">Every module speaks to the next. Add income → invoice → payment proof → account balance updates → cash flow reflects it → dashboard refreshes.</p>
              <ul className="mt-6 space-y-3 text-sm">
                {["Editable spreadsheet-style tables", "Inline autosave", "Sticky headers, keyboard navigation", "Custom columns & categories", "Drag-and-drop file uploads"].map((x) => (
                  <li key={x} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {x}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/auth"><Button size="lg" className="glow-emerald">Try it free<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              </div>
            </div>
            <div className="rounded-2xl border border-hairline bg-card overflow-hidden">
              <div className="border-b border-hairline px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> income.planner
              </div>
              <div className="text-xs">
                <div className="grid grid-cols-5 border-b border-hairline text-muted-foreground py-2 px-4">
                  <div>Date</div><div>Client</div><div>Description</div><div>Amount</div><div>Status</div>
                </div>
                {[
                  ["Nov 12", "Nova Studio", "Website redesign", "$4,500", "Paid"],
                  ["Nov 08", "Aurora Labs", "SEO retainer", "$1,800", "Advance"],
                  ["Nov 03", "Kite & Co", "Landing page", "$2,200", "Partial"],
                  ["Oct 28", "Meridian", "Brand system", "$6,900", "Paid"],
                ].map((r, i) => (
                  <div key={i} className="grid grid-cols-5 border-b border-hairline py-3 px-4 hover:bg-elevated">
                    <div>{r[0]}</div><div>{r[1]}</div><div className="text-muted-foreground">{r[2]}</div>
                    <div className="font-medium">{r[3]}</div>
                    <div><span className="rounded-md bg-primary/15 text-primary px-2 py-0.5 text-[10px]">{r[4]}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-24 border-t border-hairline">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-display tracking-tight">Start with your first planner.</h2>
          <p className="mt-4 text-muted-foreground">Free while in preview. No credit card.</p>
          <div className="mt-8">
            <Link to="/auth"><Button size="lg" className="h-12 px-8 glow-emerald">Create your workspace<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-hairline py-8 text-center text-xs text-muted-foreground">
        © Ledgerly · Built for freelancers, agencies, and entrepreneurs.
      </footer>
    </div>
  );
}
