import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { l as formatMoney } from "./_ssr/format-Baza-Edg.mjs";
import { t as useQuery } from "./_libs/tanstack__react-query.mjs";
import { n as CellSelect, r as EditableTable, t as CellInput } from "./_ssr/editable-table-Cf9y0g-y.mjs";
import { t as usePlannerCurrency } from "./_ssr/use-planner-currency-CyRruqkt.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.investments-BKztkcJW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.investments-VtQWwklh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	{
		value: "mutual_fund",
		label: "Mutual Fund"
	},
	{
		value: "stock",
		label: "Stock"
	},
	{
		value: "crypto",
		label: "Crypto"
	},
	{
		value: "bond",
		label: "Bond"
	},
	{
		value: "real_estate",
		label: "Real Estate"
	},
	{
		value: "custom",
		label: "Custom"
	}
];
function InvestmentsPage() {
	const { plannerId } = Route.useParams();
	const [uid, setUid] = (0, import_react.useState)("");
	const currency = usePlannerCurrency(plannerId);
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? ""));
	}, []);
	const { data: rows = [] } = useQuery({
		queryKey: ["investments", plannerId],
		queryFn: async () => (await supabase.from("investments").select("*").eq("planner_id", plannerId).order("created_at")).data ?? []
	});
	const totalAllocated = rows.reduce((s, r) => s + Number(r.allocated_amount ?? 0), 0);
	const totalValue = rows.reduce((s, r) => s + Number(r.current_value ?? 0), 0);
	const totalReturn = rows.reduce((s, r) => s + Number(r.return_amount ?? 0), 0);
	const roi = totalAllocated > 0 ? (totalValue + totalReturn - totalAllocated) / totalAllocated * 100 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Investments"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Allocate capital and track returns across your portfolio."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 lg:grid-cols-4 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Allocated",
						value: formatMoney(totalAllocated, currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Current value",
						value: formatMoney(totalValue, currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Returns",
						value: formatMoney(totalReturn, currency),
						tone: totalReturn >= 0 ? "up" : "down"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "ROI",
						value: `${roi.toFixed(2)}%`,
						tone: roi >= 0 ? "up" : "down"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableTable, {
				table: "investments",
				rows,
				planner_id: plannerId,
				user_id: uid,
				invalidateKeys: [["investments", plannerId]],
				currency,
				onNewRow: () => ({
					name: "New investment",
					kind: "stock",
					allocated_amount: 0,
					current_value: 0,
					return_amount: 0,
					currency
				}),
				totals: {
					amountKey: "current_value",
					label: "Total value"
				},
				columns: [
					{
						key: "name",
						label: "Name",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							value: r.name ?? "",
							onChange: (v) => on({ name: v })
						})
					},
					{
						key: "kind",
						label: "Type",
						width: "150px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellSelect, {
							value: r.kind ?? "stock",
							onChange: (v) => on({ kind: v }),
							options: KINDS
						})
					},
					{
						key: "symbol",
						label: "Symbol",
						width: "110px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							value: r.symbol ?? "",
							onChange: (v) => on({ symbol: v.toUpperCase() }),
							className: "uppercase font-mono"
						})
					},
					{
						key: "allocated_amount",
						label: "Allocated",
						width: "130px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							type: "number",
							value: String(r.allocated_amount ?? 0),
							onChange: (v) => on({ allocated_amount: parseFloat(v) || 0 }),
							className: "text-right font-mono"
						})
					},
					{
						key: "current_value",
						label: "Current",
						width: "130px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							type: "number",
							value: String(r.current_value ?? 0),
							onChange: (v) => on({ current_value: parseFloat(v) || 0 }),
							className: "text-right font-mono"
						})
					},
					{
						key: "return_amount",
						label: "Return",
						width: "130px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							type: "number",
							value: String(r.return_amount ?? 0),
							onChange: (v) => on({ return_amount: parseFloat(v) || 0 }),
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
						key: "purchase_date",
						label: "Purchased",
						width: "140px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							type: "date",
							value: r.purchase_date ?? "",
							onChange: (v) => on({ purchase_date: v || null })
						})
					},
					{
						key: "notes",
						label: "Notes",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							value: r.notes ?? "",
							onChange: (v) => on({ notes: v })
						})
					}
				]
			})
		]
	});
}
function Kpi({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-hairline bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground uppercase tracking-wider",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `mt-1 font-display text-2xl ${tone === "up" ? "text-primary" : tone === "down" ? "text-destructive" : ""}`,
			children: value
		})]
	});
}
//#endregion
export { InvestmentsPage as component };
