import { Link, useRouterState, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Calendar, Wallet, Menu, User, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";

export function MobileBottomNav() {
  const { setOpenMobile, openMobile } = useSidebar();
  const params = useParams({ strict: false });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dockHidden, setDockHidden] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("capient_mobile_dock_hidden");
    if (saved === "true") setDockHidden(true);
  }, []);

  const toggleDock = (hidden: boolean) => {
    setDockHidden(hidden);
    localStorage.setItem("capient_mobile_dock_hidden", hidden ? "true" : "false");
  };

  let plannerId = (params as any)?.plannerId;

  // Fallback if not in URL
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
    <div
      onClick={dockHidden ? () => toggleDock(false) : undefined}
      className={cn(
        "fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] md:hidden w-[94%] max-w-[430px] transition-all duration-300 ease-out cursor-pointer pb-3",
        openMobile
          ? "translate-y-[200%] opacity-0 pointer-events-none"
          : dockHidden
          ? "translate-y-[calc(100%-20px)] opacity-90"
          : "translate-y-0 opacity-100"
      )}
    >
      {/* Center Top Handle (Chevron Down when open, Chevron Up when hidden) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleDock(!dockHidden);
        }}
        className={cn(
          "absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 h-4.5 w-9 rounded-full border border-white/15 bg-[#0b0e0d]/90 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white transition-colors",
          dockHidden && "border-white/25 text-white/80"
        )}
        title={dockHidden ? "Show Dock" : "Hide Dock"}
      >
        {dockHidden ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {/* Outer Glow Wrapper */}
      <div className="relative rounded-[2.5rem] p-[1px] bg-[#111] shadow-[0_20px_50px_rgba(0,0,0,0.95)] border border-white/10">
        {/* Top Highlight Line */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20 pointer-events-none" />

        {/* Translucent Container */}
        <div
          className="relative flex items-center justify-between px-3 py-1.5 rounded-[2.4rem] bg-black/85 backdrop-blur-2xl backdrop-saturate-[180%] overflow-hidden"
          style={{ WebkitBackdropFilter: "blur(24px) saturate(180%)", backdropFilter: "blur(24px) saturate(180%)" }}
        >
          {/* Ambient Emerald Glow */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-44 h-8 bg-[#3DDC97]/10 blur-xl rounded-full pointer-events-none z-0" />

          {links.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.name !== "Settings");
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                to={link.href as any}
                onClick={(e) => {
                  if (dockHidden) {
                    e.preventDefault();
                    toggleDock(false);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-12 rounded-full transition-all duration-300 relative group z-10 active:scale-90",
                  isActive ? "text-[#3DDC97]" : "text-white/60 hover:text-white"
                )}
              >
                {isActive && (
                  <>
                    <div
                      className="absolute inset-x-1 inset-y-1 rounded-2xl bg-gradient-to-tr from-[#3DDC97]/35 via-[#3DDC97]/20 to-[#3DDC97]/30 border border-[#3DDC97]/70 shadow-[0_0_20px_rgba(61,220,151,0.5),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-md"
                      style={{ WebkitBackdropFilter: "blur(12px)" }}
                    />
                    <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#3DDC97] shadow-[0_0_8px_#3DDC97,0_0_16px_#3DDC97]" />
                  </>
                )}
                <Icon
                  className={cn(
                    "w-5 h-5 relative z-10 transition-all duration-300",
                    isActive ? "scale-110 text-[#3DDC97] drop-shadow-[0_0_10px_rgba(61,220,151,0.8)]" : "group-hover:scale-105"
                  )}
                />
              </Link>
            );
          })}

          {/* Sidebar Drawer Trigger */}
          <button
            onClick={(e) => {
              if (dockHidden) {
                e.stopPropagation();
                toggleDock(false);
              } else {
                setOpenMobile(true);
              }
            }}
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
