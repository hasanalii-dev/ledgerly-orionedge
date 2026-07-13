import { Link, useRouterState, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Calendar, Wallet, Menu, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileBottomNav() {
  const { setOpenMobile, openMobile } = useSidebar();
  const params = useParams({ strict: false });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  let plannerId = (params as any)?.plannerId;

  // If not in URL (e.g. on /app/profile), fetch it from profile
  const { data: profile } = useQuery({
    queryKey: ["profile_nav_fallback"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return (await supabase.from("profiles").select("last_planner_id").eq("id", user.id).maybeSingle()).data;
    },
    enabled: !plannerId,
  });

  if (!plannerId && profile?.last_planner_id) {
    plannerId = profile.last_planner_id;
  }

  if (!plannerId) return null;

  const links = [
    { name: "Home", href: `/app/p/${plannerId}/dashboard`, icon: LayoutDashboard },
    { name: "Monthly", href: `/app/p/${plannerId}/monthly`, icon: Calendar },
    { name: "Cashflow", href: `/app/p/${plannerId}/cashflow`, icon: Wallet },
    { name: "Profile", href: `/app/profile`, icon: User },
  ];

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden w-[95%] max-w-md transition-all duration-300 ease-in-out",
      openMobile ? "translate-y-[150%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
    )}>
      <div className="flex items-center justify-between p-2 rounded-[2rem] bg-card/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]">
        {links.map((link) => {
          // Strict matching for active state
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.name !== "Settings");
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              to={link.href as any}
              className={cn(
                "flex flex-col items-center justify-center min-w-[3.5rem] flex-1 h-14 rounded-full transition-all duration-300 relative group",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {isActive && <div className="absolute inset-0 rounded-full bg-primary/10 shadow-[inset_0_0_12px_rgba(16,185,129,0.2)]" />}
              <Icon className={cn("w-5 h-5 mb-1 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5", isActive && "drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]")} />
              <span className={cn("text-[10px] tracking-wide relative z-10 transition-all duration-300", isActive ? "font-semibold" : "font-medium opacity-80 group-hover:opacity-100")}>{link.name}</span>
            </Link>
          );
        })}

        {/* Menu Button to trigger sidebar */}
        <button
          onClick={() => setOpenMobile(true)}
          className="flex flex-col items-center justify-center min-w-[3.5rem] flex-1 h-14 rounded-full transition-all duration-300 relative group text-muted-foreground hover:text-foreground hover:bg-white/5"
        >
          <Menu className="w-5 h-5 mb-1 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span className="text-[10px] tracking-wide relative z-10 transition-all duration-300 font-medium opacity-80 group-hover:opacity-100">Menu</span>
        </button>
      </div>
    </div>
  );
}
