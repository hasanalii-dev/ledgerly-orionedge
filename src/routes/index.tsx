import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, LineChart, Wallet, Users, FileText, LayoutGrid, Receipt, Target, User, Briefcase, Building2 } from "lucide-react";
import { lazy, Suspense } from "react";
const LazyLightRays = lazy(() => import("@/components/magic/LightRays"));
const LazySideRays = lazy(() => import("@/components/magic/SideRays"));
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";


import { MarketingNavbar } from "@/components/MarketingNavbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Capient — The Ultimate Finance Planner & Ledger App" },
      { name: "description", content: "The ultimate personal finance and business ledger software. Capient makes tracking income, expenses, and invoices effortless for modern professionals." },
      { name: "keywords", content: "best personal finance tracker, agency ledger software, finance workspace, capient, expense tracker, freelance invoice tool, business bookkeeping" },
    ]
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 min-h-[90vh] flex flex-col justify-center bg-background z-0">
        
        {/* Background gradient image — full width at the bottom of hero */}
        <div className="absolute inset-x-0 bottom-0 z-0 w-full pointer-events-none select-none flex items-end opacity-80">
          <img
            src="/bg-gradient.png"
            alt=""
            className="w-full h-auto object-cover opacity-90"
            draggable={false}
          />
        </div>

        {/* Top Light Rays */}
        <div className="absolute inset-0 z-[5] pointer-events-none mix-blend-screen">
          <Suspense fallback={null}>
            <LazyLightRays 
              raysOrigin="top-center"
              raysColor="#10B981"
              raysSpeed={1.5}
              lightSpread={0.8}
              rayLength={1.2}
              followMouse={true}
              mouseInfluence={0.1}
              noiseAmount={0.1}
              distortion={0.05}
            />
          </Suspense>
        </div>
        
        {/* Subtle grain/noise overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px 256px" }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="p-[1px] rounded-full bg-gradient-to-bl from-emerald-500/50 to-white/5 mb-8 inline-flex"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#050a0a]/80 backdrop-blur-md px-4 py-1.5 text-xs text-white/70 shadow-[2px_-2px_20px_rgba(52,211,153,0.15)] cursor-default">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Now with multi-planner workspaces
            </div>
          </motion.div>
          <motion.h1
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.3 }
              }
            }}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-7xl font-display tracking-tight leading-[1.02] max-w-4xl mx-auto flex flex-wrap justify-center gap-x-4 gap-y-2 pb-4"
          >
            {["The", "Financial"].map((word, i) => (
              <motion.span
                key={`a-${i}`}
                className="bg-gradient-to-bl from-emerald-200 via-white/90 to-white/40 bg-clip-text text-transparent inline-block pb-2"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              className="bg-gradient-to-bl from-emerald-300 via-emerald-400 to-emerald-600 bg-clip-text text-transparent inline-block pb-2"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
              }}
            >
              Workspace
            </motion.span>
            <motion.div className="w-full h-0 hidden md:block" />
            {["for", "Modern", "Professionals."].map((word, i) => (
              <motion.span
                key={`b-${i}`}
                className="bg-gradient-to-bl from-emerald-200 via-white/90 to-white/40 bg-clip-text text-transparent inline-block pb-2"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}
            className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Replace disconnected spreadsheets, outdated budgeting tools, and scattered financial apps with one intelligent workspace designed to help you manage, plan, and grow with confidence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.3, ease: "easeOut" }}
            className="mt-10 flex flex-wrap gap-3 justify-center"
          >
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 glow-emerald hover:scale-105 hover:bg-primary/90 transition-all duration-300">
                Enroll Beta<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-12 px-8 border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-300">
                Learn More
              </Button>
            </a>
          </motion.div>

          {/* Mock dashboard - Real Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
            className="mt-20 relative group max-w-5xl mx-auto"
          >
            {/* Soft glow behind the glass */}
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-[80px] -z-10 group-hover:bg-primary/20 transition-all duration-700" />
            
            {/* The Glass Container */}
            <div className="rounded-2xl border border-white/10 bg-background/20 backdrop-blur-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 will-change-transform">
              {/* Glass edge highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 relative z-10">
                {[
                  { label: "Total Income", value: "$48,240", tone: "text-primary" },
                  { label: "Total Expenses", value: "$12,910", tone: "text-foreground" },
                  { label: "Net Cash Flow", value: "$35,330", tone: "text-primary" },
                  { label: "Balance", value: "$81,450", tone: "text-foreground" },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl bg-card/40 border border-white/5 p-4 text-left hover:bg-card/60 transition-colors">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</div>
                    <div className={`mt-2 text-2xl font-display font-medium ${k.tone}`}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-card/30 border border-white/5 h-64 flex items-end justify-between px-6 pb-6 gap-2 relative overflow-hidden z-10">
                {/* Subtle grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-6 px-6 pointer-events-none">
                  {[0,1,2,3].map(i => <div key={i} className="border-b border-white/5" />)}
                </div>
                {[35, 55, 42, 68, 51, 78, 65, 90, 72, 85, 92, 78].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.05, ease: "easeOut" }}
                    className="flex-1 rounded-t-lg relative overflow-hidden group-hover:bg-primary/90 bg-primary/70 transition-colors duration-500"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-lg" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sections below hero get #050c0d background */}
      <div className="bg-[#050c0d] relative">
        {/* Features */}
        <section id="features" className="py-28 relative">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-4xl font-display tracking-tight">Everything. <span className="text-primary">One Workspace.</span></h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">Manage every aspect of your financial life from one unified platform. Whether you're budgeting your personal finances, running a freelance business, managing client projects, or operating an entire company, Capient keeps everything connected, organized, and always within reach.</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: LayoutGrid, title: "Multi-planner workspace", desc: "Separate books for personal, agency, side project. Zero data crossover." },
                { icon: LineChart, title: "Live cash flow", desc: "Daily, weekly, monthly, yearly cuts of income vs expenses." },
                { icon: Wallet, title: "Multiple accounts", desc: "Bank, wallet, cash — transfers don't count as income or expense." },
                { icon: Users, title: "Client CRM", desc: "Revenue, invoices, and outstanding per client, computed automatically." },
                { icon: Receipt, title: "Invoice & receipt vault", desc: "Attach PDFs and screenshots. Link them to income and expense rows." },
                { icon: Target, title: "Goals & budgets", desc: "Track savings goals and monthly budgets with live progress." },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  className="rounded-2xl border border-hairline bg-card/10 backdrop-blur-sm p-6 hover:bg-card/40 hover:border-primary/15 hover:shadow-[0_0_30px_-10px_oklch(0.82_0.17_160_/_0.15)] hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground/90 group-hover:text-foreground transition-colors">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section id="modules" className="py-28 overflow-hidden relative bg-[#030b0c]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <h2 className="text-4xl font-display tracking-tight">Designed Around How You <span className="text-primary">Actually Work</span></h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">Most financial tools solve one problem. <span className="text-foreground/90 font-medium">Capient brings them together.</span></p>
                <p className="mt-4 text-muted-foreground leading-relaxed text-sm">Track income and expenses, forecast future cash flow, manage clients, generate invoices, monitor project profitability, organize financial documents, collaborate with your team, and gain a complete picture of your finances—all from one beautifully designed workspace.</p>
                <div className="mt-8">
                  <Link to="/auth">
                    <Button size="lg" className="glow-emerald hover:scale-105 transition-transform duration-300">
                      Join Beta
                    </Button>
                  </Link>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="rounded-2xl border border-hairline bg-card/20 backdrop-blur-md overflow-hidden shadow-2xl group hover:border-primary/15 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-500"
              >
                <div className="border-b border-hairline px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground bg-card/40 backdrop-blur-sm">
                  <FileText className="h-3.5 w-3.5 text-primary/70" /> income.planner
                </div>
                <div className="text-xs">
                  <div className="grid grid-cols-5 border-b border-hairline text-muted-foreground py-2.5 px-4 uppercase tracking-wider text-[10px] font-medium bg-background/20">
                    <div>Date</div><div>Client</div><div>Description</div><div>Amount</div><div>Status</div>
                  </div>
                  {[
                    ["Nov 12", "Nova Studio", "Website redesign", "$4,500", "Paid"],
                    ["Nov 08", "Aurora Labs", "SEO retainer", "$1,800", "Advance"],
                    ["Nov 03", "Kite & Co", "Landing page", "$2,200", "Partial"],
                    ["Oct 28", "Meridian", "Brand system", "$6,900", "Paid"],
                  ].map((r, i) => (
                    <div key={i} className="grid grid-cols-5 border-b border-hairline py-3 px-4 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="text-muted-foreground">{r[0]}</div><div className="text-foreground/90">{r[1]}</div><div className="text-muted-foreground">{r[2]}</div>
                      <div className="font-medium text-primary">{r[3]}</div>
                      <div><span className="rounded-md bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-medium">{r[4]}</span></div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>


        {/* Built for Every Stage */}
        <section className="py-28 relative bg-[#050c0d]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-4xl font-display tracking-tight">Built for <span className="text-primary">Every Stage</span></h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: User, title: "Personal Finance", desc: "Stay on top of your spending, savings, goals, and everyday finances.", accent: "from-emerald-500/20 to-transparent" },
                { icon: Briefcase, title: "Freelancers", desc: "Manage clients, invoices, expenses, and project profitability in one place.", accent: "from-emerald-400/25 to-transparent" },
                { icon: Building2, title: "Businesses", desc: "Collaborate with your team, monitor financial performance, and make informed decisions with confidence.", accent: "from-emerald-300/20 to-transparent" },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                  className="relative group rounded-2xl border border-hairline bg-card/10 p-8 hover:bg-card/30 hover:border-primary/15 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                >
                  {/* Subtle gradient glow at top */}
                  <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <card.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-xl font-medium text-foreground/90 group-hover:text-foreground transition-colors mb-3">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="pricing" className="relative z-20 px-4 md:px-8 max-w-5xl mx-auto w-full pt-8">
          <div className="rounded-3xl border border-white/5 bg-background shadow-[0_0_80px_-20px_rgba(16,185,129,0.15)] relative overflow-hidden pt-10 pb-8 translate-y-1/2">
            {/* Background gradient image — bottom */}
            <div className="absolute inset-x-0 bottom-0 z-0 w-full pointer-events-none select-none flex items-end opacity-100 translate-y-[20%]">
              <img
                src="/bg-gradient.png"
                alt=""
                className="w-full h-auto object-cover opacity-100"
                draggable={false}
                loading="lazy"
              />
            </div>
            {/* Blending overlay to merge the top edge of the image */}
            <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-background/80 to-transparent z-0 pointer-events-none" />
            
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10 max-w-3xl mx-auto px-6 text-center"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-display tracking-tight leading-tight drop-shadow-md">
                Start with your <span className="text-primary font-medium">first planner</span>.
              </h2>
              <p className="mt-3 text-foreground/80 font-medium text-sm max-w-md mx-auto leading-relaxed drop-shadow-md">
                Join entrepreneurs and agencies who have brought calm and clarity to their finances. Free while in preview. No credit card required.
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4"
              >
                <Link to="/auth">
                  <Button variant="outline" className="h-12 px-8 text-base rounded-full bg-card border-white/10 text-foreground hover:bg-white/5 transition-all font-medium">
                    Join Beta <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex -space-x-3 ml-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-background flex items-center justify-center relative overflow-hidden shadow-md transition-transform hover:scale-110 hover:z-10">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=user${i + 42}`} alt="" className="w-8 h-8 object-contain" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-elevated flex items-center justify-center text-[10px] font-medium text-muted-foreground shadow-md z-10">
                    +1k
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-32 pb-4 text-sm text-muted-foreground relative z-10 overflow-hidden bg-black border-t border-white/5 shadow-2xl mt-8">
          <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen">
            <div className="absolute inset-0">
              <Suspense fallback={null}>
                <LazySideRays 
                  speed={1.5}
                  rayColor1="#10B981" 
                  rayColor2="#34D399" 
                  intensity={2.5}
                  spread={2.5}
                  origin="bottom-left"
                  tilt={15}
                  saturation={1.5}
                  blend={0.5}
                  opacity={1.0}
                />
              </Suspense>
            </div>
            <div className="absolute inset-0">
              <Suspense fallback={null}>
                <LazySideRays 
                  speed={1.5}
                  rayColor1="#10B981" 
                  rayColor2="#34D399" 
                  intensity={2.5}
                  spread={2.5}
                  origin="bottom-right"
                  tilt={-15}
                  saturation={1.5}
                  blend={0.5}
                  opacity={1.0}
                />
              </Suspense>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-2 gap-16 relative z-10 mb-20">
            <div className="space-y-6">
              <div className="flex items-center">
                <img src="/full-logo.png" alt="Capient" className="h-10 w-auto object-contain" />
              </div>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground/80">
                The financial operating system built for freelancers, agencies, and entrepreneurs. A calm space for your money.
              </p>
              <div className="flex gap-4 pt-2">
                {['Twitter', 'GitHub', 'Discord'].map((platform) => (
                  <a key={platform} href="#" className="text-muted-foreground/60 hover:text-primary transition-colors">
                    {platform}
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-display font-medium text-foreground mb-4 text-base">Product</h4>
                <ul className="space-y-3">
                  <li><a href="/#features" className="hover:text-primary transition-colors">Features</a></li>
                  <li><a href="/#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                  <li><a href="/#modules" className="hover:text-primary transition-colors">Modules</a></li>
                  <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Changelog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-display font-medium text-foreground mb-4 text-base">Resources</h4>
                <ul className="space-y-3">
                  <li><Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                  <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Tutorials</Link></li>
                  <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Blog</Link></li>
                  <li><Link to="/contact" className="hover:text-primary transition-colors">Support</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-display font-medium text-foreground mb-4 text-base">Company</h4>
                <ul className="space-y-3">
                  <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                  <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Careers</Link></li>
                  <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Terms</Link></li>
                  <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Privacy</Link></li>
                </ul>
              </div>
            </div>
            </div>
            
            <div className="w-full overflow-hidden flex justify-center items-center opacity-100 select-none pointer-events-none mt-16 mb-2 relative z-10 px-4">
               <h1 className="text-[clamp(6rem,15vw,22rem)] font-display font-bold text-transparent bg-clip-text bg-gradient-to-t from-emerald-400/30 via-emerald-500/5 to-transparent leading-none tracking-tighter mix-blend-plus-lighter">
                 Capient
               </h1>
            </div>

            <div className="max-w-7xl mx-auto px-10 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-4 text-xs pt-4">
              <div>© {new Date().getFullYear()} Capient. All rights reserved.</div>
              <div className="flex gap-6">
                <Link to="/coming-soon" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link to="/coming-soon" className="hover:text-primary transition-colors">Terms of Service</Link>
                <Link to="/coming-soon" className="hover:text-primary transition-colors">Cookies Settings</Link>
              </div>
            </div>
          </footer>
      </div>
    </div>
  );
}
