import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { 
  ArrowLeft, BookOpen, Zap, LayoutGrid, CreditCard, 
  FileText, Users, Shield, CheckCircle2, Terminal,
  Plus, BarChart3, TrendingUp, Download, Receipt, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — Capient" },
      { name: "description", content: "Comprehensive documentation, guides, and API references for Capient's financial operating system." },
    ]
  }),
  component: DocsPage,
});

const DOCS_SECTIONS = [
  { id: "introduction", title: "Introduction", icon: BookOpen },
  { id: "quickstart", title: "Quickstart", icon: Zap },
  { id: "workspaces", title: "Workspaces & Planners", icon: LayoutGrid },
  { id: "planner-dashboard", title: "Dashboard Tab", icon: LayoutGrid },
  { id: "planner-accounts", title: "Accounts Tab", icon: CreditCard },
  { id: "planner-transactions", title: "Transactions Tab", icon: Receipt },
  { id: "planner-reports", title: "Reports Tab", icon: BarChart3 },
  { id: "finances", title: "Financial Tracking", icon: CreditCard },
  { id: "invoicing", title: "Invoicing & Clients", icon: FileText },
  { id: "collaboration", title: "Collaboration", icon: Users },
  { id: "security", title: "Security & Roles", icon: Shield },
];

function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  // Simulation States
  const [simAccounts, setSimAccounts] = useState([
    { name: "Main Checking", balance: 12500, type: "Bank" }
  ]);
  const [newAccName, setNewAccName] = useState("");
  const [newAccBalance, setNewAccBalance] = useState("");

  const [simTransactions, setSimTransactions] = useState([
    { desc: "Client Payment - Acme Corp", amount: 4500, type: "income", date: "Today" },
    { desc: "Software Subscriptions", amount: 120, type: "expense", date: "Yesterday" }
  ]);

  const [chartRange, setChartRange] = useState("6M");

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccBalance) return;
    setSimAccounts([...simAccounts, { name: newAccName, balance: parseFloat(newAccBalance), type: "Bank" }]);
    setNewAccName("");
    setNewAccBalance("");
  };

  const handleAddTransaction = () => {
    const amount = Math.floor(Math.random() * 500) + 10;
    const isIncome = Math.random() > 0.5;
    setSimTransactions([
      { desc: isIncome ? "Freelance Work" : "Office Supplies", amount, type: isIncome ? "income" : "expense", date: "Just now" },
      ...simTransactions
    ]);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      const current = DOCS_SECTIONS.slice().reverse().find(section => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 250;
        }
        return false;
      });
      if (current && current.id !== activeSection) {
        setActiveSection(current.id);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 100, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#020505] text-foreground flex flex-col relative">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050a0a]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6 max-w-7xl mx-auto w-full gap-4">
          <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg text-white hover:opacity-80 transition-opacity">
            <img src="/favicon.png" alt="Capient" className="h-6 w-6 object-contain" />
            Capient
          </Link>
          <div className="h-4 w-px bg-white/20 mx-2" />
          <span className="text-sm font-medium text-emerald-400">Documentation</span>
          <div className="ml-auto flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r border-white/5 overflow-y-auto hidden md:block py-10 px-6 custom-scrollbar shrink-0">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Getting Started</h4>
            {DOCS_SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 text-left",
                    isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <section.icon className={cn("h-4 w-4", isActive ? "text-primary" : "opacity-70")} />
                  {section.title}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 py-12 px-6 lg:px-16 w-full min-w-0">
          <div className="max-w-3xl">
            
            {/* Introduction */}
            <section id="introduction" className="mb-20 scroll-mt-28">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary mb-6">
                <BookOpen className="h-3.5 w-3.5" /> Introduction
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-6">
                Welcome to Capient Docs
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Capient is the ultimate financial workspace designed for modern professionals, freelancers, and businesses. We combine budgeting, invoicing, client management, and forecasting into a single platform.
              </p>
            </section>
            <hr className="border-white/10 mb-20" />

            {/* Workspaces */}
            <section id="workspaces" className="mb-20 scroll-mt-28">
              <h2 className="text-3xl font-display font-medium mb-6 flex items-center gap-3">
                <LayoutGrid className="h-6 w-6 text-emerald-400" /> Workspaces & Planners
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The core architectural concept in Capient is the <strong>Planner</strong>. A planner acts as an isolated workspace. 
              </p>
              <div className="prose prose-invert prose-emerald max-w-none">
                <p>
                  You can create multiple planners under a single user account. For instance, you might have one planner for your <em>Personal Budget</em> and another for your <em>Freelance Business</em>.
                </p>
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm text-emerald-300/80 my-6 flex items-start gap-3">
                  <Terminal className="h-5 w-5 shrink-0 mt-0.5 text-emerald-500" />
                  <span>Tip: Switch between planners instantly using the dropdown in the top left corner of the App Sidebar. Each planner maintains its own distinct data (invoices, budgets, categories).</span>
                </div>
              </div>
            </section>
            <hr className="border-white/10 mb-20" />

            {/* Dashboard Tutorial */}
            <section id="planner-dashboard" className="mb-20 scroll-mt-28">
              <h2 className="text-3xl font-display font-medium mb-6 flex items-center gap-3">
                <LayoutGrid className="h-6 w-6 text-emerald-400" /> The Dashboard Tab
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The Dashboard is your financial command center. It aggregates data from all your accounts and transactions to provide a high-level overview of your net worth, income, and expenses over time.
              </p>
              
              {/* Interactive Simulation */}
              <div className="bg-[#0b0e0c] border border-white/5 rounded-2xl p-6 overflow-hidden relative group shadow-2xl mt-4">
                <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] uppercase tracking-wider px-3 py-1 font-bold rounded-bl-lg">
                  Interactive Simulation
                </div>
                
                <div className="flex justify-end mb-6">
                  <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                    {["1M", "3M", "6M", "1Y"].map(range => (
                      <button 
                        key={range}
                        onClick={() => setChartRange(range)}
                        className={cn(
                          "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                          chartRange === range ? "bg-primary text-black shadow-md" : "text-white/50 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {/* KPI Card 1 */}
                  <div className="bg-[#111312] rounded-2xl p-5 border border-white/5 flex flex-col justify-between group/kpi overflow-hidden relative shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover/kpi:bg-primary/10 transition-colors duration-500" />
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/5 group-hover/kpi:bg-primary/20 group-hover/kpi:text-primary transition-colors">
                        <Wallet className="h-3.5 w-3.5" />
                      </div> 
                      Net Worth
                    </div>
                    <div className="mt-4 text-2xl font-display font-medium truncate">$45,231.00</div>
                    <div className="mt-1 text-sm text-primary">+12.5% this {chartRange}</div>
                  </div>
                  {/* KPI Card 2 */}
                  <div className="bg-[#111312] rounded-2xl p-5 border border-white/5 flex flex-col justify-between group/kpi overflow-hidden relative shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover/kpi:bg-primary/10 transition-colors duration-500" />
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/5 group-hover/kpi:bg-primary/20 group-hover/kpi:text-primary transition-colors">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </div> 
                      Income
                    </div>
                    <div className="mt-4 text-2xl font-display font-medium truncate text-emerald-400">$12,450.00</div>
                  </div>
                </div>
                
                {/* Fake Chart bars */}
                <div className="h-48 flex items-end justify-between gap-3 border-b border-white/5 pb-2 px-2">
                  {Array.from({ length: chartRange === "1M" ? 4 : chartRange === "3M" ? 12 : 6 }).map((_, i) => (
                    <motion.div 
                      key={`${chartRange}-${i}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.random() * 80 + 20}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="w-full bg-primary/20 hover:bg-primary/40 border border-primary/30 rounded-t-md transition-colors cursor-pointer relative group/bar"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111312] border border-white/10 text-xs text-white px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity shadow-xl">
                        ${Math.floor(Math.random() * 5000) + 1000}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
            <hr className="border-white/10 mb-20" />

            {/* Accounts Tutorial */}
            <section id="planner-accounts" className="mb-20 scroll-mt-28">
              <h2 className="text-3xl font-display font-medium mb-6 flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-emerald-400" /> The Accounts Tab
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Before you can log transactions, you need Accounts. An account can be a Checking account, a Credit Card, a Cash wallet, or even an Investment portfolio. They represent where your money actually lives.
              </p>
              
              {/* Interactive Simulation */}
              <div className="bg-[#0b0e0c] border border-white/5 rounded-2xl p-6 relative shadow-2xl mt-4">
                <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] uppercase tracking-wider px-3 py-1 font-bold rounded-bl-lg">
                  Interactive Simulation
                </div>
                
                <form onSubmit={handleAddAccount} className="flex gap-3 mb-8 mt-4 max-w-xl">
                  <input 
                    type="text" 
                    placeholder="Account Name (e.g. Chase)"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="flex-1 bg-[#111312] border border-white/10 rounded-lg px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                  />
                  <input 
                    type="number" 
                    placeholder="Balance ($)"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    className="w-32 bg-[#111312] border border-white/10 rounded-lg px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                  />
                  <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-black shrink-0 font-medium px-6">
                    <Plus className="h-4 w-4 mr-2" /> Create
                  </Button>
                </form>

                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                  {simAccounts.map((acc, i) => {
                    const kind = acc.type.toLowerCase();
                    let cardStyle = { base: 'bg-[#071d15]', g1: 'from-[#3DDC97]/40', g2: 'from-cyan-500/30', g3: 'from-teal-800/50' };
                    if (kind === 'wallet') cardStyle = { base: 'bg-[#171508]', g1: 'from-yellow-500/40', g2: 'from-amber-600/30', g3: 'from-orange-400/30' };
                    if (kind === 'cash') cardStyle = { base: 'bg-[#051616]', g1: 'from-cyan-400/40', g2: 'from-[#3DDC97]/30', g3: 'from-teal-500/40' };
                    
                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`snap-center shrink-0 rounded-[28px] relative overflow-hidden group w-[85vw] max-w-[360px] aspect-[1.586] flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${cardStyle.base}`}
                      >
                        {/* Abstract geometric shapes */}
                        <div className="absolute inset-0 opacity-100 z-0 mix-blend-screen pointer-events-none">
                          <div className={`absolute -top-[30%] -right-[10%] w-[80%] h-[120%] bg-gradient-to-bl ${cardStyle.g1} to-transparent rotate-12 blur-2xl`} />
                          <div className={`absolute top-[20%] -left-[20%] w-[70%] h-[100%] bg-gradient-to-tr ${cardStyle.g2} to-transparent -rotate-12 blur-3xl`} />
                          <div className={`absolute bottom-[0%] right-[0%] w-[60%] h-[80%] bg-gradient-to-tl ${cardStyle.g3} to-transparent blur-2xl`} />
                        </div>
                        
                        {/* Shimmer Hover Animation */}
                        <div className="absolute inset-0 z-20 pointer-events-none w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] -skew-x-[20deg] group-hover:translate-x-[50%] transition-transform duration-1000 ease-in-out" />

                        {/* Overlay texture on the right half */}
                        <div className="absolute top-0 bottom-0 right-0 w-[45%] opacity-[0.07] z-0 pointer-events-none mix-blend-overlay [mask-image:linear-gradient(to_left,white,transparent)]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'40\' viewBox=\'0 0 20 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 20 L20 0 L20 40 Z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '12px 24px' }} />
                        
                        {/* Frosted Bottom section */}
                        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-white/5 backdrop-blur-[2px] z-0 border-t border-white/5" />

                        {/* Highlight edges */}
                        <div className="absolute inset-0 rounded-[28px] border border-white/10 pointer-events-none z-20" />
                        <div className="absolute inset-0 rounded-[28px] border-t border-white/20 pointer-events-none z-20 [mask-image:linear-gradient(to_bottom,white,transparent_30%)]" />

                        {/* Card Content Top */}
                        <div className="relative z-10 flex justify-between items-start px-6 pt-6">
                          <div>
                            <div className="text-white/80 text-sm font-medium tracking-wide mb-1">{acc.name}</div>
                            <div className="text-white text-xl font-mono tracking-widest drop-shadow-sm font-semibold flex items-center gap-2">
                              <span className="text-white/60">xxxx</span> <span className="text-white/60">xxxx</span> SIMU
                            </div>
                          </div>
                          {/* Badge */}
                          <div className="relative mt-1 h-7 min-w-[60px] flex items-center justify-center">
                            <div className="absolute whitespace-nowrap bg-black/20 backdrop-blur-md border border-white/10 text-white/90 text-[11px] font-medium tracking-wide px-3 py-1.5 rounded-full shadow-inner transition-all duration-300">
                              {acc.type.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        {/* Card Content Bottom */}
                        <div className="relative z-10 flex items-center justify-between px-6 pb-6 mt-auto">
                          <div className="text-white/70 text-sm font-medium">Live Balance</div>
                          <div className="font-display text-3xl font-bold text-white tracking-tight drop-shadow-md">
                            ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>
            <hr className="border-white/10 mb-20" />

            {/* Transactions Tutorial */}
            <section id="planner-transactions" className="mb-20 scroll-mt-28">
              <h2 className="text-3xl font-display font-medium mb-6 flex items-center gap-3">
                <Receipt className="h-6 w-6 text-emerald-400" /> The Transactions Tab
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Transactions are the heartbeat of Capient. Every time money moves, you log it here. Transactions are categorized and tied to specific accounts so your reports remain completely accurate.
              </p>
              
              {/* Interactive Simulation */}
              <div className="bg-[#0b0e0c] border border-white/5 rounded-2xl p-6 relative shadow-2xl mt-4">
                <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] uppercase tracking-wider px-3 py-1 font-bold rounded-bl-lg">
                  Interactive Simulation
                </div>
                
                <div className="flex justify-between items-end mb-6 mt-4">
                  <div>
                    <h3 className="text-white font-medium text-lg">Ledger Overview</h3>
                    <p className="text-sm text-muted-foreground mt-1">Simulate adding an entry.</p>
                  </div>
                  <Button onClick={handleAddTransaction} size="sm" className="bg-primary hover:bg-primary/90 text-black font-medium">
                    <Plus className="h-4 w-4 mr-2" /> Log Entry
                  </Button>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#111312] overflow-hidden flex flex-col gap-1 p-2">
                  {simTransactions.map((tx, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 py-4 flex items-center justify-between rounded-xl bg-white/5 hover:bg-elevated border border-transparent hover:border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-black/40 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all shadow-inner">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-[15px] text-white">{tx.desc}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span className="font-medium">{tx.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn("font-medium font-mono text-[15px]", tx.type === "income" ? "text-emerald-400" : "text-white")}>
                           {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                        </div>
                        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{tx.type}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
            <hr className="border-white/10 mb-20" />

            {/* Reports Tutorial */}
            <section id="planner-reports" className="mb-20 scroll-mt-28">
              <h2 className="text-3xl font-display font-medium mb-6 flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-emerald-400" /> The Reports Tab
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The Reports tab synthesizes all your data into actionable insights. You can view cash flow breakdowns, budget adherence, and generate PDF summaries for tax season or stakeholders.
              </p>
              
              {/* Interactive Simulation */}
              <div className="bg-[#0b0e0c] border border-white/5 rounded-2xl p-6 relative flex flex-col md:flex-row gap-6 shadow-2xl mt-4">
                 <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] uppercase tracking-wider px-3 py-1 font-bold rounded-bl-lg">
                  Static Simulation
                </div>
                <div className="flex-1 space-y-4 mt-4">
                  <div className="p-5 bg-[#111312] border border-white/5 rounded-xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500" />
                    <div className="flex justify-between mb-3 relative z-10">
                      <span className="text-sm font-medium text-white/90">Q3 Operating Expenses</span>
                      <span className="text-sm font-mono text-primary font-medium">78% of budget</span>
                    </div>
                    <div className="h-2.5 bg-black/50 rounded-full overflow-hidden relative z-10 ring-1 ring-white/5">
                      <div className="h-full bg-primary w-[78%] rounded-full shadow-[0_0_10px_rgba(202,255,51,0.5)]"></div>
                    </div>
                  </div>
                  <div className="p-5 bg-[#111312] border border-white/5 rounded-xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500" />
                    <div className="flex justify-between mb-3 relative z-10">
                      <span className="text-sm font-medium text-white/90">Year-to-Date Profit</span>
                      <span className="text-sm font-mono text-primary font-medium">+$12,450.00</span>
                    </div>
                    <div className="h-2.5 bg-black/50 rounded-full overflow-hidden relative z-10 ring-1 ring-white/5">
                      <div className="h-full bg-primary w-[100%] rounded-full shadow-[0_0_10px_rgba(202,255,51,0.5)]"></div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-56 shrink-0 flex flex-col justify-center gap-3">
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 bg-[#111312] justify-start h-11" onClick={() => alert("Simulation: PDF Generated!")}>
                    <Download className="h-4 w-4 mr-3 text-primary" /> Export PDF Summary
                  </Button>
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 bg-[#111312] justify-start h-11" onClick={() => alert("Simulation: CSV Exported!")}>
                    <FileText className="h-4 w-4 mr-3 text-primary" /> Export Raw CSV
                  </Button>
                </div>
              </div>
            </section>
            
            <hr className="border-white/10 mb-20" />

            {/* Financial Tracking */}
            <section id="finances" className="mb-20 scroll-mt-28">
              <h2 className="text-3xl font-display font-medium mb-6 flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-emerald-400" /> Financial Tracking
              </h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-white/10 bg-card/10 rounded-xl p-6">
                    <h3 className="font-semibold text-lg text-white mb-3">Transactions</h3>
                    <p className="text-sm text-muted-foreground">
                      Log income and expenses manually. Every transaction must be linked to a specific Account and a Category to keep your reports accurate.
                    </p>
                  </div>
                  <div className="border border-white/10 bg-card/10 rounded-xl p-6">
                    <h3 className="font-semibold text-lg text-white mb-3">Budgets</h3>
                    <p className="text-sm text-muted-foreground">
                      Set monthly limits on specific expense categories. Capient will track your spending velocity and visually warn you when you are nearing your budget limit.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-white/10 mb-20" />

            {/* Invoicing & Clients */}
            <section id="invoicing" className="mb-20 scroll-mt-28">
              <h2 className="text-3xl font-display font-medium mb-6 flex items-center gap-3">
                <FileText className="h-6 w-6 text-emerald-400" /> Invoicing & Clients
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Capient replaces the need for separate invoicing software. You can manage your client roster and generate professional invoices directly within your business planners.
              </p>
              
              <h4 className="text-lg font-medium text-white mb-4 mt-8">Invoice Lifecycle</h4>
              <div className="flex flex-col gap-3">
                {[
                  { status: "Draft", desc: "The invoice is being created. It hasn't been finalized.", color: "text-muted-foreground" },
                  { status: "Sent", desc: "The invoice has been finalized and emailed to the client.", color: "text-blue-400" },
                  { status: "Paid", desc: "Payment has been received and reconciled.", color: "text-emerald-400" },
                  { status: "Overdue", desc: "The due date has passed without payment.", color: "text-rose-400" }
                ].map((item) => (
                  <div key={item.status} className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-lg p-4">
                    <div className={cn("font-medium w-24", item.color)}>{item.status}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-white/10 mb-20" />

            {/* Collaboration */}
            <section id="collaboration" className="mb-20 scroll-mt-28">
              <h2 className="text-3xl font-display font-medium mb-6 flex items-center gap-3">
                <Users className="h-6 w-6 text-emerald-400" /> Collaboration
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Finance isn't always a solo act. You can invite partners, accountants, or team members into specific planners.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Navigate to Planner Settings.</li>
                <li>Click on the <strong>Members</strong> tab.</li>
                <li>Send an email invite. The recipient will receive an email and a notification inside Capient if they already have an account.</li>
              </ul>
            </section>

            <hr className="border-white/10 mb-20" />

            {/* Security */}
            <section id="security" className="mb-20 scroll-mt-28">
              <h2 className="text-3xl font-display font-medium mb-6 flex items-center gap-3">
                <Shield className="h-6 w-6 text-emerald-400" /> Security & Roles
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Capient is built on top of Supabase and utilizes PostgreSQL Row Level Security (RLS) to ensure that your financial data is strictly isolated. Users can only access rows belonging to planners they own or have been explicitly invited to as collaborators.
              </p>
              <div className="mt-8 p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <h3 className="font-semibold text-emerald-400 mb-2">Need Help?</h3>
                <p className="text-sm text-emerald-400/80 mb-4">
                  If you encounter any issues or have questions that aren't covered in this documentation, our support team is ready to help.
                </p>
                <Button className="glow-emerald bg-emerald-500 hover:bg-emerald-600 text-white">Contact Support</Button>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
