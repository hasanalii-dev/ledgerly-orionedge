import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        // If the server rejects the session (e.g., user deleted), clear local storage
        // to prevent an infinite redirect loop between /app and /auth.
        await supabase.auth.signOut().catch(() => {}); // catch signOut errors
        throw redirect({ to: "/auth" });
      }
      return { user: data.user };
    } catch (err: any) {
      // Re-throw if it's a TanStack Router redirect
      if (err && typeof err === 'object' && err.isRedirect) {
        throw err;
      }
      // If gotrue-js throws a corrupted session error (like Uncaught undefined),
      // wipe the storage manually and redirect to /auth safely.
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
