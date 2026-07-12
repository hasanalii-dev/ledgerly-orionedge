import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { l as formatMoney } from "./_ssr/format-Baza-Edg.mjs";
import { t as useQuery } from "./_libs/tanstack__react-query.mjs";
import { r as EditableTable, t as CellInput } from "./_ssr/editable-table-Cf9y0g-y.mjs";
import { t as usePlannerCurrency } from "./_ssr/use-planner-currency-CyRruqkt.mjs";
import { t as Progress } from "./_ssr/progress-DOIEKRJF.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.goals-CtH_nS0u.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.goals-DK4oYtwC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GoalsPage() {
	const { plannerId } = Route.useParams();
	const [uid, setUid] = (0, import_react.useState)("");
	const currency = usePlannerCurrency(plannerId);
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? ""));
	}, []);
	const { data: rows = [] } = useQuery({
		queryKey: ["goals", plannerId],
		queryFn: async () => (await supabase.from("goals").select("*").eq("planner_id", plannerId).order("created_at")).data ?? []
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Goals"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Milestones for savings, revenue, or anything else."
			})] }),
			rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3",
				children: rows.map((g) => {
					const pct = Math.min(100, Math.round(Number(g.saved_amount) / Math.max(1, Number(g.target_amount)) * 100));
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-hairline bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm font-medium",
								children: [
									g.emoji ?? "🎯",
									" ",
									g.name
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-xs text-muted-foreground",
								children: ["Due ", g.deadline ?? "—"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-baseline justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-display text-2xl text-primary",
									children: formatMoney(g.saved_amount, g.currency)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: ["of ", formatMoney(g.target_amount, g.currency)]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: pct,
								className: "mt-3 h-1.5"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-xs text-primary",
								children: [pct, "%"]
							})
						]
					}, g.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableTable, {
				table: "goals",
				rows,
				planner_id: plannerId,
				user_id: uid,
				invalidateKeys: [["goals", plannerId]],
				onNewRow: () => ({
					name: "New goal",
					target_amount: 1e3,
					saved_amount: 0,
					currency
				}),
				columns: [
					{
						key: "emoji",
						label: "",
						width: "60px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							value: r.emoji ?? "",
							onChange: (v) => on({ emoji: v }),
							className: "text-center"
						})
					},
					{
						key: "name",
						label: "Goal",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							value: r.name ?? "",
							onChange: (v) => on({ name: v })
						})
					},
					{
						key: "target_amount",
						label: "Target",
						width: "140px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							type: "number",
							value: String(r.target_amount ?? 0),
							onChange: (v) => on({ target_amount: parseFloat(v) || 0 }),
							className: "text-right font-mono"
						})
					},
					{
						key: "saved_amount",
						label: "Saved",
						width: "140px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							type: "number",
							value: String(r.saved_amount ?? 0),
							onChange: (v) => on({ saved_amount: parseFloat(v) || 0 }),
							className: "text-right font-mono"
						})
					},
					{
						key: "currency",
						label: "CCY",
						width: "80px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							value: r.currency ?? currency,
							onChange: (v) => on({ currency: v.toUpperCase() }),
							className: "uppercase"
						})
					},
					{
						key: "deadline",
						label: "Deadline",
						width: "140px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							type: "date",
							value: r.deadline ?? "",
							onChange: (v) => on({ deadline: v || null })
						})
					}
				]
			})
		]
	});
}
//#endregion
export { GoalsPage as component };
