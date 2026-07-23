import { Link, useRouterState, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Calendar, Wallet, Menu, User, Calculator } from "lucide-react";
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
    { name: "Accounts", href: `/app/p/${plannerId}/accounts`, icon: Wallet },
    { name: "Calc", href: `/app/p/${plannerId}/calculator`, icon: Calculator },
    { name: "Profile", href: `/app/profile`, icon: User },
  ];

  return (
    <div className={cn(
      "fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] md:hidden w-[92%] max-w-[420px] transition-all duration-300 ease-out",
      openMobile ? "translate-y-[150%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
    )}>
      {/* Outer Prism Glow Container */}
      <div className="relative rounded-[2.5rem] p-[1px] bg-gradient-to-r from-white/15 via-[#3DDC97]/35 via-cyan-400/25 to-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
        
        {/* Prismatic Top Highlight Line */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent z-20 pointer-events-none" />

        {/* Main Ultra-Refractive Black Glass Dock Container */}
        <div className="relative flex items-center justify-between px-3 py-2 rounded-[2.4rem] bg-[#050505]/95 backdrop-blur-2xl backdrop-saturate-[200%] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_2px_rgba(0,0,0,0.9)] overflow-hidden">

          {/* Liquid Glass Background Reflection */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-0" />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#3DDC97]/15 blur-2xl rounded-full pointer-events-none z-0" />

          {links.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.name !== "Settings");
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                to={link.href as any}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-12 rounded-full transition-all duration-300 relative group z-10 active:scale-90",
                  isActive ? "text-[#3DDC97]" : "text-white/60 hover:text-white"
                )}
              >
                {isActive && (
                  <>
                    {/* Glowing Refractive Glass Pill behind active icon */}
                    <div className="absolute inset-x-1 inset-y-1 rounded-2xl bg-gradient-to-tr from-[#3DDC97]/30 via-[#3DDC97]/10 to-cyan-400/20 border border-[#3DDC97]/60 shadow-[0_0_20px_rgba(61,220,151,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-md" />
                    {/* Active Bottom Glow Dot */}
                    <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#3DDC97] shadow-[0_0_8px_#3DDC97,0_0_16px_#3DDC97]" />
                  </>
                )}
                <Icon className={cn(
                  "w-5 h-5 relative z-10 transition-all duration-300",
                  isActive ? "scale-110 text-[#3DDC97] drop-shadow-[0_0_10px_rgba(61,220,151,0.8)]" : "group-hover:scale-105"
                )} />
              </Link>
            );
          })}

          {/* Menu Trigger Button */}
          <button
            onClick={() => setOpenMobile(true)}
            className="flex flex-col items-center justify-center flex-1 h-12 rounded-full transition-all duration-300 relative group z-10 active:scale-90 text-white/60 hover:text-white"
            title="Open Drawer Menu"
          >
            <Menu className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-105" />
          </button>

        </div>
      </div>
    </div>
  );
}
