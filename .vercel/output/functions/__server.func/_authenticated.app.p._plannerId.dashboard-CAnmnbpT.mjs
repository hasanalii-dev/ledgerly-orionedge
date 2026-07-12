import { c as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { E as Flame, G as Activity, H as Calendar, N as Clock, _ as PiggyBank, d as Sparkles, f as ShieldCheck, j as Crown, n as Wallet, o as TrendingUp, s as TrendingDown } from "./_libs/lucide-react.mjs";
import { c as formatDate, l as formatMoney } from "./_ssr/format-Baza-Edg.mjs";
import { t as useQuery } from "./_libs/tanstack__react-query.mjs";
import { a as YAxis, c as Line, d as Pie, f as Cell, i as LineChart, l as CartesianGrid, m as Tooltip, n as PieChart, o as XAxis, p as ResponsiveContainer } from "./_libs/recharts+[...].mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.dashboard-BMBjnAHf.mjs";
import { a as startOfYear, c as endOfMonth, i as format, n as subMonths, s as startOfMonth } from "./_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.dashboard-CAnmnbpT.js
var import_jsx_runtime = require_jsx_runtime();
function KpiCard({ icon: Icon, label, value, compactValue, sub, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-2xl border p-5 ${accent ? "border-primary/30 bg-card glow-emerald" : "border-hairline bg-card"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-4 w-4 ${accent ? "text-primary" : ""}` })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `mt-3 text-3xl font-display tracking-tight truncate ${accent ? "text-primary" : ""}`,
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
function Dashboard() {
	const { plannerId } = Route.useParams();
	const { data: planner } = useQuery({
		queryKey: ["planner", plannerId],
		queryFn: async () => (await supabase.from("planners").select("*").eq("id", plannerId).single()).data
	});
	const currency = planner?.currency ?? "USD";
	const { data: income = [] } = useQuery({
		queryKey: ["income", plannerId],
		queryFn: async () => (await supabase.from("income_entries").select("*, clients(name)").eq("planner_id", plannerId).order("date", { ascending: false })).data ?? []
	});
	const { data: expenses = [] } = useQuery({
		queryKey: ["expenses", plannerId],
		queryFn: async () => (await supabase.from("expense_entries").select("*, expense_categories(name, color)").eq("planner_id", plannerId).order("date", { ascending: false })).data ?? []
	});
	const { data: accounts = [] } = useQuery({
		queryKey: ["accounts", plannerId],
		queryFn: async () => (await supabase.from("accounts").select("*").eq("planner_id", plannerId)).data ?? []
	});
	const { data: invoices = [] } = useQuery({
		queryKey: ["invoices", plannerId],
		queryFn: async () => (await supabase.from("invoices").select("*").eq("planner_id", plannerId)).data ?? []
	});
	const { data: activity = [] } = useQuery({
		queryKey: ["activity", plannerId],
		queryFn: async () => (await supabase.from("activity_events").select("*").eq("planner_id", plannerId).order("created_at", { ascending: false }).limit(8)).data ?? []
	});
	const totalIncome = income.reduce((s, r) => s + Number(r.amount || 0), 0);
	const totalExpenses = expenses.reduce((s, r) => s + Number(r.amount || 0), 0);
	const net = totalIncome - totalExpenses;
	const balance = accounts.reduce((s, a) => s + Number(a.opening_balance || 0), 0) + net;
	const yearStart = startOfYear(/* @__PURE__ */ new Date());
	subMonths(/* @__PURE__ */ new Date(), 5);
	const monthsSinceYear = Math.max(1, (/* @__PURE__ */ new Date()).getMonth() + 1);
	const yearIncome = income.filter((i) => new Date(i.date) >= yearStart).reduce((s, r) => s + Number(r.amount || 0), 0);
	const avgMonthlyIncome = yearIncome / monthsSinceYear;
	const thisMonthStart = startOfMonth(/* @__PURE__ */ new Date());
	const thisMonthEnd = endOfMonth(/* @__PURE__ */ new Date());
	const monthProfit = income.filter((i) => new Date(i.date) >= thisMonthStart && new Date(i.date) <= thisMonthEnd).reduce((s, r) => s + Number(r.amount || 0), 0) - expenses.filter((i) => new Date(i.date) >= thisMonthStart && new Date(i.date) <= thisMonthEnd).reduce((s, r) => s + Number(r.amount || 0), 0);
	const clientTotals = {};
	income.forEach((i) => {
		const key = i.clients?.name ?? "Unassigned";
		clientTotals[key] = (clientTotals[key] ?? 0) + Number(i.amount || 0);
	});
	const biggestClient = Object.entries(clientTotals).sort((a, b) => b[1] - a[1])[0];
	const catTotals = {};
	expenses.forEach((e) => {
		const key = e.expense_categories?.name ?? "Uncategorized";
		catTotals[key] = (catTotals[key] ?? 0) + Number(e.amount || 0);
	});
	const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
	const pendingInvoiceCount = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").length;
	const cashflow = [];
	for (let i = 0; i < 6; i++) {
		const d = subMonths(/* @__PURE__ */ new Date(), 5 - i);
		const start = startOfMonth(d), end = endOfMonth(d);
		const inc = income.filter((x) => new Date(x.date) >= start && new Date(x.date) <= end).reduce((s, r) => s + Number(r.amount || 0), 0);
		const exp = expenses.filter((x) => new Date(x.date) >= start && new Date(x.date) <= end).reduce((s, r) => s + Number(r.amount || 0), 0);
		cashflow.push({
			month: format(d, "MMM"),
			income: inc,
			expense: exp,
			net: inc - exp
		});
	}
	const pieColors = [
		"#3DDC97",
		"#7CC4FF",
		"#FFB86B",
		"#B794F4",
		"#F687B3",
		"#68D391",
		"#F6AD55",
		"#9F7AEA"
	];
	const expensePie = Object.entries(catTotals).slice(0, 8).map(([name, value]) => ({
		name,
		value
	}));
	const recentTx = [...income.map((i) => ({
		...i,
		kind: "income"
	})), ...expenses.map((e) => ({
		...e,
		kind: "expense"
	}))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-[1600px] mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-baseline justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-display tracking-tight",
					children: "Dashboard"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: ["Snapshot of ", planner?.name ?? "your planner"]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: TrendingUp,
						label: "Total Income",
						value: formatMoney(totalIncome, currency),
						compactValue: formatMoney(totalIncome, currency, true),
						accent: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: TrendingDown,
						label: "Total Expenses",
						value: formatMoney(totalExpenses, currency),
						compactValue: formatMoney(totalExpenses, currency, true)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: Sparkles,
						label: "Net Cash Flow",
						value: formatMoney(net, currency),
						compactValue: formatMoney(net, currency, true),
						sub: net >= 0 ? "In the green" : "In the red"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: Wallet,
						label: "Current Balance",
						value: formatMoney(balance, currency),
						compactValue: formatMoney(balance, currency, true)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: PiggyBank,
						label: "This Month Profit",
						value: formatMoney(monthProfit, currency),
						compactValue: formatMoney(monthProfit, currency, true)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: Calendar,
						label: "Avg Monthly Income",
						value: formatMoney(avgMonthlyIncome, currency),
						compactValue: formatMoney(avgMonthlyIncome, currency, true)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: ShieldCheck,
						label: "Tax Reserve (est. 25%)",
						value: formatMoney(yearIncome * .25, currency),
						compactValue: formatMoney(yearIncome * .25, currency, true)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: Flame,
						label: "Pending Invoices",
						value: String(pendingInvoiceCount)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-3 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 rounded-2xl border border-hairline bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-between mb-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg",
							children: "Cash flow · Last 6 months"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Income vs expenses"
						})] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: cashflow,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "oklch(1 0 0 / 0.06)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "month",
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "income",
									stroke: "#3DDC97",
									strokeWidth: 2.5,
									dot: { r: 3 }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "expense",
									stroke: "#F56565",
									strokeWidth: 2.5,
									dot: { r: 3 }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "net",
									stroke: "#7CC4FF",
									strokeWidth: 2,
									strokeDasharray: "4 4",
									dot: { r: 2 }
								})
							]
						}) })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-hairline bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg mb-1",
							children: "Expense breakdown"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mb-4",
							children: "By category"
						}),
						expensePie.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-64 flex items-center justify-center text-sm text-muted-foreground",
							children: "No expenses yet"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-64",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: expensePie,
								dataKey: "value",
								nameKey: "name",
								innerRadius: 50,
								outerRadius: 90,
								paddingAngle: 2,
								children: expensePie.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: pieColors[i % pieColors.length] }, i))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								formatter: (val) => formatMoney(val, currency),
								contentStyle: {
									background: "oklch(0.22 0.008 155)",
									border: "1px solid oklch(1 0 0 / 0.08)",
									borderRadius: 12,
									color: "white"
								},
								itemStyle: { color: "white" }
							})] }) })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid md:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-hairline bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-3.5 w-3.5" }), " Biggest client"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 text-xl font-display truncate",
								children: biggestClient?.[0] ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-sm text-primary",
								children: biggestClient ? formatMoney(biggestClient[1], currency) : "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-hairline bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "h-3.5 w-3.5" }), " Highest expense"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 text-xl font-display truncate",
								children: topCat?.[0] ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-sm text-primary",
								children: topCat ? formatMoney(topCat[1], currency) : "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-hairline bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" }), " Accounts"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 text-xl font-display",
								children: accounts.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [formatMoney(balance, currency), " across all"]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-hairline bg-card overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-4 border-b border-hairline flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display",
							children: "Recent transactions"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "divide-y divide-hairline",
						children: [recentTx.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-6 text-sm text-muted-foreground text-center",
							children: "No transactions yet"
						}), recentTx.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-3 flex items-center justify-between hover:bg-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `h-8 w-8 rounded-lg flex items-center justify-center ${t.kind === "income" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`,
									children: t.kind === "income" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium truncate",
									children: t.description ?? (t.kind === "income" ? "Income" : "Expense")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: formatDate(t.date)
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-sm font-medium ${t.kind === "income" ? "text-primary" : "text-foreground"}`,
								children: [t.kind === "income" ? "+" : "−", formatMoney(t.amount, t.currency)]
							})]
						}, `${t.kind}-${t.id}`))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-hairline bg-card overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-4 border-b border-hairline flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display",
							children: "Recent activity"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "divide-y divide-hairline",
						children: [activity.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-6 text-sm text-muted-foreground text-center",
							children: "Nothing yet"
						}), activity.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm truncate",
								children: a.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [
									a.subtitle,
									" · ",
									formatDate(a.created_at)
								]
							})]
						}, a.id))]
					})]
				})]
			})
		]
	});
}
//#endregion
export { Dashboard as component };
