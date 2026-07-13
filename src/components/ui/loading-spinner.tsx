import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-[30px] rounded-full animate-pulse" />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-20 w-20 bg-[#050a0a] border border-white/10 rounded-[20px] flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_0_40px_rgba(16,185,129,0.1)]"
          >
            <img src="/favicon.png" alt="Loading" className="h-10 w-10 object-contain" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {children}
    </div>
  );
}
