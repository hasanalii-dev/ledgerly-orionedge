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
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden w-[92%] max-w-[400px] transition-all duration-300 ease-in-out",
      openMobile ? "translate-y-[150%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
    )}>
      <div className="flex items-center justify-between px-2 py-2.5 rounded-[2rem] bg-[#111312]/95 backdrop-blur-xl border border-white/10 shadow-2xl">
        {links.map((link) => {
          // Strict matching for active state
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.name !== "Settings");
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              to={link.href as any}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-12 rounded-full transition-all duration-300 relative group",
                isActive ? "text-[#3DDC97]" : "text-muted-foreground hover:text-white"
              )}
            >
              {isActive && (
                <>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#3DDC97]/50 bg-gradient-to-tr from-[#3DDC97]/20 to-cyan-500/10" />
                  <div className="absolute bottom-0 w-1 h-1 rounded-full bg-[#3DDC97] shadow-[0_0_8px_#3DDC97]" />
                </>
              )}
              <Icon className={cn("w-5 h-5 relative z-10 transition-transform duration-300", isActive && "drop-shadow-[0_0_8px_rgba(61,220,151,0.5)]")} />
            </Link>
          );
        })}

        {/* Menu Button to trigger sidebar */}
        <button
          onClick={() => setOpenMobile(true)}
          className="flex flex-col items-center justify-center flex-1 h-12 rounded-full transition-all duration-300 relative group text-muted-foreground hover:text-white"
        >
          <Menu className="w-5 h-5 relative z-10 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}
