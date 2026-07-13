import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-CwRrl1Mu.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { K as Check, _ as Plus, h as Search, l as Trash2, z as Copy } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CYB-gyWu.mjs";
import { l as formatMoney } from "./format-Baza-Edg.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/editable-table-CoPQhPm4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
function EditableTable({ table, rows, columns, invalidateKeys, planner_id, user_id, onNewRow, currency = "USD", totals }) {
	const qc = useQueryClient();
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [search, setSearch] = (0, import_react.useState)("");
	const [dirty, setDirty] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		const t = setTimeout(async () => {
			const entries = Object.entries(dirty);
			if (entries.length === 0) return;
			for (const [id, patch] of entries) {
				const { error } = await supabase.from(table).update(patch).eq("id", id);
				if (error) toast.error(error.message);
			}
			setDirty({});
			invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
		}, 600);
		return () => clearTimeout(t);
	}, [
		dirty,
		table,
		qc,
		invalidateKeys
	]);
	function patchRow(id, patch) {
		setDirty((d) => ({
			...d,
			[id]: {
				...d[id] ?? {},
				...patch
			}
		}));
	}
	async function addRow() {
		const insert = {
			...onNewRow(),
			planner_id,
			user_id
		};
		const { error } = await supabase.from(table).insert(insert);
		if (error) return toast.error(error.message);
		invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
	}
	async function deleteSelected() {
		if (selected.size === 0) return;
		if (!confirm(`Delete ${selected.size} row(s)?`)) return;
		const { error } = await supabase.from(table).delete().in("id", Array.from(selected));
		if (error) return toast.error(error.message);
		setSelected(/* @__PURE__ */ new Set());
		invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
	}
	async function duplicateSelected() {
		const toDup = rows.filter((r) => selected.has(r.id));
		if (toDup.length === 0) return;
		const inserts = toDup.map((r) => {
			const { id, created_at, updated_at, ...rest } = r;
			return {
				...rest,
				planner_id,
				user_id
			};
		});
		const { error } = await supabase.from(table).insert(inserts);
		if (error) return toast.error(error.message);
		setSelected(/* @__PURE__ */ new Set());
		invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
	}
	const filtered = rows.filter((r) => {
		if (!search) return true;
		const q = search.toLowerCase();
		return Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q));
	});
	const totalAmount = totals ? filtered.reduce((s, r) => s + Number(r[totals.amountKey] ?? 0), 0) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-hairline bg-card overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 px-4 py-3 border-b border-hairline",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search…",
						className: "pl-8 h-9 bg-background border-hairline"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: [filtered.length, " rows"]
				}),
				selected.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: duplicateSelected,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4 mr-1" }), "Duplicate"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: deleteSelected,
					className: "text-destructive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-1" }), "Delete"]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: addRow,
					className: "glow-emerald",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), "New"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-auto max-h-[calc(100vh-260px)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-xs text-muted-foreground bg-card sticky-th",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "w-8 p-2 border-b border-hairline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: selected.size === filtered.length && filtered.length > 0,
									onCheckedChange: (c) => setSelected(c ? new Set(filtered.map((r) => r.id)) : /* @__PURE__ */ new Set())
								})
							}),
							columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium p-2 border-b border-hairline whitespace-nowrap",
								style: { width: c.width },
								children: c.label
							}, String(c.key))),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-8 p-2 border-b border-hairline" })
						]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						colSpan: columns.length + 2,
						className: "p-10 text-center text-sm text-muted-foreground",
						children: [
							"No rows yet. Click ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-primary",
								children: "New"
							}),
							" to add one."
						]
					}) }), filtered.map((row) => {
						const merged = {
							...row,
							...dirty[row.id] ?? {}
						};
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "hover:bg-elevated/60 group",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2 border-b border-hairline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
										checked: selected.has(row.id),
										onCheckedChange: (c) => {
											setSelected((s) => {
												const n = new Set(s);
												if (c) n.add(row.id);
												else n.delete(row.id);
												return n;
											});
										}
									})
								}),
								columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-1 border-b border-hairline align-top",
									children: c.render ? c.render(merged, (patch) => patchRow(row.id, patch)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
										value: String(merged[c.key] ?? ""),
										onChange: (v) => patchRow(row.id, { [c.key]: v })
									})
								}, String(c.key))),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-1 border-b border-hairline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: async () => {
											const { error } = await supabase.from(table).delete().eq("id", row.id);
											if (error) toast.error(error.message);
											else invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
										},
										className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})
								})
							]
						}, row.id);
					})] }),
					totals && filtered.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						colSpan: columns.length + 2,
						className: "p-3 text-right text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground mr-3",
							children: totals.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-primary text-lg",
							children: formatMoney(totalAmount, currency)
						})]
					}) }) })
				]
			})
		})]
	});
}
function CellInput({ value, onChange, type = "text", className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		value,
		onChange: (e) => onChange(e.target.value),
		step: type === "number" ? "any" : void 0,
		className: `w-full bg-transparent px-2 py-1.5 text-sm outline-none focus:bg-elevated rounded-md focus:ring-1 focus:ring-primary/40 ${className}`
	});
}
function CellSelect({ value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value: value || void 0,
		onValueChange: onChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
			className: "h-8 border-0 bg-transparent hover:bg-elevated px-2 focus:ring-1 focus:ring-primary/40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: o.value,
			children: o.label
		}, o.value)) })]
	});
}
//#endregion
export { CellSelect as n, EditableTable as r, CellInput as t };
