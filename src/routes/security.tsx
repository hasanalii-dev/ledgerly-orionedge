import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { ShieldCheck, Lock, Server, Key, ArrowRight } from "lucide-react";
import PixelCard from "@/components/magic/PixelCard";
import { Button } from "@/components/ui/button";
import { MarketingFooter } from "@/components/MarketingFooter";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0b0e0c] text-foreground font-sans relative overflow-x-hidden selection:bg-[#3DDC97]/30">
      <MarketingNavbar />
      
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-start justify-center">
        <div className="w-[80vw] h-[50vh] bg-[#3DDC97]/10 blur-[120px] rounded-full mt-[-10vh]" />
        <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vh] bg-emerald-500/5 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute top-[30%] right-[10%] w-[30vw] h-[40vh] bg-[#3DDC97]/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-40 pb-32 relative z-10">
        <div className="text-center mb-24 relative">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md relative group">
            <div className="absolute inset-0 rounded-full bg-[#3DDC97]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <ShieldCheck className="w-10 h-10 text-[#3DDC97] relative z-10" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tighter drop-shadow-2xl">
            Enterprise-Grade <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3DDC97] to-emerald-400">Security</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Your financial data is your most sensitive asset. Capient is built from the ground up with military-grade encryption and strict privacy protocols to ensure your data remains yours, and only yours.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-32">
          {/* Bank-Level Encryption */}
          <PixelCard variant="green" className="md:col-span-2 relative overflow-hidden rounded-[32px] p-8 lg:p-10 flex flex-col transition-all duration-500 bg-[#121212] border border-white/[0.08] hover:border-white/[0.2] hover:-translate-y-2 group">
            <div className="absolute top-0 right-0 w-[70%] h-[200px] bg-[radial-gradient(ellipse_at_top_right,_rgba(61,220,151,0.15)_0%,_transparent_60%)] pointer-events-none z-0 transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 group-hover:bg-[#3DDC97]/10 transition-all duration-500">
              <Lock className="w-7 h-7 text-[#3DDC97]" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-4 relative z-10 group-hover:text-[#3DDC97] transition-colors duration-300">Bank-Level Encryption</h3>
            <p className="text-white/60 leading-relaxed relative z-10 font-light text-[15px]">
              All data transmitted to and from Capient is encrypted in transit using industry-standard TLS 1.3. Once it reaches our servers, it is encrypted at rest using AES-256 encryption. We utilize advanced Row Level Security (RLS) to ensure that your data is mathematically isolated from other users at the database level.
            </p>
          </PixelCard>
          
          {/* Authentication & Identity */}
          <PixelCard variant="green" className="md:col-span-1 relative overflow-hidden rounded-[32px] p-8 lg:p-10 flex flex-col transition-all duration-500 bg-[#121212] border border-white/[0.08] hover:border-white/[0.2] hover:-translate-y-2 group">
            <div className="absolute top-0 left-0 w-[70%] h-[200px] bg-[radial-gradient(ellipse_at_top_left,_rgba(61,220,151,0.15)_0%,_transparent_60%)] pointer-events-none z-0 transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 group-hover:bg-[#3DDC97]/10 transition-all duration-500">
              <Key className="w-7 h-7 text-[#3DDC97]" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-4 relative z-10 group-hover:text-[#3DDC97] transition-colors duration-300">Authentication & Identity</h3>
            <p className="text-white/60 leading-relaxed relative z-10 font-light text-[15px]">
              We employ secure, token-based authentication for all accounts. Your passwords are cryptographically hashed using bcrypt before being stored, meaning even we cannot see your password. We also support advanced session management to ensure you can securely revoke access to any device.
            </p>
          </PixelCard>
          
          {/* Secure Infrastructure */}
          <PixelCard variant="green" className="md:col-span-1 relative overflow-hidden rounded-[32px] p-8 lg:p-10 flex flex-col transition-all duration-500 bg-[#121212] border border-white/[0.08] hover:border-white/[0.2] hover:-translate-y-2 group">
            <div className="absolute bottom-0 right-0 w-[70%] h-[200px] bg-[radial-gradient(ellipse_at_bottom_right,_rgba(61,220,151,0.15)_0%,_transparent_60%)] pointer-events-none z-0 transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 group-hover:bg-[#3DDC97]/10 transition-all duration-500">
              <Server className="w-7 h-7 text-[#3DDC97]" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-4 relative z-10 group-hover:text-[#3DDC97] transition-colors duration-300">Secure Infrastructure</h3>
            <p className="text-white/60 leading-relaxed relative z-10 font-light text-[15px]">
              Our servers are hosted in highly secure, SOC 2 Type II compliant data centers. We employ automated threat detection, continuous security monitoring, and regular vulnerability scanning to proactively protect against emerging threats.
            </p>
          </PixelCard>
          
          {/* Data Privacy Guarantee */}
          <PixelCard variant="green" className="md:col-span-2 relative overflow-hidden rounded-[32px] p-8 lg:p-10 flex flex-col transition-all duration-500 bg-[#121212] border border-white/[0.08] hover:border-white/[0.2] hover:-translate-y-2 group">
            <div className="absolute bottom-0 left-0 w-[70%] h-[200px] bg-[radial-gradient(ellipse_at_bottom_left,_rgba(61,220,151,0.15)_0%,_transparent_60%)] pointer-events-none z-0 transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 group-hover:bg-[#3DDC97]/10 transition-all duration-500">
              <ShieldCheck className="w-7 h-7 text-[#3DDC97]" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-4 relative z-10 group-hover:text-[#3DDC97] transition-colors duration-300">Data Privacy Guarantee</h3>
            <p className="text-white/60 leading-relaxed relative z-10 font-light text-[15px]">
              We do not, and will never, sell your data to third parties, advertisers, or aggregators. We only use your data to provide the Capient service to you. You maintain full ownership of your data and can export or delete your entire account at any time.
            </p>
          </PixelCard>
        </div>

        {/* Call to Action */}
        <div className="relative overflow-hidden rounded-[32px] p-10 md:p-16 text-center bg-[#0d1311] border border-[#3DDC97]/20 shadow-[0_0_50px_rgba(61,220,151,0.05)]">
          <div className="absolute inset-x-0 bottom-0 h-[80%] pointer-events-none [mask-image:radial-gradient(ellipse_80%_100%_at_50%_100%,black_10%,transparent_100%)]">
            {/* Base faint grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#3DDC9715_1px,transparent_1px),linear-gradient(to_bottom,#3DDC9715_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Specific brighter grid lines (Vertical) */}
            <div className="absolute top-0 bottom-0 left-[120px] w-[1px] bg-[#3DDC97]/40 shadow-[0_0_12px_rgba(61,220,151,0.6)]" />
            <div className="absolute top-0 bottom-0 right-[240px] w-[1px] bg-[#3DDC97]/30 shadow-[0_0_8px_rgba(61,220,151,0.5)]" />
            
            {/* Specific brighter grid lines (Horizontal) */}
            <div className="absolute left-0 right-0 top-[72px] h-[1px] bg-[#3DDC97]/40 shadow-[0_0_12px_rgba(61,220,151,0.6)]" />
            <div className="absolute left-0 right-0 bottom-[96px] h-[1px] bg-[#3DDC97]/50 shadow-[0_0_12px_rgba(61,220,151,0.8)]" />
          </div>
          
          {/* Ambient center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#3DDC97]/10 blur-[80px] rounded-full pointer-events-none" />
          
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 relative z-10">Have specific security questions?</h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto font-light relative z-10">
            Our security team is ready to answer any questions about our infrastructure, compliance, or data policies. We take your security seriously.
          </p>
          <Link to="/contact" className="relative z-10 inline-block">
            <Button className="h-14 rounded-2xl bg-[#3DDC97] px-10 text-[15px] font-bold text-black transition-all hover:bg-[#3DDC97]/90 shadow-[0_0_30px_rgba(61,220,151,0.3)] hover:shadow-[0_0_40px_rgba(61,220,151,0.4)] hover:-translate-y-0.5 group/btn flex items-center gap-3">
              Contact Security Team
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform group-hover/btn:translate-x-1">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Button>
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
