import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { M as Flame, R as Crown, V as Clock, X as Calendar, at as Activity, c as TrendingDown, f as Sparkles, n as Wallet, p as ShieldCheck, s as TrendingUp, v as PiggyBank } from "./_libs/lucide-react.mjs";
import { c as formatDate, l as formatMoney } from "./_ssr/format-Baza-Edg.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./_ssr/avatar-gunzrkKA.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { a as YAxis, c as Line, d as Pie, f as Cell, i as LineChart, l as CartesianGrid, m as Tooltip, n as PieChart, o as XAxis, p as ResponsiveContainer } from "./_libs/recharts+[...].mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.dashboard-CNLa04vv.mjs";
import { a as startOfYear, c as endOfMonth, i as format, n as subMonths, s as startOfMonth } from "./_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.dashboard-DK_Hjqyo.js
var import_jsx_runtime = require_jsx_runtime();
function KpiCard({ icon: Icon, label, value, compactValue, sub, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${accent ? "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 shadow-[0_0_30px_-10px_oklch(0.82_0.17_160_/_0.2)]" : "border-white/5 bg-card/40 backdrop-blur-xl hover:bg-card/60 hover:border-white/10"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-[11px] font-medium text-muted-foreground relative z-10 uppercase tracking-wider",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `p-2 rounded-xl ${accent ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground group-hover:bg-white/10 group-hover:text-foreground"} transition-colors`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `mt-4 text-3xl font-display font-medium tracking-tight truncate relative z-10 ${accent ? "text-primary drop-shadow-sm" : "text-foreground"}`,
				title: value,
				children: compactValue || value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 text-xs text-muted-foreground relative z-10 flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-3 w-3" }),
					" ",
					sub
				]
			}),
			accent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" })
		]
	});
}
function DashboardPage() {
	const { plannerId } = Route.useParams();
	const { data: planner } = useQuery({
		queryKey: ["planner", plannerId],
		queryFn: async () => (await supabase.from("planners").select("*").eq("id", plannerId).single()).data
	});
	const currency = planner?.currency ?? "USD";
	const { data: profile } = useQuery({
		queryKey: ["profile"],
		queryFn: async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return null;
			return (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data;
		}
	});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative min-h-[calc(100vh-4rem)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 space-y-6 max-w-[1600px] mx-auto pb-20 pt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "order-2 md:order-1 text-center md:text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-3xl font-display tracking-tight",
							children: ["Welcome back, ", profile?.display_name?.split(" ")[0] || "there"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground mt-1",
							children: ["Snapshot of ", planner?.name ?? "your planner"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
						className: "h-12 w-12 border-2 border-white/10 ring-2 ring-primary/20 shadow-lg order-1 md:order-2 self-center md:self-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: profile?.avatar_url }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: "bg-primary/20 text-primary text-lg font-medium",
							children: (profile?.display_name || "U").charAt(0).toUpperCase()
						})]
					})]
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
						className: "lg:col-span-2 rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 hover:bg-card/60 transition-colors duration-300 shadow-sm",
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
						className: "rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 hover:bg-card/60 transition-colors duration-300 shadow-sm",
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
							className: "rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 hover:bg-card/60 transition-colors duration-300 group",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "p-1.5 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-3.5 w-3.5" })
									}), " Biggest client"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 text-xl font-display font-medium truncate",
									children: biggestClient?.[0] ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-sm text-primary",
									children: biggestClient ? formatMoney(biggestClient[1], currency) : "—"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 hover:bg-card/60 transition-colors duration-300 group",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "p-1.5 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "h-3.5 w-3.5" })
									}), " Highest expense"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 text-xl font-display font-medium truncate",
									children: topCat?.[0] ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-sm text-primary",
									children: topCat ? formatMoney(topCat[1], currency) : "—"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 hover:bg-card/60 transition-colors duration-300 group",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "p-1.5 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" })
									}), " Accounts"]
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
							}), recentTx.map((t, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
							}, `${t.kind}-${t.id || index}`))]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 hover:bg-card/60 transition-colors duration-300 shadow-sm overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display",
								children: "Recent activity"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [activity.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-6 text-sm text-muted-foreground text-center",
								children: "Nothing yet"
							}), activity.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-3 py-2 -mx-2 flex items-start gap-3 hover:bg-white/5 rounded-xl transition-colors group/item",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2 rounded-xl bg-white/5 group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm truncate text-foreground/90 group-hover/item:text-foreground",
										children: a.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground truncate flex items-center gap-2 mt-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
											" ",
											formatDate(a.created_at)
										]
									})]
								})]
							}, a.id))]
						})]
					})]
				})
			]
		})
	});
}
//#endregion
export { DashboardPage as component };
