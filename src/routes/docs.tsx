import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Zap, LayoutGrid, CreditCard, FileText, Users, Shield, CheckCircle2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — Capient" },
      { name: "description", content: "Comprehensive documentation, guides, and API references for Capient's financial operating system." },
      { name: "keywords", content: "capient docs, capient documentation, finance app tutorial, ledger app guide, api reference" },
    ]
  }),
  component: DocsPage,
});

const DOCS_SECTIONS = [
  { id: "introduction", title: "Introduction", icon: BookOpen },
  { id: "quickstart", title: "Quickstart", icon: Zap },
  { id: "workspaces", title: "Workspaces & Planners", icon: LayoutGrid },
  { id: "finances", title: "Financial Tracking", icon: CreditCard },
  { id: "invoicing", title: "Invoicing & Clients", icon: FileText },
  { id: "collaboration", title: "Collaboration", icon: Users },
  { id: "security", title: "Security & Roles", icon: Shield },
];

function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      // Find the current section
      const current = DOCS_SECTIONS.slice().reverse().find(section => {
        const element = document.getElementById(section.id);
        if (element) {
          return element.offsetTop <= scrollPosition;
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
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#020505] text-foreground flex flex-col relative">
      {/* Header */}
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
        {/* Sidebar Navigation */}
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
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <section.icon className={cn("h-4 w-4", isActive ? "text-primary" : "opacity-70")} />
                  {section.title}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 py-12 px-6 lg:px-16 w-full min-w-0">
          <div className="max-w-3xl">
            
            {/* Introduction */}
            <section id="introduction" className="mb-20 scroll-mt-28">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary mb-6">
                <BookOpen className="h-3.5 w-3.5" /> Introduction
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-6">
                Welcome to Capient
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Capient is the ultimate financial workspace designed for modern professionals, freelancers, and businesses. We combine budgeting, invoicing, client management, and forecasting into a single, beautifully designed platform.
              </p>
              
              <div className="bg-card/30 border border-white/10 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-white mb-2">What you will learn</h3>
                <ul className="space-y-3 mt-4">
                  {[
                    "How to set up your multi-planner workspace.",
                    "Tracking your income, expenses, and managing budgets.",
                    "Generating professional invoices and tracking payments.",
                    "Inviting your team and managing collaboration."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <hr className="border-white/10 mb-20" />

            {/* Quickstart */}
            <section id="quickstart" className="mb-20 scroll-mt-28">
              <h2 className="text-3xl font-display font-medium mb-6 flex items-center gap-3">
                <Zap className="h-6 w-6 text-emerald-400" /> Quickstart Guide
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Get up and running with Capient in less than 5 minutes. Follow these steps to configure your primary workspace.
              </p>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {[
                  {
                    step: "01",
                    title: "Create an Account",
                    desc: "Sign up using your email. We use Supabase Auth to ensure your data is secure and protected."
                  },
                  {
                    step: "02",
                    title: "Initialize a Planner",
                    desc: "Upon your first login, Capient will prompt you to create your first Planner. A Planner represents a distinct financial entity (like 'Personal Finances' or 'Acme Corp')."
                  },
                  {
                    step: "03",
                    title: "Add Accounts & Balances",
                    desc: "Head over to the Accounts tab to add your current bank accounts, credit cards, or cash wallets along with their opening balances."
                  }
                ].map((item, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-primary/30 bg-[#050a0a] text-primary font-bold z-10 shadow-[0_0_15px_rgba(16,185,129,0.2)] shrink-0">
                      {item.step}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                      <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
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
