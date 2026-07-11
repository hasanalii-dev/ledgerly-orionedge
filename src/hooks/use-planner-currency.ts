import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePlannerCurrency(plannerId: string): string {
  const { data } = useQuery({
    queryKey: ["planner", plannerId],
    queryFn: async () => {
      const { data } = await supabase.from("planners").select("currency").eq("id", plannerId).maybeSingle();
      return data;
    },
  });
  return data?.currency ?? "USD";
}
