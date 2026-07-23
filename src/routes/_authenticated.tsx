import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      // 1. Try fast session check first
      const { data: sessionData } = await supabase.auth.getSession();
      let user = sessionData?.session?.user ?? null;

      // 2. Fallback to server validation if session not in local memory yet
      if (!user) {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          user = data.user;
        }
      }

      if (!user) {
        throw redirect({ to: "/auth" });
      }

      return { user };
    } catch (err: any) {
      // Re-throw if it's a TanStack Router redirect
      if (err && typeof err === "object" && err.isRedirect) {
        throw err;
      }
      console.error("Auth beforeLoad error:", err);
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
