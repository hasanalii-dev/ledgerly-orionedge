import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Link2, Lightbulb, Target, Eye, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lazy, Suspense } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const LazyColorBends = lazy(() => import("@/components/magic/ColorBends"));
const LazySideRays = lazy(() => import("@/components/magic/SideRays"));

import { MarketingNavbar } from "@/components/MarketingNavbar";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function SectionBlock({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AboutPage() {
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Subtle parallax for elements with .parallax-layer
    gsap.utils.toArray<HTMLElement>('.parallax-layer').forEach(layer => {
      const depth = parseFloat(layer.dataset.depth || "0.2");
      gsap.to(layer, {
        y: () => -(layer.parentElement ? layer.parentElement.offsetHeight * depth : 100 * depth),
        ease: "none",
        scrollTrigger: {
          trigger: layer.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });
    });
  });

  return (
    <div className="min-h-screen bg-[#020505] text-foreground">
      <MarketingNavbar />

      {/* Hero with ColorBends */}
      <section className="relative min-h-[70vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full bg-[#020505]" />}>
            <LazyColorBends
              colors={["#10B981", "#059669", "#047857"]}
              rotation={90}
              speed={0.2}
              scale={1}
              frequency={1}
              warpStrength={1}
              mouseInfluence={1}
              noise={0.15}
              parallax={0.5}
              iterations={1}
              intensity={1.5}
              bandWidth={6}
              transparent
            />
          </Suspense>
        </div>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 z-[1] bg-[#020505]/60" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold tracking-tight leading-[1.08] mb-8"
          >
            Building the Future of{" "}
            <span className="bg-gradient-to-bl from-emerald-300 via-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Financial Management.
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-5 text-lg text-white/70 leading-relaxed max-w-2xl mx-auto"
          >
            <p>
              Financial software has remained largely unchanged for decades. It has become increasingly fragmented, overly complex, and disconnected from the way modern people actually manage their money.
            </p>
            <p className="text-white font-medium text-xl">
              Capient was created to change that.
            </p>
          </motion.div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
      </section>

      {/* Our Story — 2 column layout */}
      <section className="py-24 bg-[#030b0c]">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <SectionBlock>
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display tracking-tight mb-8">
                Our Story.
              </h2>
            </SectionBlock>

            <SectionBlock className="space-y-5 text-muted-foreground leading-relaxed" delay={0.1}>
              <p className="text-lg font-medium text-foreground/90">
                It started with a simple frustration.
              </p>
              <p>
                Managing finances meant relying on spreadsheets that were difficult to learn, outdated templates that weren't designed for today's workflows, and software that forced people to jump between multiple applications just to understand their financial position.
              </p>
              <p className="text-foreground/80 font-medium">
                There had to be a better way.
              </p>
              <p>
                Capient was founded on the belief that financial management should feel intuitive, connected, and accessible to everyone—not just accountants or finance professionals.
              </p>
            </SectionBlock>
          </div>

          <SectionBlock delay={0.2}>
            <div className="rounded-2xl border border-hairline bg-card/10 p-8 space-y-8">
              {[
                { title: "The Problem", desc: "Financial tools are fragmented, outdated, and built for specialists." },
                { title: "The Insight", desc: "Modern professionals need a single, connected workspace that just works." },
                { title: "The Solution", desc: "Capient — one beautiful platform for budgeting, invoicing, forecasting, and growth." },
              ].map((item, i) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-2" />
                  <div>
                    <h3 className="font-display font-medium text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionBlock>
        </div>
      </section>

      {/* Philosophy / Mission / Vision — 3 cards */}
      <section className="py-24 bg-[#020505]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lightbulb,
                title: "Our Philosophy",
                subtitle: "Simplicity Creates Better Decisions.",
                desc: "Powerful software doesn't have to be complicated. We believe financial tools should reduce complexity rather than introduce it. Every feature inside Capient is designed around one principle: give people complete financial clarity without overwhelming them.",
              },
              {
                icon: Target,
                title: "Our Mission",
                subtitle: "Empower financial confidence.",
                desc: "To empower individuals, professionals, and businesses with a modern financial workspace that makes managing money simple, visual, and intelligent.",
              },
              {
                icon: Eye,
                title: "Our Vision",
                subtitle: "A future of clarity.",
                desc: "We envision a future where every financial decision begins with clarity. A future where businesses, freelancers, and individuals no longer rely on disconnected spreadsheets or fragmented workflows, but instead operate from one connected financial workspace built for the modern world.",
              },
            ].map((card, i) => (
              <SectionBlock key={card.title} delay={i * 0.1}>
                <div className="relative overflow-hidden rounded-2xl border border-hairline bg-card/10 p-8 h-full transition-all duration-500 group hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/0 to-transparent group-hover:via-emerald-400/50 transition-all duration-700 pointer-events-none" />
                  
                  <div className="relative z-10 h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="relative z-10 font-display text-xl font-medium text-foreground mb-1">{card.title}</h3>
                  <p className="relative z-10 text-primary text-sm font-medium mb-4">{card.subtitle}</p>
                  <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              </SectionBlock>
            ))}
          </div>
        </div>
      </section>

      {/* What We Build — 2 column with feature pills */}
      <section className="py-24 bg-[#030b0c]">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <SectionBlock>
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display tracking-tight mb-8">
                What We Build.
              </h2>
            </SectionBlock>

            <SectionBlock className="space-y-5 text-muted-foreground leading-relaxed" delay={0.1}>
              <p>
                Capient is more than a budgeting application. It's an integrated financial workspace designed to bring budgeting, invoicing, client management, financial forecasting, project profitability, collaboration, reporting, and secure document management together under one platform.
              </p>
              <p>
                As financial needs evolve, Capient is built to evolve alongside them.
              </p>
            </SectionBlock>

            <SectionBlock delay={0.2} className="mt-8">
              <Link to="/auth">
                <Button size="lg" className="glow-emerald hover:scale-105 transition-all duration-300">
                  Start your workspace <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SectionBlock>
          </div>

          <SectionBlock delay={0.2}>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Budgeting", "Invoicing", "Client CRM", "Cash Flow",
                "Project Profitability", "Document Vault", "Investments", "Team Collaboration",
                "Reports & Analytics", "Secure Storage"
              ].map((feature, i) => (
                <div
                  key={feature}
                  className={cn(
                    "rounded-xl border border-hairline bg-card/10 px-5 py-3.5 text-sm text-center font-medium text-muted-foreground hover:text-foreground hover:bg-card/30 hover:border-primary/15 transition-all duration-300 cursor-default",
                    i < 2 && "bg-primary/10 text-primary border-primary/20"
                  )}
                >
                  {feature}
                </div>
              ))}
            </div>
          </SectionBlock>
        </div>
      </section>

      {/* Looking Forward */}
      <section className="py-24 bg-[#020505] relative overflow-hidden h-[600px] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent z-0 parallax-layer" data-depth="0.1" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center parallax-layer" data-depth="-0.15">
          <SectionBlock>
            <h2 className="text-3xl md:text-4xl font-display tracking-tight mb-8">
              Looking <span className="text-primary">Forward</span>
            </h2>
          </SectionBlock>

          <SectionBlock className="space-y-5 text-muted-foreground leading-relaxed" delay={0.1}>
            <p className="text-lg">
              We're building for the next generation of financial management.
            </p>
            <p>
              Every update, feature, and improvement is guided by our commitment to creating software that is simple, powerful, and genuinely useful for the people who rely on it every day.
            </p>
          </SectionBlock>

          <SectionBlock className="mt-12" delay={0.2}>
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 glow-emerald hover:scale-105 transition-all duration-300">
                Get Started with Capient
              </Button>
            </Link>
          </SectionBlock>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-4 text-sm text-muted-foreground relative z-10 overflow-hidden bg-black border-t border-white/5 shadow-2xl">
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
            <Link to="/" className="flex items-center gap-2 text-2xl font-display font-semibold text-foreground">
              <img src="/favicon.png" alt="Capient" className="h-8 w-8 object-contain" />
              Capient
            </Link>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground/80">
              The financial workspace built for freelancers, agencies, and entrepreneurs. A calm space for your money.
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
                <li><Link to="/" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Modules</Link></li>
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

        <div className="w-full overflow-hidden flex justify-center items-center select-none pointer-events-none mt-16 mb-2 relative z-10 px-4">
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
  );
}
