import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/coming-soon")({
  component: ComingSoonPage,
});

function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#020505] text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-lg"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
          <Construction className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-4">
          Coming Soon
        </h1>
        <p className="text-muted-foreground text-lg mb-10">
          We are currently working hard to bring this page to life. Check back later for updates.
        </p>
        
        <Link to="/">
          <Button variant="outline" className="h-12 px-6 border-white/10 hover:bg-white/5 rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
