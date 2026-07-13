import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { t as Button } from "./_ssr/button-BkEeRci-.mjs";
import { t as Input } from "./_ssr/input-B8Q2ztVi.mjs";
import { n as Wallet, y as Pencil } from "./_libs/lucide-react.mjs";
import { l as formatMoney, t as ACCOUNT_KINDS } from "./_ssr/format-Baza-Edg.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./_ssr/dialog-CzUx__WV.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.accounts-C8wSPDtv.mjs";
import { n as CellSelect, r as EditableTable, t as CellInput } from "./_ssr/editable-table-CoPQhPm4.mjs";
import { t as usePlannerCurrency } from "./_ssr/use-planner-currency-CyRruqkt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.accounts-Dw-N8a_m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountsPage() {
	const { plannerId } = Route.useParams();
	const [uid, setUid] = (0, import_react.useState)("");
	const currency = usePlannerCurrency(plannerId);
	const qc = useQueryClient();
	const [editAcc, setEditAcc] = (0, import_react.useState)(null);
	const [editAmt, setEditAmt] = (0, import_react.useState)("");
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
	const updateMutation = useMutation({
		mutationFn: async () => {
			if (!editAcc || !editAmt) return;
			const b = balMap.get(editAcc.id) ?? 0;
			const newOpening = Number(editAmt) - b;
			const { error } = await supabase.from("accounts").update({ opening_balance: newOpening }).eq("id", editAcc.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Account balance updated!");
			setEditAcc(null);
			qc.invalidateQueries({ queryKey: ["accounts", plannerId] });
		},
		onError: (e) => toast.error(e.message)
	});
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
						className: "rounded-2xl border border-hairline bg-card p-4 relative group",
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
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary",
								onClick: () => {
									setEditAcc(a);
									setEditAmt(String(live));
								},
								title: "Edit Account Balance",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!editAcc,
				onOpenChange: (open) => !open && setEditAcc(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[425px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit Account Balance" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-4 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground",
								children: [
									"Force set the exact balance for ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: editAcc?.name }),
									". This ignores tracking data and resets the starting balance."
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-sm font-medium",
									children: "New Balance"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									value: editAmt,
									onChange: (e) => setEditAmt(e.target.value)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setEditAcc(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => updateMutation.mutate(),
							disabled: updateMutation.isPending || !editAmt,
							className: "glow-emerald",
							children: "Save Balance"
						})] })
					]
				})
			})
		]
	});
}
//#endregion
export { AccountsPage as component };
