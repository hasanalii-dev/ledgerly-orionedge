import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { n as CellSelect, r as EditableTable, t as CellInput } from "./_ssr/editable-table-CoPQhPm4.mjs";
import { t as usePlannerCurrency } from "./_ssr/use-planner-currency-CyRruqkt.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.expenses-Cd7rTYid.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.expenses-BiFKqKS9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExpensesPage() {
	const { plannerId } = Route.useParams();
	const [uid, setUid] = (0, import_react.useState)("");
	const currency = usePlannerCurrency(plannerId);
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? ""));
	}, []);
	const { data: rows = [] } = useQuery({
		queryKey: ["expenses", plannerId],
		queryFn: async () => {
			const { data, error } = await supabase.from("expense_entries").select("*").eq("planner_id", plannerId).order("date", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: cats = [] } = useQuery({
		queryKey: ["expense_categories", plannerId],
		queryFn: async () => (await supabase.from("expense_categories").select("id, name").eq("planner_id", plannerId).order("name")).data ?? []
	});
	const { data: accounts = [] } = useQuery({
		queryKey: ["accounts", plannerId],
		queryFn: async () => (await supabase.from("accounts").select("id, name").eq("planner_id", plannerId)).data ?? []
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "Expenses"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Every dollar out — categorized and searchable."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableTable, {
			table: "expense_entries",
			rows,
			planner_id: plannerId,
			user_id: uid,
			invalidateKeys: [["expenses", plannerId], ["dashboard", plannerId]],
			onNewRow: () => ({
				date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				amount: 0,
				currency
			}),
			currency,
			totals: {
				amountKey: "amount",
				label: "Total"
			},
			columns: [
				{
					key: "date",
					label: "Date",
					width: "130px",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						type: "date",
						value: r.date ?? "",
						onChange: (v) => on({ date: v })
					})
				},
				{
					key: "vendor",
					label: "Vendor",
					width: "170px",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						value: r.vendor ?? "",
						onChange: (v) => on({ vendor: v })
					})
				},
				{
					key: "description",
					label: "Description",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						value: r.description ?? "",
						onChange: (v) => on({ description: v })
					})
				},
				{
					key: "category_id",
					label: "Category",
					width: "160px",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellSelect, {
						value: r.category_id ?? "",
						onChange: (v) => on({ category_id: v || null }),
						options: cats.map((c) => ({
							value: c.id,
							label: c.name
						}))
					})
				},
				{
					key: "amount",
					label: "Amount",
					width: "130px",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						type: "number",
						value: String(r.amount ?? 0),
						onChange: (v) => on({ amount: parseFloat(v) || 0 }),
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
					key: "account_id",
					label: "Account",
					width: "150px",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellSelect, {
						value: r.account_id ?? "",
						onChange: (v) => on({ account_id: v || null }),
						options: accounts.map((a) => ({
							value: a.id,
							label: a.name
						}))
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
		})]
	});
}
//#endregion
export { ExpensesPage as component };
