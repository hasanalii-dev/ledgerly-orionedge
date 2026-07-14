import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import appCss from "../styles.css?url";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

// Global log buffer for bug reporting
declare global {
  interface Window {
    __APP_LOGS__: any[];
  }
}
if (typeof window !== "undefined") {
  window.__APP_LOGS__ = window.__APP_LOGS__ || [];
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  console.error = (...args) => { window.__APP_LOGS__.push({ type: 'error', time: new Date().toISOString(), args }); originalError(...args); };
  console.warn = (...args) => { window.__APP_LOGS__.push({ type: 'warn', time: new Date().toISOString(), args }); originalWarn(...args); };
  console.log = (...args) => { window.__APP_LOGS__.push({ type: 'log', time: new Date().toISOString(), args }); originalLog(...args); };
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-md text-center relative z-10">
        <h1 className="text-5xl font-display font-bold text-foreground tracking-tight">Coming Soon</h1>
        <p className="mt-4 text-lg text-muted-foreground">This page is currently under development. Check back later!</p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 glow-emerald"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-destructive">Something went wrong</h1>
        <p className="mt-4 text-sm text-muted-foreground bg-elevated p-4 rounded-lg text-left overflow-auto break-words font-mono">
          {error.message}
        </p>
        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lumen — Personal & Business Finance Planner" },
      { name: "description", content: "A premium financial operating system for entrepreneurs, freelancers, and agencies. Track income, expenses, invoices, clients, and cash flow in beautiful spreadsheet-style planners." },
      { name: "theme-color", content: "#0B0F0D" },
      { property: "og:title", content: "Lumen — Personal & Business Finance Planner" },
      { property: "og:description", content: "A premium financial operating system for entrepreneurs, freelancers, and agencies. Track income, expenses, invoices, clients, and cash flow in beautiful spreadsheet-style planners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Lumen — Personal & Business Finance Planner" },
      { name: "twitter:description", content: "A premium financial operating system for entrepreneurs, freelancers, and agencies. Track income, expenses, invoices, clients, and cash flow in beautiful spreadsheet-style planners." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://api.fontshare.com" },
      { rel: "preconnect", href: "https://cdn.fontshare.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&f[]=satoshi@400,500,600,700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function PageLoader() {
  const isPending = useRouterState({ select: (s) => s.status === "pending" });
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary origin-left overflow-hidden"
        >
          <motion.div
            className="h-full bg-white/40"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "circOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InitialSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Show splash screen for 1.8 seconds to allow the loading bar to finish before fading out
    const timer = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          exit={{ y: "-100vh", opacity: 0.8 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#020505] shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex flex-col items-center justify-center gap-8 w-full max-w-xs"
          >
            <div className="relative">
              <img src="/favicon.png" alt="Lumen" className="h-24 w-24 object-contain" />
            </div>
            
            <div className="flex flex-col items-center w-full gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-white/80 font-display tracking-[0.2em] uppercase text-xs"
              >
                Lumen
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: ["0%", "30%", "70%", "100%"] }}
                  transition={{ 
                    duration: 1.5, 
                    times: [0, 0.4, 0.8, 1],
                    ease: "easeInOut" 
                  }}
                  className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.clear();
        setTimeout(() => router.navigate({ to: "/auth", replace: true }), 0);
      } else if (event === "SIGNED_IN") {
        queryClient.invalidateQueries();
        if (location.pathname === "/auth" || location.pathname === "/") {
           setTimeout(() => router.navigate({ to: "/app", replace: true }), 0);
        }
      } else if (event === "USER_UPDATED") {
        setTimeout(() => router.invalidate(), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient, location.pathname]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase.from("site_analytics").insert({ 
        event_type: "page_view", 
        page_path: location.pathname,
        user_id: user?.id || null
      }).then();
    });
  }, [location.pathname]);

  const isDashboard = location.pathname.startsWith('/app');

  return (
    <QueryClientProvider client={queryClient}>
      <InitialSplash />
      <PageLoader />
      {isDashboard ? (
        <Outlet />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} className="flex min-h-screen flex-col w-full relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none", transform: "none" } }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-screen flex-col w-full"
            >
              <Outlet />
            </motion.div>
            
            {/* The Wipe Overlays */}
            <motion.div
              className="fixed inset-0 z-[999] bg-[#020505] origin-bottom border-t border-emerald-500/20"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 0 }}
              exit={{ scaleY: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
               </div>
            </motion.div>
            <motion.div
              className="fixed inset-0 z-[999] bg-[#020505] origin-top border-b border-emerald-500/20"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        </AnimatePresence>
      )}
      <Toaster theme="dark" position="bottom-right" />
    </QueryClientProvider>
  );
}
