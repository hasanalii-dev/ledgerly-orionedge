import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { A as Download, H as Calendar, L as ChevronDown, N as Clock, n as Wallet, o as TrendingUp, s as TrendingDown } from "./_libs/lucide-react.mjs";
import { c as formatDate, l as formatMoney } from "./_ssr/format-Baza-Edg.mjs";
import { t as Button } from "./_ssr/button-Bq5vK6RO.mjs";
import { t as Input } from "./_ssr/input-B8Q2ztVi.mjs";
import { n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./_ssr/dropdown-menu-BtjXROHi.mjs";
import { t as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as usePlannerCurrency } from "./_ssr/use-planner-currency-CyRruqkt.mjs";
import { a as YAxis, h as Legend, l as CartesianGrid, m as Tooltip, o as XAxis, p as ResponsiveContainer, r as BarChart, u as Bar } from "./_libs/recharts+[...].mjs";
import { a as startOfYear, c as endOfMonth, i as format, l as isValid, o as endOfYear, r as parseISO, s as startOfMonth, t as subYears } from "./_libs/date-fns.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.reports-CXiAma_D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.reports-FINdFbVm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function usePeriod(period, customFrom, customTo) {
	const now = /* @__PURE__ */ new Date();
	switch (period) {
		case "month": return {
			label: "This month",
			from: startOfMonth(now),
			to: endOfMonth(now)
		};
		case "year": return {
			label: "This year",
			from: startOfYear(now),
			to: endOfYear(now)
		};
		case "5years": return {
			label: "Last 5 years",
			from: subYears(startOfYear(now), 4),
			to: endOfYear(now)
		};
		case "custom": {
			const from = parseISO(customFrom);
			const to = parseISO(customTo);
			return {
				label: isValid(from) && isValid(to) ? `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}` : "Custom range",
				from: isValid(from) ? from : /* @__PURE__ */ new Date(0),
				to: isValid(to) ? to : now
			};
		}
		default: return {
			label: "All time",
			from: /* @__PURE__ */ new Date(0),
			to: now
		};
	}
}
function KpiCard({ icon: Icon, label, value, compactValue, sub, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-2xl border p-5 ${tone === "positive" ? "border-primary/30 bg-card glow-emerald text-primary" : tone === "negative" ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-hairline bg-card"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 opacity-80" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 text-3xl font-display tracking-tight truncate",
				title: value,
				children: compactValue || value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs text-muted-foreground",
				children: sub
			})
		]
	});
}
function ReportsPage() {
	const { plannerId } = Route.useParams();
	const currency = usePlannerCurrency(plannerId);
	const [period, setPeriod] = (0, import_react.useState)("month");
	const [customFrom, setCustomFrom] = (0, import_react.useState)(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
	const [customTo, setCustomTo] = (0, import_react.useState)(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
	const periodDef = usePeriod(period, customFrom, customTo);
	const { data: income = [] } = useQuery({
		queryKey: ["income", plannerId],
		queryFn: async () => (await supabase.from("income_entries").select("*, clients(name)").eq("planner_id", plannerId).order("date", { ascending: false })).data ?? []
	});
	const { data: expenses = [] } = useQuery({
		queryKey: ["expenses", plannerId],
		queryFn: async () => (await supabase.from("expense_entries").select("*, expense_categories(name, color)").eq("planner_id", plannerId).order("date", { ascending: false })).data ?? []
	});
	const filteredIncome = income.filter((i) => {
		const d = new Date(i.date);
		return d >= periodDef.from && d <= periodDef.to;
	});
	const filteredExpenses = expenses.filter((e) => {
		const d = new Date(e.date);
		return d >= periodDef.from && d <= periodDef.to;
	});
	const totalIncome = filteredIncome.reduce((s, r) => s + Number(r.amount || 0), 0);
	const totalExpenses = filteredExpenses.reduce((s, r) => s + Number(r.amount || 0), 0);
	const net = totalIncome - totalExpenses;
	const monthCount = Math.max(1, Math.ceil((periodDef.to.getTime() - periodDef.from.getTime()) / (1e3 * 60 * 60 * 24 * 30)));
	const avgIncome = totalIncome / monthCount;
	const avgExpense = totalExpenses / monthCount;
	const categoryTotals = {};
	filteredExpenses.forEach((e) => {
		const cat = e.expense_categories;
		const key = cat?.name ?? "Uncategorized";
		if (!categoryTotals[key]) categoryTotals[key] = {
			name: key,
			color: cat?.color,
			amount: 0
		};
		categoryTotals[key].amount += Number(e.amount || 0);
	});
	const topCategories = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount).slice(0, 8);
	const clientTotals = {};
	filteredIncome.forEach((i) => {
		const key = i.clients?.name ?? "Unassigned";
		if (!clientTotals[key]) clientTotals[key] = {
			name: key,
			amount: 0
		};
		clientTotals[key].amount += Number(i.amount || 0);
	});
	const topClients = Object.values(clientTotals).sort((a, b) => b.amount - a.amount).slice(0, 8);
	const monthlyMap = /* @__PURE__ */ new Map();
	for (let d = new Date(periodDef.from); d <= periodDef.to; d = new Date(d.setMonth(d.getMonth() + 1))) {
		const key = format(d, "yyyy-MM");
		monthlyMap.set(key, {
			label: format(d, "MMM yy"),
			income: 0,
			expenses: 0
		});
	}
	filteredIncome.forEach((i) => {
		const key = (i.date ?? "").slice(0, 7);
		const c = monthlyMap.get(key);
		if (c) c.income += Number(i.amount || 0);
	});
	filteredExpenses.forEach((e) => {
		const key = (e.date ?? "").slice(0, 7);
		const c = monthlyMap.get(key);
		if (c) c.expenses += Number(e.amount || 0);
	});
	const monthly = Array.from(monthlyMap.values());
	const csv = [
		[
			"Type",
			"Date",
			"Description",
			"Category/Client",
			"Amount",
			"Currency"
		],
		...filteredIncome.map((i) => [
			"Income",
			i.date,
			i.description ?? "",
			i.clients?.name ?? "",
			String(i.amount),
			i.currency ?? currency
		]),
		...filteredExpenses.map((e) => [
			"Expense",
			e.date,
			e.description ?? "",
			e.expense_categories?.name ?? "",
			String(e.amount),
			e.currency ?? currency
		])
	].map((r) => r.map((c) => `"${String(c).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
	const downloadCsv = () => {
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `ledgerly-report-${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-[1600px] mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-display tracking-tight",
					children: "Reports"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [
						periodDef.label,
						" · ",
						formatDate(periodDef.from),
						" – ",
						formatDate(periodDef.to)
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "border-hairline bg-card hover:bg-accent",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 mr-2" }),
								period === "month" && "This month",
								period === "year" && "This year",
								period === "5years" && "Last 5 years",
								period === "all" && "All time",
								period === "custom" && "Custom range",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 ml-2 opacity-60" })
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-48",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: () => setPeriod("month"),
								children: "This month"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: () => setPeriod("year"),
								children: "This year"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: () => setPeriod("5years"),
								children: "Last 5 years"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: () => setPeriod("all"),
								children: "All time"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: () => setPeriod("custom"),
								children: "Custom range"
							})
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: downloadCsv,
						variant: "outline",
						className: "border-hairline bg-card hover:bg-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-2" }), "Export CSV"]
					})]
				})]
			}),
			period === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row gap-3 rounded-2xl border border-hairline bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs text-muted-foreground",
						children: "From"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: customFrom,
						onChange: (e) => setCustomFrom(e.target.value),
						className: "bg-input border-hairline"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs text-muted-foreground",
						children: "To"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: customTo,
						onChange: (e) => setCustomTo(e.target.value),
						className: "bg-input border-hairline"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: TrendingUp,
						label: "Total Earned",
						value: formatMoney(totalIncome, currency),
						compactValue: formatMoney(totalIncome, currency, true),
						tone: "positive"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: TrendingDown,
						label: "Total Spent",
						value: formatMoney(totalExpenses, currency),
						compactValue: formatMoney(totalExpenses, currency, true),
						tone: "negative"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: Wallet,
						label: "Net",
						value: formatMoney(net, currency),
						compactValue: formatMoney(net, currency, true),
						tone: net >= 0 ? "positive" : "negative"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: Clock,
						label: "Transactions",
						value: String(filteredIncome.length + filteredExpenses.length)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: Calendar,
						label: "Avg monthly income",
						value: formatMoney(avgIncome, currency),
						compactValue: formatMoney(avgIncome, currency, true)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: Calendar,
						label: "Avg monthly spend",
						value: formatMoney(avgExpense, currency),
						compactValue: formatMoney(avgExpense, currency, true)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: TrendingUp,
						label: "Income transactions",
						value: String(filteredIncome.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: TrendingDown,
						label: "Expense transactions",
						value: String(filteredExpenses.length)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-hairline bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg",
						children: "Income vs Spend"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Monthly breakdown for the selected period"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-72",
					children: monthly.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: monthly,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "oklch(1 0 0 / 6%)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									stroke: "oklch(0.66 0.02 155)",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "oklch(0.66 0.02 155)",
									fontSize: 12,
									tickFormatter: (v) => `${(v / 1e3).toFixed(0)}k`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									formatter: (val) => formatMoney(val, currency),
									contentStyle: {
										background: "oklch(0.22 0.008 155)",
										border: "1px solid oklch(1 0 0 / 0.08)",
										borderRadius: 12,
										color: "white"
									},
									itemStyle: { color: "white" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 12 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "income",
									name: "Earned",
									fill: "#3DDC97",
									radius: [
										6,
										6,
										0,
										0
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "expenses",
									name: "Spent",
									fill: "#F56565",
									radius: [
										6,
										6,
										0,
										0
									]
								})
							]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full flex items-center justify-center text-sm text-muted-foreground",
						children: "No transactions in this period"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid md:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-hairline bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg mb-1",
							children: "Top clients"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mb-4",
							children: "By income in this period"
						}),
						topClients.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted-foreground text-center py-6",
							children: "No income recorded"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: topClients.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm truncate",
									children: c.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium text-primary",
									children: formatMoney(c.amount, currency)
								})]
							}, c.name))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-hairline bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg mb-1",
							children: "Top expense categories"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mb-4",
							children: "By spend in this period"
						}),
						topCategories.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted-foreground text-center py-6",
							children: "No expenses recorded"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: topCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [c.color && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-2.5 w-2.5 rounded-full",
										style: { backgroundColor: c.color }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm truncate",
										children: c.name
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: formatMoney(c.amount, currency)
								})]
							}, c.name))
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-hairline bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg mb-1",
						children: "Recent transactions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mb-4",
						children: "In this period"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-left text-xs text-muted-foreground border-b border-hairline",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 font-medium",
										children: "Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 font-medium",
										children: "Type"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 font-medium",
										children: "Description"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 font-medium",
										children: "Source/Category"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 font-medium text-right",
										children: "Amount"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
								className: "divide-y divide-hairline",
								children: [[...filteredIncome.map((i) => ({
									...i,
									kind: "income"
								})), ...filteredExpenses.map((e) => ({
									...e,
									kind: "expense"
								}))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-elevated",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 text-muted-foreground",
											children: formatDate(t.date)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `text-xs px-2 py-1 rounded-full ${t.kind === "income" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`,
												children: t.kind === "income" ? "Earned" : "Spent"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 truncate max-w-[200px]",
											children: t.description ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 text-muted-foreground",
											children: t.kind === "income" ? t.clients?.name ?? "—" : t.expense_categories?.name ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: `py-3 text-right font-medium ${t.kind === "income" ? "text-primary" : ""}`,
											children: [t.kind === "income" ? "+" : "−", formatMoney(t.amount, t.currency ?? currency)]
										})
									]
								}, `${t.kind}-${t.id}`)), filteredIncome.length === 0 && filteredExpenses.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 5,
									className: "py-8 text-center text-muted-foreground",
									children: "No transactions in this period"
								}) })]
							})]
						})
					})
				]
			})
		]
	});
}
//#endregion
export { ReportsPage as component };
