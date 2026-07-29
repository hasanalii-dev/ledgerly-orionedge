import { Link } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const LazySideRays = lazy(() => import('@/components/magic/SideRays'));

export function MarketingFooter() {
  return (
    <footer className="pt-12 pb-4 text-sm text-muted-foreground relative z-10 overflow-hidden bg-black border-t border-white/5 shadow-2xl">
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
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
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
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link to="/security" className="hover:text-primary transition-colors">Security</Link></li>
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
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/security" className="hover:text-primary transition-colors">Security</Link>
          </div>
        </div>
      </footer>
  );
}
