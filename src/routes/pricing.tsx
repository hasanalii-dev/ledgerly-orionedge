import { createFileRoute } from "@tanstack/react-router";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { Check, CheckCircle2, Sparkles, ArrowRight, Plus, Minus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import MagicRings from "@/components/magic/MagicRings";
import LightRays from "@/components/magic/LightRays";
import PixelCard from "@/components/magic/PixelCard";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-white/5 rounded-2xl bg-[#111312] overflow-hidden transition-all duration-300 mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-5 md:p-6 text-left focus:outline-none"
      >
        <span className="font-display font-medium text-white text-lg tracking-tight">{question}</span>
        <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center shrink-0 ml-4 bg-white/[0.02]">
          {isOpen ? <Minus className="w-3.5 h-3.5 text-muted-foreground" /> : <Plus className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>
      <div 
        className={`px-5 md:px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="text-muted-foreground text-sm md:text-base">{answer}</p>
      </div>
    </div>
  );
}

function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0e0c] text-foreground overflow-x-hidden font-sans">
      <MarketingNavbar />
      
      {/* Subtle ambient center glow */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div className="w-[80vw] h-[50vh] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center min-h-[90vh]">
        
        {/* HERO SECTION */}
        <div className="relative text-center mb-16 max-w-4xl flex flex-col items-center w-full">
          {/* MagicRings Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[800px] h-[600px] scale-[1.2] lg:scale-[1.5] pointer-events-none z-[-1] opacity-40 mix-blend-screen">
            <MagicRings
              color="#3DDC97"
              colorTwo="#1e8c56"
              ringCount={5}
              speed={0.5}
              attenuation={8}
              lineThickness={1.5}
              baseRadius={0.2}
              radiusStep={0.15}
              scaleRate={0.08}
              opacity={0.8}
              blur={2}
              noiseAmount={0.05}
              rotation={0}
              ringGap={1.2}
              fadeIn={0.5}
              fadeOut={0.7}
              followMouse={true}
              mouseInfluence={0.15}
              hoverScale={1.1}
              parallax={0.08}
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 relative z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3DDC97]" />
            <span className="text-xs font-medium text-white tracking-wide">Pricing</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[72px] leading-[1.1] font-display font-bold tracking-tighter text-white mb-6 relative z-10 drop-shadow-2xl">
            One workspace.<br/>
            <span className="text-[#3DDC97]">Every price honest.</span>
          </h1>
          <p className="text-muted-foreground/80 text-lg md:text-[22px] leading-relaxed max-w-3xl mx-auto mb-12 font-light relative z-10">
            Start free, forever. Scale into Pro when your practice needs invoices, investments and reports. No hidden tiers, no per-seat surprises.
          </p>

          {/* TOGGLE */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#111312] border border-white/5 shadow-xl relative">
            <button 
              onClick={() => setIsYearly(false)}
              className={`px-8 py-2.5 rounded-full text-[15px] font-medium transition-all duration-300 relative z-10 ${!isYearly ? 'text-white' : 'text-muted-foreground hover:text-white'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2.5 rounded-full text-[15px] font-medium transition-all duration-300 flex items-center gap-2 relative z-10 ${isYearly ? 'text-black' : 'text-[#3DDC97] hover:bg-white/5'}`}
            >
              Yearly
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isYearly ? 'bg-black/15 text-black' : 'bg-[#3DDC97]/20 text-[#3DDC97]'}`}>
                -25%
              </span>
            </button>
            
            {/* Sliding Pill Background */}
            <div 
              className={`absolute top-1 bottom-1 w-[130px] rounded-full transition-all duration-300 ease-out z-0 ${isYearly ? 'bg-[#3DDC97] left-[105px] shadow-[0_12px_25px_-8px_rgba(61,220,151,0.6)] w-[140px]' : 'bg-white/5 left-1'}`}
            />
          </div>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl items-start mb-32">
          
          {/* Starter Plan */}
          <PixelCard variant="green" className="relative overflow-hidden rounded-[20px] p-6 lg:p-8 flex flex-col min-h-[480px] transition-all duration-300 bg-[#121212] border border-white/[0.08] hover:border-white/[0.15] hover:-translate-y-1 group mt-0 md:mt-6">
            {/* Corner Glow & Curved Border Highlight */}
            <div className="absolute top-0 right-0 w-[70%] h-[200px] bg-[radial-gradient(ellipse_at_top_right,_rgba(61,220,151,0.15)_0%,_transparent_60%)] pointer-events-none z-0" />
            <div className="absolute inset-0 rounded-[20px] pointer-events-none p-[1px] z-10"
                 style={{
                   background: 'linear-gradient(225deg, rgba(61,220,151,0.6) 0%, transparent 40%)',
                   WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                   WebkitMaskComposite: 'xor',
                   maskComposite: 'exclude'
                 }}
            />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-[17px] font-medium text-white/90">Starter</h3>
            </div>
            
            <div className="mb-4 relative z-10">
              <div className="flex items-baseline">
                <span className="text-[40px] font-medium text-white">$0</span>
                <span className="text-white/40 text-[13px] ml-1">/month</span>
              </div>
            </div>

            <p className="text-white/50 text-[13px] leading-relaxed mb-6 relative z-10">Perfect for freelancers and solo entrepreneurs just getting started.</p>

            <Button className="w-full bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 transition-colors h-11 rounded-[10px] font-medium mb-6 text-[13px] flex items-center justify-center gap-2 group/btn relative z-10">
              Start for Free
              <div className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center transition-transform group-hover/btn:translate-x-1">
                <ArrowRight className="w-3 h-3" />
              </div>
            </Button>

            <div className="flex items-center justify-center mb-6">
              <div className="h-[1px] bg-white/10 flex-1"></div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/30 px-4 font-medium">FEATURES</span>
              <div className="h-[1px] bg-white/10 flex-1"></div>
            </div>

            <div className="flex-1 flex flex-col">
              <ul className="space-y-4 flex-1">
                {[
                  "1 planner workspace",
                  "Unlimited income & expenses",
                  "Basic dashboard & charts",
                  "3 accounts",
                  "100 MB document vault",
                  "Community support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[13px] text-white/70">
                    <CheckCircle2 className="w-[14px] h-[14px] text-white/40 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </PixelCard>

          {/* Pro Plan (Highlighted) */}
          <PixelCard variant="green" className="relative overflow-hidden rounded-[20px] p-6 lg:p-8 flex flex-col min-h-[480px] transition-all duration-300 bg-[#151515] border border-white/[0.12] hover:border-white/[0.2] hover:-translate-y-1 shadow-2xl group z-10">
            {/* Glows */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3DDC97]/80 to-transparent z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[120px] bg-[radial-gradient(ellipse_at_top,_rgba(61,220,151,0.25)_0%,_transparent_70%)] pointer-events-none z-0" />
            <div className="absolute top-0 left-0 w-full h-[300px] pointer-events-none z-0 mix-blend-screen">
              <LightRays
                raysOrigin="top-center"
                raysColor="#3DDC97"
                raysSpeed={1.5}
                lightSpread={1.5}
                rayLength={2.5}
                followMouse={false}
                mouseInfluence={0}
                noiseAmount={0.05}
                distortion={0.05}
              />
            </div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-[17px] font-medium bg-gradient-to-b from-[#3DDC97] to-white bg-clip-text text-transparent">Professional</h3>
              <span className="bg-gradient-to-b from-[#3DDC97]/30 to-white/5 text-white/90 border border-[#3DDC97]/40 text-[10px] px-2.5 py-1 rounded-full font-medium shadow-[0_2px_10px_rgba(0,0,0,0.2)]">Most Popular</span>
            </div>
            
            <div className="mb-4 relative z-10">
              <div className="flex items-baseline">
                <span className="text-[40px] font-medium bg-gradient-to-b from-[#3DDC97] to-white bg-clip-text text-transparent">
                  ${isYearly ? "22" : "29"}
                </span>
                <span className="text-white/40 text-[13px] ml-1">/month</span>
              </div>
              {isYearly && <p className="text-[11px] text-[#3DDC97] mt-1">Billed $264 annually</p>}
            </div>

            <p className="text-white/50 text-[13px] leading-relaxed mb-6 relative z-10 pr-4">Best for growing startups and growth companies seeking enhanced insights.</p>

            <Button disabled className="w-full bg-gradient-to-b from-[#3DDC97] to-[#17965a] hover:opacity-90 text-white border-0 transition-opacity h-11 rounded-[10px] font-medium mb-6 text-[13px] relative z-10 flex items-center justify-center gap-2 group/btn shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
              Sign Up with Professional
              <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center transition-transform group-hover/btn:translate-x-1">
                <ArrowRight className="w-3 h-3" />
              </div>
            </Button>

            <div className="flex items-center justify-center mb-6 relative z-10">
              <div className="h-[1px] bg-white/10 flex-1"></div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/30 px-4 font-medium">FEATURES</span>
              <div className="h-[1px] bg-white/10 flex-1"></div>
            </div>

            <div className="flex-1 flex flex-col relative z-10">
              <ul className="space-y-4 flex-1">
                {[
                  "Everything in Starter",
                  "Clients, projects & invoices",
                  "Investments & goals tracking",
                  "Advanced reports & CSV export",
                  "10 GB document vault",
                  "Priority email support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[13px] text-white/70">
                    <CheckCircle2 className="w-[14px] h-[14px] text-[#3DDC97] shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </PixelCard>

          {/* Studio Plan */}
          <PixelCard variant="green" className="relative overflow-hidden rounded-[20px] p-6 lg:p-8 flex flex-col min-h-[480px] transition-all duration-300 bg-[#121212] border border-white/[0.08] hover:border-white/[0.15] hover:-translate-y-1 group mt-0 md:mt-6">
            {/* Corner Glow & Curved Border Highlight */}
            <div className="absolute top-0 left-0 w-[70%] h-[200px] bg-[radial-gradient(ellipse_at_top_left,_rgba(61,220,151,0.15)_0%,_transparent_60%)] pointer-events-none z-0" />
            <div className="absolute inset-0 rounded-[20px] pointer-events-none p-[1px] z-10"
                 style={{
                   background: 'linear-gradient(135deg, rgba(61,220,151,0.6) 0%, transparent 40%)',
                   WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                   WebkitMaskComposite: 'xor',
                   maskComposite: 'exclude'
                 }}
            />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-[17px] font-medium text-white/90">Studio</h3>
            </div>
            
            <div className="mb-4 relative z-10">
              <div className="flex items-baseline">
                <span className="text-[40px] font-medium text-white">Custom</span>
              </div>
            </div>

            <p className="text-white/50 text-[13px] leading-relaxed mb-6 relative z-10">Best for large companies and teams requiring high security and custom solutions.</p>

            <Button disabled className="w-full bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 transition-colors h-11 rounded-[10px] font-medium mb-6 text-[13px] flex items-center justify-center gap-2 group/btn relative z-10 disabled:opacity-50 disabled:cursor-not-allowed">
              Sign Up with Studio
              <div className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center transition-transform group-hover/btn:translate-x-1">
                <ArrowRight className="w-3 h-3" />
              </div>
            </Button>

            <div className="flex items-center justify-center mb-6">
              <div className="h-[1px] bg-white/10 flex-1"></div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/30 px-4 font-medium">FEATURES</span>
              <div className="h-[1px] bg-white/10 flex-1"></div>
            </div>

            <div className="flex-1 flex flex-col">
              <ul className="space-y-4 flex-1">
                {[
                  "Everything in Professional",
                  "Multi-entity consolidation",
                  "Custom columns & workflows",
                  "100 GB document vault",
                  "Dedicated onboarding",
                  "Integration with 3rd-Party"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[13px] text-white/70">
                    <CheckCircle2 className="w-[14px] h-[14px] text-white/40 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </PixelCard>

        </div>

        {/* COMPARISON TABLE */}
        <div className="w-full max-w-5xl mb-32">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-4">Compare every feature</h2>
            <p className="text-muted-foreground text-lg">Everything Capient does, across every plan.</p>
          </div>

          <div className="w-full bg-[#111312] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <TooltipProvider delayDuration={100}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.01]">
                    <th className="py-6 px-6 text-[12px] uppercase tracking-widest text-white/60 font-semibold w-1/4 rounded-tl-xl">Feature</th>
                    <th className="py-6 px-6 text-[12px] uppercase tracking-widest text-white/60 font-semibold w-1/4 text-center">Starter</th>
                    <th className="py-6 px-6 text-[12px] uppercase tracking-widest text-[#3DDC97] font-bold w-1/4 text-center relative bg-[#3DDC97]/[0.03]">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#3DDC97]/50 to-transparent" />
                      Pro
                    </th>
                    <th className="py-6 px-6 text-[12px] uppercase tracking-widest text-white/60 font-semibold w-1/4 text-center rounded-tr-xl">Studio</th>
                  </tr>
                  </thead>
                  <tbody className="text-sm">
                    {/* CORE SECTION */}
                    <tr className="bg-white/[0.02]">
                      <td colSpan={4} className="py-4 px-6 text-[10px] uppercase tracking-widest text-white/50 font-bold">Core</td>
                    </tr>
                    {[
                      { name: "Planners", info: "Workspaces to organize your finances.", starter: "1", pro: "Unlimited", studio: "Unlimited" },
                      { name: "Accounts", info: "Bank, credit card, or cash accounts.", starter: "3", pro: "Unlimited", studio: "Unlimited" },
                      { name: "Income & expenses", info: "Track incoming and outgoing money.", starter: true, pro: true, studio: true },
                      { name: "Dashboard & charts", info: "Visual analytics of your financial health.", starter: "Basic", pro: "Advanced", studio: "Advanced" }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors duration-300 group cursor-default">
                        <td className="py-5 px-6 text-white font-medium">
                          <div className="flex items-center gap-2">
                            {row.name}
                            {row.info && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/70 transition-colors cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p className="max-w-[200px] text-xs">{row.info}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-center text-muted-foreground">
                          {row.starter === true ? <Check className="w-4 h-4 mx-auto text-[#3DDC97] group-hover:scale-125 transition-transform duration-300" /> : <span className="group-hover:text-white transition-colors duration-300">{row.starter}</span>}
                        </td>
                        <td className="py-5 px-6 text-center text-white font-medium bg-[#3DDC97]/[0.02] transition-colors duration-300 group-hover:bg-[#3DDC97]/[0.08]">
                          {row.pro === true ? <Check className="w-4 h-4 mx-auto text-[#3DDC97] group-hover:scale-125 transition-transform duration-300" /> : <span className="group-hover:scale-110 inline-block transition-transform duration-300">{row.pro}</span>}
                        </td>
                        <td className="py-5 px-6 text-center text-muted-foreground">
                          {row.studio === true ? <Check className="w-4 h-4 mx-auto text-[#3DDC97] group-hover:scale-125 transition-transform duration-300" /> : <span className="group-hover:text-white transition-colors duration-300">{row.studio}</span>}
                        </td>
                      </tr>
                    ))}

                    {/* BUSINESS SECTION */}
                    <tr className="bg-white/[0.02]">
                      <td colSpan={4} className="py-4 px-6 text-[10px] uppercase tracking-widest text-white/50 font-bold border-t border-white/5">Business</td>
                    </tr>
                    {[
                      { name: "Clients & projects", info: "Manage your client database and active projects.", starter: "—", pro: true, studio: true },
                      { name: "Invoices", info: "Create and send professional invoices.", starter: "—", pro: true, studio: true },
                      { name: "Investments", info: "Track your portfolio and investment returns.", starter: "—", pro: true, studio: true },
                      { name: "Reports & CSV export", info: "Export your data for tax season or accounting.", starter: "—", pro: true, studio: true }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors duration-300 group cursor-default">
                        <td className="py-5 px-6 text-white font-medium">
                          <div className="flex items-center gap-2">
                            {row.name}
                            {row.info && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/70 transition-colors cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p className="max-w-[200px] text-xs">{row.info}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-center text-muted-foreground">
                          {row.starter === true ? <Check className="w-4 h-4 mx-auto text-[#3DDC97] group-hover:scale-125 transition-transform duration-300" /> : <span className="text-white/20">—</span>}
                        </td>
                        <td className="py-5 px-6 text-center text-white font-medium bg-[#3DDC97]/[0.02] transition-colors duration-300 group-hover:bg-[#3DDC97]/[0.08]">
                          {row.pro === true ? <Check className="w-4 h-4 mx-auto text-[#3DDC97] group-hover:scale-125 transition-transform duration-300" /> : <span className="group-hover:scale-110 inline-block transition-transform duration-300">{row.pro}</span>}
                        </td>
                        <td className="py-5 px-6 text-center text-muted-foreground">
                          {row.studio === true ? <Check className="w-4 h-4 mx-auto text-[#3DDC97] group-hover:scale-125 transition-transform duration-300" /> : <span className="group-hover:text-white transition-colors duration-300">{row.studio}</span>}
                        </td>
                      </tr>
                    ))}

                    {/* TEAM & STORAGE SECTION */}
                    <tr className="bg-white/[0.02]">
                      <td colSpan={4} className="py-4 px-6 text-[10px] uppercase tracking-widest text-white/50 font-bold border-t border-white/5">Team & Storage</td>
                    </tr>
                    {[
                      { name: "Collaborators", info: "Invite team members to your workspaces.", starter: "Just you", pro: "Just you", studio: "Up to 5" },
                      { name: "Document vault", info: "Secure cloud storage for receipts and contracts.", starter: "100 MB", pro: "10 GB", studio: "100 GB" },
                      { name: "Custom columns", info: "Add custom metadata to your transactions.", starter: "—", pro: "Limited", studio: true },
                      { name: "Support", info: "Get help when you need it.", starter: "Community", pro: "Priority email", studio: "Dedicated" }
                    ].map((row, i) => (
                      <tr key={i} className={`hover:bg-white/[0.04] transition-colors duration-300 group cursor-default ${i !== 3 ? 'border-b border-white/5' : ''}`}>
                        <td className="py-5 px-6 text-white font-medium">
                          <div className="flex items-center gap-2">
                            {row.name}
                            {row.info && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/70 transition-colors cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p className="max-w-[200px] text-xs">{row.info}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-center text-muted-foreground">
                          {row.starter === true ? <Check className="w-4 h-4 mx-auto text-[#3DDC97] group-hover:scale-125 transition-transform duration-300" /> : (row.starter === "—" ? <span className="text-white/20">—</span> : <span className="group-hover:text-white transition-colors duration-300">{row.starter}</span>)}
                        </td>
                        <td className="py-5 px-6 text-center text-white font-medium bg-[#3DDC97]/[0.02] transition-colors duration-300 group-hover:bg-[#3DDC97]/[0.08]">
                          {row.pro === true ? <Check className="w-4 h-4 mx-auto text-[#3DDC97] group-hover:scale-125 transition-transform duration-300" /> : <span className="group-hover:scale-110 inline-block transition-transform duration-300">{row.pro}</span>}
                        </td>
                        <td className="py-5 px-6 text-center text-muted-foreground">
                          {row.studio === true ? <Check className="w-4 h-4 mx-auto text-[#3DDC97] group-hover:scale-125 transition-transform duration-300" /> : <span className="group-hover:text-white transition-colors duration-300">{row.studio}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="w-full max-w-3xl mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">Questions, answered</h2>
          </div>
          
          <div className="space-y-0">
            {[
              { 
                q: "Can I switch plans anytime?", 
                a: "Absolutely. You can upgrade, downgrade, or cancel your plan at any time. Prorated charges or credits will be applied automatically." 
              },
              { 
                q: "Do I need a credit card to start?", 
                a: "No! The Starter plan is completely free forever. You only need a credit card when you're ready to upgrade to Pro." 
              },
              { 
                q: "Is my financial data private?", 
                a: "We take security extremely seriously. Capient uses bank-level 256-bit encryption. We never sell your data to third parties, and you own your data completely." 
              },
              { 
                q: "What happens if I cancel?", 
                a: "If you cancel a paid plan, you'll retain access to premium features until the end of your billing cycle. After that, your account will securely downgrade to the free Starter plan." 
              }
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="w-full max-w-5xl">
          <div className="relative overflow-hidden rounded-[32px] p-10 md:p-16 lg:p-20 text-center border border-white/5 bg-[#0b120f]">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(61,220,151,0.15)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-6 leading-tight">
                Ready to run your finances like a studio?
              </h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
                Join thousands of freelancers and small teams using Capient to plan, track, and grow.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-8 h-14 rounded-2xl bg-[#3DDC97] hover:bg-[#3DDC97]/90 text-black font-semibold text-base transition-all shadow-[0_0_20px_rgba(61,220,151,0.3)]">
                  Start free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button className="w-full sm:w-auto px-8 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-base border border-white/10 transition-all">
                  Talk to sales
                </Button>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
