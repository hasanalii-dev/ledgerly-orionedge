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
  { name: "Pricing", to: "/pricing" },
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
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/side-bar-logo.png" alt="Capient" className="h-8 w-auto object-contain" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-['Questrial',_sans-serif] text-muted-foreground">
            {navLinks.map((link) => (
              link.to ? (
                <Link 
                  key={link.name} 
                  to={link.to} 
                  className={cn("transition-colors hover:text-white", location.pathname === link.to && "text-[#3DDC97] font-medium")}
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
            <Link to="/auth"><Button variant="ghost" size="sm" className="hidden md:inline-flex text-muted-foreground hover:text-white font-['Samsung_Sharp_Sans',_sans-serif] font-bold">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="hidden md:inline-flex rounded-full bg-[#3DDC97] text-black font-['Samsung_Sharp_Sans',_sans-serif] font-bold hover:bg-[#3DDC97]/90 shadow-[0_0_15px_rgba(61,220,151,0.25)]">Join Beta</Button></Link>
            
            {/* Mobile Hamburger Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden relative z-[101] text-white hover:bg-white/10 rounded-full h-10 w-10" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-[#3DDC97]" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Smooth, Glitch-Free Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[90] bg-[#040807]/95 backdrop-blur-2xl md:hidden flex flex-col justify-center px-8 font-['Questrial',_sans-serif]"
          >
            <div className="flex flex-col gap-5 text-2xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.2 }}
                >
                  {link.to ? (
                    <Link 
                      to={link.to} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "text-white/70 hover:text-[#3DDC97] transition-colors block py-2.5 border-b border-white/5",
                        location.pathname === link.to && "text-[#3DDC97]"
                      )}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a 
                      href={link.href} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-white/70 hover:text-[#3DDC97] transition-colors block py-2.5 border-b border-white/5"
                    >
                      {link.name}
                    </a>
                  )}
                </motion.div>
              ))}

              <div className="pt-6 flex flex-col gap-3 font-['Samsung_Sharp_Sans',_sans-serif]">
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-12 rounded-2xl text-sm font-bold border-white/10 text-white hover:bg-white/10">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full h-12 rounded-2xl text-sm font-bold bg-[#3DDC97] text-black hover:bg-[#3DDC97]/90 shadow-[0_0_20px_rgba(61,220,151,0.3)]">
                    Join Beta
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
