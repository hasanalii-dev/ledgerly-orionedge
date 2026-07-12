import { c as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { l as formatMoney } from "./_ssr/format-Baza-Edg.mjs";
import { t as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as usePlannerCurrency } from "./_ssr/use-planner-currency-CyRruqkt.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.cashflow-DyN2__8s.mjs";
import { a as YAxis, l as CartesianGrid, m as Tooltip, o as XAxis, p as ResponsiveContainer, s as Area, t as AreaChart } from "./_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.cashflow-VVmHFHR-.js
var import_jsx_runtime = require_jsx_runtime();
function CashflowPage() {
	const { plannerId } = Route.useParams();
	const currency = usePlannerCurrency(plannerId);
	const { data = [] } = useQuery({
		queryKey: ["cashflow", plannerId],
		queryFn: async () => {
			const [{ data: inc }, { data: exp }] = await Promise.all([supabase.from("income_entries").select("date, amount").eq("planner_id", plannerId), supabase.from("expense_entries").select("date, amount").eq("planner_id", plannerId)]);
			const byMonth = /* @__PURE__ */ new Map();
			(inc ?? []).forEach((r) => {
				const k = (r.date ?? "").slice(0, 7);
				const cur = byMonth.get(k) ?? {
					income: 0,
					expenses: 0
				};
				cur.income += Number(r.amount);
				byMonth.set(k, cur);
			});
			(exp ?? []).forEach((r) => {
				const k = (r.date ?? "").slice(0, 7);
				const cur = byMonth.get(k) ?? {
					income: 0,
					expenses: 0
				};
				cur.expenses += Number(r.amount);
				byMonth.set(k, cur);
			});
			let running = 0;
			return Array.from(byMonth.entries()).sort().map(([month, v]) => {
				running += v.income - v.expenses;
				return {
					month,
					income: v.income,
					expenses: v.expenses,
					net: v.income - v.expenses,
					running
				};
			});
		}
	});
	const totalNet = data.reduce((s, r) => s + r.net, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Cash Flow"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Monthly income vs expenses and running balance."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Net",
						value: formatMoney(totalNet, currency),
						accent: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Best Month",
						value: formatMoney(Math.max(0, ...data.map((d) => d.net)), currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Months tracked",
						value: String(data.length)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-hairline bg-card p-6 h-[420px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
						data,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
								id: "g1",
								x1: "0",
								y1: "0",
								x2: "0",
								y2: "1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: "oklch(0.75 0.16 158)",
									stopOpacity: .5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: "oklch(0.75 0.16 158)",
									stopOpacity: 0
								})]
							}) }),
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
								type: "monotone",
								dataKey: "running",
								stroke: "oklch(0.75 0.16 158)",
								fill: "url(#g1)",
								strokeWidth: 2
							})
						]
					})
				})
			})
		]
	});
}
function StatCard({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-hairline bg-card p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `mt-2 font-display text-3xl truncate ${accent ? "text-primary" : ""}`,
			title: value,
			children: value
		})]
	});
}
//#endregion
export { CashflowPage as component };
