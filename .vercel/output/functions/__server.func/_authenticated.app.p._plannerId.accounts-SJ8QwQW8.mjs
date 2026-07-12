import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { n as Wallet } from "./_libs/lucide-react.mjs";
import { l as formatMoney, t as ACCOUNT_KINDS } from "./_ssr/format-Baza-Edg.mjs";
import { t as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.accounts-Dn7eCUHS.mjs";
import { n as CellSelect, r as EditableTable, t as CellInput } from "./_ssr/editable-table-Cf9y0g-y.mjs";
import { t as usePlannerCurrency } from "./_ssr/use-planner-currency-CyRruqkt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.accounts-SJ8QwQW8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountsPage() {
	const { plannerId } = Route.useParams();
	const [uid, setUid] = (0, import_react.useState)("");
	const currency = usePlannerCurrency(plannerId);
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? ""));
	}, []);
	const { data: rows = [] } = useQuery({
		queryKey: ["accounts", plannerId],
		queryFn: async () => (await supabase.from("accounts").select("*").eq("planner_id", plannerId).order("name")).data ?? []
	});
	const { data: bals = [] } = useQuery({
		queryKey: ["account_balances", plannerId],
		queryFn: async () => {
			const [{ data: inc }, { data: exp }] = await Promise.all([supabase.from("income_entries").select("account_id, amount").eq("planner_id", plannerId), supabase.from("expense_entries").select("account_id, amount").eq("planner_id", plannerId)]);
			const map = /* @__PURE__ */ new Map();
			(inc ?? []).forEach((r) => {
				if (r.account_id) map.set(r.account_id, (map.get(r.account_id) ?? 0) + Number(r.amount));
			});
			(exp ?? []).forEach((r) => {
				if (r.account_id) map.set(r.account_id, (map.get(r.account_id) ?? 0) - Number(r.amount));
			});
			return Array.from(map.entries());
		}
	});
	const balMap = new Map(bals);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Accounts"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Wallets, banks and cash — with live balances."
			})] }),
			rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",
				children: rows.map((a) => {
					const live = Number(a.opening_balance ?? 0) + (balMap.get(a.id) ?? 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-hairline bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" }), a.kind]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 font-medium truncate",
								children: a.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 font-display text-2xl text-primary",
								children: formatMoney(live, a.currency)
							})
						]
					}, a.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableTable, {
				table: "accounts",
				rows,
				planner_id: plannerId,
				user_id: uid,
				invalidateKeys: [["accounts", plannerId]],
				onNewRow: () => ({
					name: "New account",
					kind: "bank",
					currency,
					opening_balance: 0
				}),
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
						width: "140px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellSelect, {
							value: r.kind ?? "bank",
							onChange: (v) => on({ kind: v }),
							options: ACCOUNT_KINDS.map((k) => ({
								value: k,
								label: k
							}))
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
						key: "opening_balance",
						label: "Opening",
						width: "140px",
						render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
							type: "number",
							value: String(r.opening_balance ?? 0),
							onChange: (v) => on({ opening_balance: parseFloat(v) || 0 }),
							className: "text-right font-mono"
						})
					}
				]
			})
		]
	});
}
//#endregion
export { AccountsPage as component };
