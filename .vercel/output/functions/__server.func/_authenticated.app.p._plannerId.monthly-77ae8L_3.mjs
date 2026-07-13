import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { t as Button } from "./_ssr/button-BkEeRci-.mjs";
import { t as Input } from "./_ssr/input-B8Q2ztVi.mjs";
import { K as Check, _ as Plus, l as Trash2, n as Wallet, q as ChartPie, t as X, y as Pencil } from "./_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CYB-gyWu.mjs";
import { l as formatMoney } from "./_ssr/format-Baza-Edg.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./_ssr/dialog-CzUx__WV.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { d as Pie, f as Cell, m as Tooltip, n as PieChart, p as ResponsiveContainer } from "./_libs/recharts+[...].mjs";
import { i as format } from "./_libs/date-fns.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.monthly-DOJGkw2k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.monthly-77ae8L_3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AllocationTable({ title, type, total, items, currency, plannerId, monthYear, onAssign, netCashflow }) {
	const qc = useQueryClient();
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [editCat, setEditCat] = (0, import_react.useState)("");
	const [editDesc, setEditDesc] = (0, import_react.useState)("");
	const [editAmt, setEditAmt] = (0, import_react.useState)("");
	const [isAdding, setIsAdding] = (0, import_react.useState)(false);
	const [addCat, setAddCat] = (0, import_react.useState)("");
	const [addDesc, setAddDesc] = (0, import_react.useState)("");
	const [addAmt, setAddAmt] = (0, import_react.useState)("");
	const deleteMutation = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("monthly_allocations").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Deleted");
			qc.invalidateQueries({ queryKey: [
				"monthly_allocations",
				plannerId,
				monthYear
			] });
		},
		onError: (e) => toast.error(e.message)
	});
	const updateMutation = useMutation({
		mutationFn: async () => {
			if (!editCat || !editAmt) throw new Error("Category and Amount required");
			const newAmt = Number(editAmt);
			if (type !== "earning") {
				const currentItem = items.find((i) => i.id === editingId);
				if (netCashflow - (newAmt - (currentItem ? currentItem.amount : 0)) < 0) throw new Error("Cannot allocate more than your available net cash flow!");
			}
			const { error } = await supabase.from("monthly_allocations").update({
				category: editCat,
				description: editDesc || null,
				amount: newAmt
			}).eq("id", editingId);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Updated");
			setEditingId(null);
			qc.invalidateQueries({ queryKey: [
				"monthly_allocations",
				plannerId,
				monthYear
			] });
		},
		onError: (e) => toast.error(e.message)
	});
	const addMutation = useMutation({
		mutationFn: async () => {
			if (!addCat || !addAmt) throw new Error("Category and Amount required");
			const newAmt = Number(addAmt);
			if (type !== "earning") {
				if (netCashflow - newAmt < 0) throw new Error("Cannot allocate more than your available net cash flow!");
			}
			const { error } = await supabase.from("monthly_allocations").insert({
				planner_id: plannerId,
				month_year: monthYear,
				allocation_type: type,
				category: addCat,
				description: addDesc || null,
				amount: newAmt
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Added");
			setIsAdding(false);
			setAddCat("");
			setAddDesc("");
			setAddAmt("");
			qc.invalidateQueries({ queryKey: [
				"monthly_allocations",
				plannerId,
				monthYear
			] });
		},
		onError: (e) => toast.error(e.message)
	});
	const startEdit = (item) => {
		setEditingId(item.id);
		setEditCat(item.category);
		setEditDesc(item.description || "");
		setEditAmt(item.amount.toString());
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl hover:bg-card/60 transition-colors shadow-sm overflow-hidden flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-primary font-medium",
						children: formatMoney(total, currency)
					}), onAssign && total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-7 w-7 text-muted-foreground hover:text-primary transition-colors",
						onClick: () => onAssign(total, title, type),
						title: "Assign to Account",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 p-0 overflow-x-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm hidden md:table",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs uppercase tracking-wider text-muted-foreground bg-white/5 sticky top-0 z-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-5 py-3 font-medium",
								children: "Category"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-5 py-3 font-medium",
								children: "Description"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-5 py-3 font-medium text-right",
								children: "Amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-3 w-[100px] text-center",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
						className: "divide-y divide-white/5",
						children: [items.length === 0 && !isAdding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 4,
							className: "px-5 py-8 text-center text-muted-foreground text-sm",
							children: "No items yet"
						}) }) : items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "group hover:bg-white/5 transition-colors",
							children: editingId === item.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8 text-sm",
										value: editCat,
										onChange: (e) => setEditCat(e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8 text-sm",
										value: editDesc,
										onChange: (e) => setEditDesc(e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8 text-sm text-right",
										type: "number",
										step: "0.01",
										value: editAmt,
										onChange: (e) => setEditAmt(e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-2 py-2 text-center flex justify-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => updateMutation.mutate(),
										className: "p-1.5 text-primary hover:bg-primary/20 rounded-md transition-colors",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setEditingId(null),
										className: "p-1.5 text-muted-foreground hover:bg-white/10 rounded-md transition-colors",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
									})]
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 font-medium",
									children: item.category
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-muted-foreground truncate max-w-[200px]",
									children: item.description ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-right",
									children: formatMoney(item.amount, currency)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-2 py-3 text-center flex justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1",
									children: [
										onAssign && item.amount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => onAssign(item.amount, item.category, type),
											className: "p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/20 rounded-md transition-colors",
											title: "Assign to Account",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => startEdit(item),
											className: "p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/20 rounded-md transition-colors",
											title: "Edit",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => deleteMutation.mutate(item.id),
											className: "p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/20 rounded-md transition-colors",
											title: "Delete",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
										})
									]
								})
							] })
						}, item.id)), isAdding && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "bg-white/5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Category",
										autoFocus: true,
										className: "h-8 text-sm",
										value: addCat,
										onChange: (e) => setAddCat(e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Description (optional)",
										className: "h-8 text-sm",
										value: addDesc,
										onChange: (e) => setAddDesc(e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "0.00",
										className: "h-8 text-sm text-right",
										type: "number",
										step: "0.01",
										value: addAmt,
										onChange: (e) => setAddAmt(e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-2 py-2 text-center flex justify-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => addMutation.mutate(),
										className: "p-1.5 text-primary hover:bg-primary/20 rounded-md transition-colors",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setIsAdding(false);
											setAddCat("");
											setAddDesc("");
											setAddAmt("");
										},
										className: "p-1.5 text-muted-foreground hover:bg-white/10 rounded-md transition-colors",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
									})]
								})
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:hidden flex flex-col divide-y divide-white/5",
					children: [
						items.length === 0 && !isAdding && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-4 py-8 text-center text-muted-foreground text-sm",
							children: "No items yet"
						}),
						items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4 flex flex-col gap-3",
							children: editingId === item.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Category",
										className: "h-9 text-sm",
										value: editCat,
										onChange: (e) => setEditCat(e.target.value)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Description",
										className: "h-9 text-sm",
										value: editDesc,
										onChange: (e) => setEditDesc(e.target.value)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Amount",
										className: "h-9 text-sm",
										type: "number",
										step: "0.01",
										value: editAmt,
										onChange: (e) => setEditAmt(e.target.value)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 mt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											onClick: () => updateMutation.mutate(),
											size: "sm",
											className: "flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 mr-2" }), " Save"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											onClick: () => setEditingId(null),
											size: "sm",
											variant: "ghost",
											className: "flex-1",
											children: "Cancel"
										})]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-start gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium text-sm text-foreground",
										children: item.category
									}), item.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: item.description
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium whitespace-nowrap",
									children: formatMoney(item.amount, currency)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 mt-1",
								children: [
									onAssign && item.amount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: () => onAssign(item.amount, item.category, type),
										variant: "secondary",
										size: "sm",
										className: "h-7 text-xs px-2 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3 w-3 mr-1.5" }), " Assign"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: () => startEdit(item),
										variant: "secondary",
										size: "sm",
										className: "h-7 text-xs px-2 flex-1 bg-white/5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3 w-3 mr-1.5" }), " Edit"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: () => deleteMutation.mutate(item.id),
										variant: "secondary",
										size: "sm",
										className: "h-7 text-xs px-2 flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3 mr-1.5" }), " Delete"]
									})
								]
							})] })
						}, item.id)),
						isAdding && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 flex flex-col gap-2 bg-white/5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Category",
									autoFocus: true,
									className: "h-9 text-sm",
									value: addCat,
									onChange: (e) => setAddCat(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Description (optional)",
									className: "h-9 text-sm",
									value: addDesc,
									onChange: (e) => setAddDesc(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Amount",
									className: "h-9 text-sm",
									type: "number",
									step: "0.01",
									value: addAmt,
									onChange: (e) => setAddAmt(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 mt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: () => addMutation.mutate(),
										size: "sm",
										className: "flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 mr-2" }), " Save"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										onClick: () => {
											setIsAdding(false);
											setAddCat("");
											setAddDesc("");
											setAddAmt("");
										},
										size: "sm",
										variant: "ghost",
										className: "flex-1",
										children: "Cancel"
									})]
								})
							]
						})
					]
				})]
			}),
			!isAdding && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-white/5 p-2 bg-black/20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => setIsAdding(true),
					className: "w-full text-muted-foreground hover:text-foreground text-xs h-9",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }), " Add entry"]
				})
			})
		]
	});
}
function MonthlyTracking() {
	const { plannerId } = Route.useParams();
	const qc = useQueryClient();
	const [monthYear, setMonthYear] = (0, import_react.useState)(() => format(/* @__PURE__ */ new Date(), "yyyy-MM"));
	const { data: planner } = useQuery({
		queryKey: ["planner", plannerId],
		queryFn: async () => (await supabase.from("planners").select("*").eq("id", plannerId).single()).data
	});
	const currency = planner?.currency ?? "USD";
	const { data: allocations = [] } = useQuery({
		queryKey: [
			"monthly_allocations",
			plannerId,
			monthYear
		],
		queryFn: async () => {
			const { data } = await supabase.from("monthly_allocations").select("*").eq("planner_id", plannerId).eq("month_year", monthYear).order("created_at", { ascending: true });
			return data ?? [];
		}
	});
	const getTotals = (type) => allocations.filter((a) => a.allocation_type === type).reduce((sum, a) => sum + Number(a.amount), 0);
	const tEarnings = getTotals("earning");
	const tSavings = getTotals("saving");
	const tExpenses = getTotals("personal_expense");
	const tInvestments = getTotals("investment");
	const tOther = getTotals("other");
	const netCashflow = tEarnings - tSavings - tExpenses - tInvestments - tOther;
	const pieData = [
		{
			name: "Savings",
			value: tSavings,
			color: "#3DDC97"
		},
		{
			name: "Expenses",
			value: tExpenses,
			color: "#F56565"
		},
		{
			name: "Investments",
			value: tInvestments,
			color: "#7CC4FF"
		},
		{
			name: "Other",
			value: tOther,
			color: "#F6AD55"
		}
	].filter((d) => d.value > 0);
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [addType, setAddType] = (0, import_react.useState)("earning");
	const [addCat, setAddCat] = (0, import_react.useState)("");
	const [addDesc, setAddDesc] = (0, import_react.useState)("");
	const [addAmt, setAddAmt] = (0, import_react.useState)("");
	const addMutationTop = useMutation({
		mutationFn: async () => {
			if (!addCat || !addAmt) throw new Error("Category and Amount required");
			const newAmt = Number(addAmt);
			if (addType !== "earning") {
				if (netCashflow - newAmt < 0) throw new Error("Cannot allocate more than your available net cash flow!");
			}
			const { error } = await supabase.from("monthly_allocations").insert({
				planner_id: plannerId,
				month_year: monthYear,
				allocation_type: addType,
				category: addCat,
				description: addDesc || null,
				amount: newAmt
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Entry added");
			setAddOpen(false);
			setAddCat("");
			setAddDesc("");
			setAddAmt("");
			qc.invalidateQueries({ queryKey: [
				"monthly_allocations",
				plannerId,
				monthYear
			] });
		},
		onError: (e) => toast.error(e.message)
	});
	const [assignOpen, setAssignOpen] = (0, import_react.useState)(false);
	const [assignTotal, setAssignTotal] = (0, import_react.useState)(0);
	const [assignTitle, setAssignTitle] = (0, import_react.useState)("");
	const [assignType, setAssignType] = (0, import_react.useState)("");
	const [assignTargetAcc, setAssignTargetAcc] = (0, import_react.useState)("");
	const [assignSourceAcc, setAssignSourceAcc] = (0, import_react.useState)("");
	const { data: accounts = [] } = useQuery({
		queryKey: ["accounts", plannerId],
		queryFn: async () => (await supabase.from("accounts").select("id, name, opening_balance").eq("planner_id", plannerId)).data ?? []
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
	const assignMutation = useMutation({
		mutationFn: async (mode = "add") => {
			if (assignType !== "earning" && !assignSourceAcc) throw new Error("Select a source account");
			if (!assignTargetAcc) throw new Error("Select a destination account");
			const target = accounts.find((a) => a.id === assignTargetAcc);
			if (!target) throw new Error("Target account not found");
			const targetLive = Number(target.opening_balance || 0) + (balMap.get(target.id) ?? 0);
			if (assignType === "earning") {
				const diff = mode === "overwrite" ? assignTotal - targetLive : assignTotal;
				const newBalance = Number(target.opening_balance || 0) + diff;
				const { error } = await supabase.from("accounts").update({ opening_balance: newBalance }).eq("id", assignTargetAcc);
				if (error) throw error;
			} else {
				const source = accounts.find((a) => a.id === assignSourceAcc);
				if (!source) throw new Error("Source account not found");
				const targetDiff = mode === "overwrite" ? assignTotal - targetLive : assignTotal;
				const newTargetBalance = Number(target.opening_balance || 0) + targetDiff;
				const newSourceBalance = Number(source.opening_balance || 0) - assignTotal;
				const { error: err1 } = await supabase.from("accounts").update({ opening_balance: newSourceBalance }).eq("id", assignSourceAcc);
				if (err1) throw err1;
				const { error: err2 } = await supabase.from("accounts").update({ opening_balance: newTargetBalance }).eq("id", assignTargetAcc);
				if (err2) throw err2;
			}
		},
		onSuccess: () => {
			toast.success(assignType === "earning" ? "Money assigned!" : "Transfer complete!");
			setAssignOpen(false);
			qc.invalidateQueries({ queryKey: ["accounts", plannerId] });
		},
		onError: (e) => toast.error(e.message)
	});
	const handleAssign = (amt, title, type) => {
		setAssignTotal(amt);
		setAssignTitle(title);
		setAssignType(type);
		setAssignTargetAcc("");
		setAssignSourceAcc("");
		setAssignOpen(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-[1600px] mx-auto pb-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-display tracking-tight",
					children: "Monthly Tracking"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Allocate and track your earnings month over month."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "month",
						value: monthYear,
						onChange: (e) => setMonthYear(e.target.value),
						className: "w-48 bg-card border-white/10"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setAddOpen(true),
						className: "glow-emerald",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }), " Quick Add"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllocationTable, {
							title: "Monthly Earnings",
							type: "earning",
							total: tEarnings,
							items: allocations.filter((a) => a.allocation_type === "earning"),
							currency,
							plannerId,
							monthYear,
							onAssign: handleAssign,
							netCashflow
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllocationTable, {
							title: "Savings",
							type: "saving",
							total: tSavings,
							items: allocations.filter((a) => a.allocation_type === "saving"),
							currency,
							plannerId,
							monthYear,
							onAssign: handleAssign,
							netCashflow
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllocationTable, {
							title: "Personal Expenses",
							type: "personal_expense",
							total: tExpenses,
							items: allocations.filter((a) => a.allocation_type === "personal_expense"),
							currency,
							plannerId,
							monthYear,
							onAssign: handleAssign,
							netCashflow
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllocationTable, {
							title: "Investments",
							type: "investment",
							total: tInvestments,
							items: allocations.filter((a) => a.allocation_type === "investment"),
							currency,
							plannerId,
							monthYear,
							onAssign: handleAssign,
							netCashflow
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllocationTable, {
							title: "Other Allocations",
							type: "other",
							total: tOther,
							items: allocations.filter((a) => a.allocation_type === "other"),
							currency,
							plannerId,
							monthYear,
							onAssign: handleAssign,
							netCashflow
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-white/5 bg-card/60 backdrop-blur-xl p-6 shadow-xl sticky top-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-display text-xl mb-6 flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { className: "h-5 w-5 text-primary" }), " Allocation Overview"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 mb-8",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-end pb-4 border-b border-white/5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm text-muted-foreground",
											children: "Total Earnings"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-lg",
											children: formatMoney(tEarnings, currency)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-end pb-4 border-b border-white/5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm text-muted-foreground",
											children: "Allocated"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-lg text-muted-foreground",
											children: formatMoney(tEarnings - netCashflow, currency)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-end pt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium",
											children: "Net Cash Flow"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `font-display text-2xl ${netCashflow >= 0 ? "text-primary" : "text-destructive"}`,
											children: formatMoney(netCashflow, currency)
										})]
									})
								]
							}),
							pieData.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-64",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
										data: pieData,
										dataKey: "value",
										nameKey: "name",
										cx: "50%",
										cy: "50%",
										innerRadius: 60,
										outerRadius: 80,
										paddingAngle: 3,
										children: pieData.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: e.color }, i))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										formatter: (val) => formatMoney(val, currency),
										contentStyle: {
											background: "oklch(0.22 0.008 155)",
											border: "1px solid oklch(1 0 0 / 0.08)",
											borderRadius: 12,
											color: "white"
										},
										itemStyle: { color: "white" }
									})] })
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-48 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-white/10 rounded-xl",
								children: "Add allocations to see charts"
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[425px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Quick Add Entry" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 py-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-sm font-medium",
										children: "Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: addType,
										onValueChange: setAddType,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select type" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "earning",
												children: "Earning"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "saving",
												children: "Saving"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "personal_expense",
												children: "Personal Expense"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "investment",
												children: "Investment"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "other",
												children: "Other"
											})
										] })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-sm font-medium",
										children: "Category / Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "e.g. Salary, Rent, Crypto...",
										value: addCat,
										onChange: (e) => setAddCat(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-sm font-medium",
										children: "Description (Optional)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Notes...",
										value: addDesc,
										onChange: (e) => setAddDesc(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-sm font-medium",
										children: "Amount"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										step: "0.01",
										placeholder: "0.00",
										value: addAmt,
										onChange: (e) => setAddAmt(e.target.value)
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setAddOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => addMutationTop.mutate(),
							disabled: addMutationTop.isPending,
							className: "glow-emerald",
							children: "Add Entry"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: assignOpen,
				onOpenChange: setAssignOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[425px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: assignType === "earning" ? "Assign to Wallet" : "Transfer to Wallet" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-4 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										assignType === "earning" ? "Assigning" : "Transferring",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: formatMoney(assignTotal, currency)
										}),
										" from ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: assignTitle
										}),
										"."
									]
								}),
								assignType !== "earning" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-sm font-medium",
										children: "Source Account (Subtract from)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: assignSourceAcc,
										onValueChange: setAssignSourceAcc,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose source account" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: accounts.map((acc) => {
											const live = Number(acc.opening_balance || 0) + (balMap.get(acc.id) ?? 0);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: acc.id,
												disabled: acc.id === assignTargetAcc,
												children: [
													acc.name,
													" (Bal: ",
													formatMoney(live, currency),
													")"
												]
											}, acc.id);
										}) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-sm font-medium",
										children: "Destination Account (Add to)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: assignTargetAcc,
										onValueChange: setAssignTargetAcc,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose destination account" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: accounts.map((acc) => {
											const live = Number(acc.opening_balance || 0) + (balMap.get(acc.id) ?? 0);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: acc.id,
												disabled: acc.id === assignSourceAcc,
												children: [
													acc.name,
													" (Bal: ",
													formatMoney(live, currency),
													")"
												]
											}, acc.id);
										}) })]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-4 border-t border-white/5 pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setAssignOpen(false),
								className: "w-full sm:w-auto",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:flex-row gap-2 w-full sm:w-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => assignMutation.mutate("overwrite"),
									disabled: !assignTargetAcc || assignType !== "earning" && !assignSourceAcc || assignMutation.isPending,
									className: "w-full sm:w-auto",
									children: "Overwrite"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => assignMutation.mutate("add"),
									disabled: !assignTargetAcc || assignType !== "earning" && !assignSourceAcc || assignMutation.isPending,
									className: "glow-emerald w-full sm:w-auto",
									children: assignType === "earning" ? "Assign (Add)" : "Transfer (Add)"
								})]
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { MonthlyTracking as component };
