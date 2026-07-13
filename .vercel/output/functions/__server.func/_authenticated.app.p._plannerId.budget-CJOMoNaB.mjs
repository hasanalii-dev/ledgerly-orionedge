import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { t as Input } from "./_ssr/input-B8Q2ztVi.mjs";
import { l as formatMoney } from "./_ssr/format-Baza-Edg.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as usePlannerCurrency } from "./_ssr/use-planner-currency-CyRruqkt.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.budget-B98MGNKl.mjs";
import { t as Progress } from "./_ssr/progress-DOIEKRJF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.budget-CJOMoNaB.js
var import_jsx_runtime = require_jsx_runtime();
function BudgetPage() {
	const { plannerId } = Route.useParams();
	const currency = usePlannerCurrency(plannerId);
	const month = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7) + "-01";
	const { data: categories = [], refetch } = useQuery({
		queryKey: ["expense_categories", plannerId],
		queryFn: async () => (await supabase.from("expense_categories").select("id, name, color").eq("planner_id", plannerId).order("name")).data ?? []
	});
	const { data: budgets = [] } = useQuery({
		queryKey: [
			"budgets",
			plannerId,
			month
		],
		queryFn: async () => (await supabase.from("budgets").select("*").eq("planner_id", plannerId).eq("month", month)).data ?? []
	});
	const { data: spend = [] } = useQuery({
		queryKey: [
			"budget_spend",
			plannerId,
			month
		],
		queryFn: async () => {
			const start = month;
			const end = new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 1).toISOString().slice(0, 10);
			const { data } = await supabase.from("expense_entries").select("category_id, amount").eq("planner_id", plannerId).gte("date", start).lt("date", end);
			const map = /* @__PURE__ */ new Map();
			(data ?? []).forEach((r) => {
				if (r.category_id) map.set(r.category_id, (map.get(r.category_id) ?? 0) + Number(r.amount));
			});
			return Array.from(map.entries());
		}
	});
	const spendMap = new Map(spend);
	const bMap = new Map(budgets.map((b) => [b.category_id, b]));
	async function setBudget(category_id, amount) {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		const existing = bMap.get(category_id);
		if (existing) {
			const { error } = await supabase.from("budgets").update({ amount }).eq("id", existing.id);
			if (error) return toast.error(error.message);
		} else {
			const { error } = await supabase.from("budgets").insert({
				planner_id: plannerId,
				user_id: user.id,
				category_id,
				amount,
				month
			});
			if (error) return toast.error(error.message);
		}
		refetch();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "Budget"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Set monthly caps by category. Live spend tracked."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-hairline bg-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[1fr_140px_140px_1fr] px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-hairline",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Category" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-right",
							children: "Budget"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-right",
							children: "Spent"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pl-6",
							children: "Progress"
						})
					]
				}),
				categories.map((c) => {
					const b = bMap.get(c.id);
					const spent = spendMap.get(c.id) ?? 0;
					const budget = Number(b?.amount ?? 0);
					const pct = budget > 0 ? Math.min(100, Math.round(spent / budget * 100)) : 0;
					const over = budget > 0 && spent > budget;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[1fr_140px_140px_1fr] px-4 py-3 items-center border-b border-hairline last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-2 w-2 rounded-full",
									style: { background: c.color ?? "#666" }
								}), c.name]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								defaultValue: budget || "",
								onBlur: (e) => setBudget(c.id, parseFloat(e.target.value) || 0),
								className: "text-right font-mono h-9 bg-background border-hairline"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `text-right font-mono ${over ? "text-destructive" : ""}`,
								children: formatMoney(spent, currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pl-6 flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
									value: pct,
									className: "h-1.5 flex-1"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `text-xs w-10 text-right ${over ? "text-destructive" : "text-muted-foreground"}`,
									children: [pct, "%"]
								})]
							})
						]
					}, c.id);
				}),
				categories.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-8 text-center text-sm text-muted-foreground",
					children: "No categories yet."
				})
			]
		})]
	});
}
//#endregion
export { BudgetPage as component };
