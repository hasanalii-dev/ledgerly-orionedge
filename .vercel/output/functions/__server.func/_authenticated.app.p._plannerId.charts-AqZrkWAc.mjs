import { c as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { l as formatMoney } from "./_ssr/format-Baza-Edg.mjs";
import { t as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as usePlannerCurrency } from "./_ssr/use-planner-currency-CyRruqkt.mjs";
import { a as YAxis, d as Pie, f as Cell, h as Legend, l as CartesianGrid, m as Tooltip, n as PieChart, o as XAxis, p as ResponsiveContainer, r as BarChart, u as Bar } from "./_libs/recharts+[...].mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.charts-DSjgVoM2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.charts-AqZrkWAc.js
var import_jsx_runtime = require_jsx_runtime();
var COLORS = [
	"#3DDC97",
	"#7CC4FF",
	"#FFB86B",
	"#B794F4",
	"#F687B3",
	"#68D391",
	"#F6AD55",
	"#4FD1C5"
];
function ChartsPage() {
	const { plannerId } = Route.useParams();
	const currency = usePlannerCurrency(plannerId);
	const { data: monthly = [] } = useQuery({
		queryKey: ["charts_monthly", plannerId],
		queryFn: async () => {
			const [{ data: inc }, { data: exp }] = await Promise.all([supabase.from("income_entries").select("date, amount").eq("planner_id", plannerId), supabase.from("expense_entries").select("date, amount").eq("planner_id", plannerId)]);
			const m = /* @__PURE__ */ new Map();
			(inc ?? []).forEach((r) => {
				const k = (r.date ?? "").slice(0, 7);
				const c = m.get(k) ?? {
					income: 0,
					expenses: 0
				};
				c.income += Number(r.amount);
				m.set(k, c);
			});
			(exp ?? []).forEach((r) => {
				const k = (r.date ?? "").slice(0, 7);
				const c = m.get(k) ?? {
					income: 0,
					expenses: 0
				};
				c.expenses += Number(r.amount);
				m.set(k, c);
			});
			return Array.from(m.entries()).sort().map(([month, v]) => ({
				month,
				...v
			}));
		}
	});
	const { data: byCat = [] } = useQuery({
		queryKey: ["charts_bycat", plannerId],
		queryFn: async () => {
			const [{ data: exp }, { data: cats }] = await Promise.all([supabase.from("expense_entries").select("category_id, amount").eq("planner_id", plannerId), supabase.from("expense_categories").select("id, name, color").eq("planner_id", plannerId)]);
			const map = /* @__PURE__ */ new Map();
			(exp ?? []).forEach((r) => {
				if (r.category_id) map.set(r.category_id, (map.get(r.category_id) ?? 0) + Number(r.amount));
			});
			return (cats ?? []).map((c) => ({
				name: c.name,
				value: map.get(c.id) ?? 0,
				color: c.color ?? ""
			})).filter((x) => x.value > 0);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "Charts"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "See the shape of your finances."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-hairline bg-card p-6 h-[380px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium mb-4",
					children: "Income vs Expenses"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "90%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: monthly,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "oklch(1 0 0 / 8%)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "month",
								stroke: "oklch(0.6 0 0)",
								fontSize: 11
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								stroke: "oklch(0.6 0 0)",
								fontSize: 11,
								tickFormatter: (val) => formatMoney(val, currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								formatter: (val) => formatMoney(val, currency),
								contentStyle: {
									background: "oklch(0.2 0 0)",
									border: "1px solid oklch(1 0 0 / 10%)",
									borderRadius: 10,
									color: "white"
								},
								itemStyle: { color: "white" }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "income",
								fill: "oklch(0.75 0.16 158)",
								radius: [
									6,
									6,
									0,
									0
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "expenses",
								fill: "oklch(0.65 0.02 260)",
								radius: [
									6,
									6,
									0,
									0
								]
							})
						]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-hairline bg-card p-6 h-[380px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium mb-4",
					children: "Expenses by category"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "90%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
							data: byCat,
							dataKey: "value",
							nameKey: "name",
							outerRadius: 110,
							innerRadius: 60,
							paddingAngle: 2,
							children: byCat.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: c.color || COLORS[i % COLORS.length] }, c.name))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							formatter: (val) => formatMoney(val, currency),
							contentStyle: {
								background: "oklch(0.2 0 0)",
								border: "1px solid oklch(1 0 0 / 10%)",
								borderRadius: 10,
								color: "white"
							},
							itemStyle: { color: "white" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 12 } })
					] })
				})]
			})]
		})]
	});
}
//#endregion
export { ChartsPage as component };
