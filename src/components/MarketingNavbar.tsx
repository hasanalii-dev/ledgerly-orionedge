import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "About", to: "/about" },
  { name: "Features", href: "/#features" },
  { name: "Modules", href: "/#modules" },
  { name: "Pricing", href: "/#pricing" },
  { name: "Docs", to: "/docs" },
];

export function MarketingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-[100] flex justify-center transition-all duration-300 ease-out",
          isScrolled ? "pt-4 px-4" : "pt-6 px-6"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between w-full max-w-[54rem] transition-all duration-300 ease-out",
            isScrolled
              ? "bg-[#050a0a]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl px-6 py-3"
              : "bg-transparent border border-transparent rounded-full px-2 py-2"
          )}
        >
          <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg hover:opacity-80 transition-opacity">
            <img src="/favicon.png" alt="Capient" className="h-6 w-6 object-contain" />
            Capient
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {navLinks.map((link) => (
              link.to ? (
                <Link 
                  key={link.name} 
                  to={link.to} 
                  className={cn("transition-colors hover:text-white", location.pathname === link.to && "text-white font-medium")}
                >
                  {link.name}
                </Link>
              ) : (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              )
            ))}
          </nav>
          
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm" className="hidden md:inline-flex text-muted-foreground hover:text-white">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="hidden md:inline-flex rounded-full glow-emerald">Join Beta</Button></Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden relative z-[101]" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <motion.div
                animate={isMobileMenuOpen ? "open" : "closed"}
                variants={{
                  open: { rotate: 90, opacity: 0 },
                  closed: { rotate: 0, opacity: 1 }
                }}
                className="absolute"
              >
                <Menu className="h-5 w-5" />
              </motion.div>
              <motion.div
                animate={isMobileMenuOpen ? "open" : "closed"}
                variants={{
                  open: { rotate: 0, opacity: 1 },
                  closed: { rotate: -90, opacity: 0 }
                }}
                className="absolute"
              >
                <X className="h-5 w-5" />
              </motion.div>
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 3rem) 3rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 3rem) 3rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 3rem) 3rem)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] bg-[#020505]/95 backdrop-blur-md md:hidden flex flex-col justify-center px-8"
          >
            <div className="flex flex-col gap-8 text-3xl font-display font-semibold">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                >
                  {link.to ? (
                    <Link 
                      to={link.to} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "text-white/70 hover:text-white transition-colors block",
                        location.pathname === link.to && "text-white"
                      )}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a 
                      href={link.href} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-white/70 hover:text-white transition-colors block"
                    >
                      {link.name}
                    </a>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mt-12 flex flex-col gap-4"
            >
              <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="lg" className="w-full border-white/10 bg-transparent h-14 text-lg">Sign in</Button>
              </Link>
              <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <Button size="lg" className="w-full rounded-full glow-emerald h-14 text-lg">Join Beta</Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
