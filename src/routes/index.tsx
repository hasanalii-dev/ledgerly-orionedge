import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, LineChart, Wallet, Users, FileText, LayoutGrid, Receipt, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav — full width at top, transforms into a floating pill on scroll smoothly */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 flex justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isScrolled ? "pt-4 px-4" : "pt-0 px-0"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden",
            isScrolled
              ? "bg-background/70 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-5 py-2.5 w-full max-w-[42rem]"
              : "bg-background/80 backdrop-blur-xl border border-transparent border-b-white/5 rounded-none px-6 py-4 w-full max-w-full"
          )}
        >
          <div className="flex items-center gap-2 font-display font-semibold text-lg">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <img src="/favicon.png" alt="Ledgerly" className="h-4 w-4 object-contain" />
            </span>
            Ledgerly
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#modules" className="hover:text-foreground transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="hidden sm:inline-flex rounded-full glow-emerald">Get started</Button></Link>
          </div>
        </div>
      </header>

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
        
        {/* Subtle grain/noise overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px 256px" }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs text-muted-foreground mb-8 hover:border-primary/30 transition-colors cursor-default"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Now with multi-planner workspaces
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
            className="text-5xl md:text-7xl font-display tracking-tight leading-[1.02] max-w-4xl mx-auto flex flex-wrap justify-center gap-x-4"
          >
            {["The", "financial"].map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } }
                }}
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              className="text-primary"
              variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } }
              }}
            >
              operating system
            </motion.span>
            <motion.div className="w-full h-0 hidden md:block" />
            {["built", "for", "entrepreneurs."].map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } }
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
            Manage income, expenses, invoices, clients, and cash flow across unlimited planners. Feels like Notion. Powered like a spreadsheet.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.3, ease: "easeOut" }}
            className="mt-10 flex flex-wrap gap-3 justify-center"
          >
            <Link to="/auth">
              <Button size="lg" className="h-12 px-6 glow-emerald hover:scale-105 hover:bg-primary/90 transition-all duration-300">
                Open your workspace<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-12 px-6 border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-300">
                Explore features
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
              
              <div className="grid grid-cols-4 gap-3 mb-4 relative z-10">
                {[
                  { label: "Total Income", value: "$48,240", tone: "text-primary" },
                  { label: "Total Expenses", value: "$12,910", tone: "text-foreground" },
                  { label: "Net Cash Flow", value: "$35,330", tone: "text-primary" },
                  { label: "Balance", value: "$81,450", tone: "text-foreground" },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl bg-card/40 border border-white/5 p-4 text-left hover:bg-card/60 transition-colors backdrop-blur-md">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</div>
                    <div className={`mt-2 text-2xl font-display font-medium ${k.tone}`}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-card/30 border border-white/5 h-64 flex items-end justify-between px-6 pb-6 gap-2 relative overflow-hidden backdrop-blur-md z-10">
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
              <h2 className="text-4xl font-display tracking-tight">Everything you track. In one calm place.</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">Spreadsheet flexibility, dashboard clarity, and vault-level file organization — without the mess.</p>
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
        <section id="modules" className="py-28 overflow-hidden relative bg-[#040d0d]">
          {/* Gradient fade mask on upper border */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <h2 className="text-4xl font-display tracking-tight">Built for how you actually work.</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">Every module speaks to the next. Add income → invoice → payment proof → account balance updates → cash flow reflects it → dashboard refreshes.</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {["Editable spreadsheet-style tables", "Inline autosave", "Sticky headers, keyboard navigation", "Custom columns & categories", "Drag-and-drop file uploads"].map((x, i) => (
                    <motion.li
                      key={x}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> {x}
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link to="/auth">
                    <Button size="lg" className="glow-emerald hover:scale-105 transition-transform duration-300">
                      Try it free<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

        {/* CTA */}
        <section id="pricing" className="pt-32 pb-24 relative overflow-hidden">
          {/* Flipped Background gradient image — full width at the top of CTA */}
          <div className="absolute inset-x-0 top-0 z-0 w-full pointer-events-none select-none flex items-start opacity-70">
            <img
              src="/bg-gradient.png"
              alt=""
              className="w-full h-auto object-cover opacity-90 rotate-180"
              draggable={false}
            />
          </div>
          {/* Blending overlay to merge the top edge of the image with the #030b0c background smoothly */}
          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#030b0c] to-transparent z-0 pointer-events-none" />
          
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 max-w-4xl mx-auto px-6 text-center"
          >
            <h2 className="text-4xl md:text-6xl font-display tracking-tight leading-tight drop-shadow-md">
              Start with your <span className="text-primary font-medium">first planner</span>.
            </h2>
            <p className="mt-6 text-foreground/90 font-medium text-lg max-w-xl mx-auto leading-relaxed drop-shadow-md">
              Join entrepreneurs and agencies who have brought calm and clarity to their finances. Free while in preview. No credit card required.
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              <Link to="/auth">
                <Button size="lg" className="h-14 px-8 text-base glow-emerald hover:scale-105 hover:bg-primary/90 transition-all duration-300">
                  Create your workspace<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#030b0c] bg-card/50 backdrop-blur flex items-center justify-center relative overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-[#030b0c] bg-elevated flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                  +1k
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="pt-16 pb-8 text-sm text-muted-foreground relative z-10 overflow-hidden bg-black border-t border-white/5 shadow-2xl">
          <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-2 gap-16 relative z-10 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-2xl font-display font-semibold text-foreground">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <img src="/favicon.png" alt="Ledgerly" className="h-5 w-5 object-contain" />
                </span>
                Ledgerly
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
                  {['Features', 'Pricing', 'Modules', 'Changelog'].map((item) => (
                    <li key={item}><a href={`#${item.toLowerCase()}`} className="hover:text-primary transition-colors">{item}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-display font-medium text-foreground mb-4 text-base">Resources</h4>
                <ul className="space-y-3">
                  {['Documentation', 'Tutorials', 'Blog', 'Support'].map((item) => (
                    <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-display font-medium text-foreground mb-4 text-base">Company</h4>
                <ul className="space-y-3">
                  {['About', 'Careers', 'Terms', 'Privacy'].map((item) => (
                    <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            </div>
            
            <div className="w-full overflow-hidden flex justify-center items-center opacity-40 select-none pointer-events-none mt-16 mb-12">
               <h1 className="text-[16vw] font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-muted-foreground/30 to-transparent leading-none tracking-tighter mix-blend-plus-lighter">
                 Ledgerly
               </h1>
            </div>

            <div className="max-w-7xl mx-auto px-10 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-4 text-xs pt-8">
              <div>© {new Date().getFullYear()} Ledgerly. All rights reserved.</div>
              <div className="flex gap-6">
                <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="/cookies" className="hover:text-primary transition-colors">Cookies Settings</a>
              </div>
            </div>
          </footer>
      </div>
    </div>
  );
}
