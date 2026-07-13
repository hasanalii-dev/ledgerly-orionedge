import { t as supabase } from "./client-CwRrl1Mu.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-planner-currency-CyRruqkt.js
function usePlannerCurrency(plannerId) {
	const { data } = useQuery({
		queryKey: ["planner", plannerId],
		queryFn: async () => {
			const { data } = await supabase.from("planners").select("*").eq("id", plannerId).maybeSingle();
			return data;
		}
	});
	return data?.currency ?? "USD";
}
//#endregion
export { usePlannerCurrency as t };
