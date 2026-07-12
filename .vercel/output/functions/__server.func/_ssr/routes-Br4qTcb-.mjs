import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { B as ChartLine, O as FileText, S as LayoutGrid, U as ArrowRight, h as Receipt, l as Target, n as Wallet, r as Users } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as useScroll, r as motion, t as useTransform } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Br4qTcb-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Landing() {
	const { scrollY } = useScroll();
	const [isScrolled, setIsScrolled] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		return scrollY.on("change", (latest) => {
			setIsScrolled(latest > 40);
		});
	}, [scrollY]);
	useTransform(scrollY, [0, 50], ["100%", "800px"]);
	useTransform(scrollY, [0, 50], ["rgba(var(--background-rgb), 0.7)", "rgba(var(--background-rgb), 0.55)"]);
	useTransform(scrollY, [0, 50], ["0px", "9999px"]);
	const navY = useTransform(scrollY, [0, 50], ["0px", "12px"]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.header, {
				className: cn("fixed top-0 inset-x-0 z-50 flex justify-center transition-colors duration-500 ease-out", isScrolled ? "px-4" : "px-0"),
				style: { y: navY },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					layout: true,
					transition: {
						duration: .5,
						ease: [
							.32,
							.72,
							0,
							1
						]
					},
					className: cn("flex items-center justify-between", isScrolled ? "bg-background/55 backdrop-blur-2xl border border-hairline rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.45)] px-5 py-2.5 mt-4 w-full max-w-[42rem]" : "bg-background/70 backdrop-blur-xl border border-transparent border-b-hairline px-6 py-4 w-full max-w-none"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 font-display font-semibold text-lg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/favicon.png",
									alt: "Ledgerly",
									className: "h-4 w-4 object-contain"
								})
							}), "Ledgerly"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "hidden md:flex items-center gap-8 text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#features",
									className: "hover:text-foreground transition-colors",
									children: "Features"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#modules",
									className: "hover:text-foreground transition-colors",
									children: "Modules"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#pricing",
									className: "hover:text-foreground transition-colors",
									children: "Pricing"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									className: "hidden sm:inline-flex",
									children: "Sign in"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									className: "glow-emerald",
									children: ["Get started", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 h-4 w-4" })]
								})
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden pt-24 min-h-[90vh] flex flex-col justify-center bg-background z-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 bottom-0 z-0 w-full pointer-events-none select-none flex items-end",
						style: {
							maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
							WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/bg-gradient.png",
							alt: "",
							className: "w-full h-auto object-cover opacity-90",
							draggable: false
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 z-0 opacity-[0.03] pointer-events-none",
						style: {
							backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
							backgroundRepeat: "repeat",
							backgroundSize: "256px 256px"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32 text-center w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 20
								},
								animate: {
									opacity: 1,
									y: 0
								},
								transition: {
									duration: .5,
									ease: "easeOut"
								},
								className: "inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs text-muted-foreground mb-8 hover:border-primary/30 transition-colors cursor-default",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-primary animate-pulse" }), "Now with multi-planner workspaces"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.h1, {
								initial: {
									opacity: 0,
									y: 20
								},
								animate: {
									opacity: 1,
									y: 0
								},
								transition: {
									duration: .6,
									delay: .1,
									ease: "easeOut"
								},
								className: "text-5xl md:text-7xl font-display tracking-tight leading-[1.02] max-w-4xl mx-auto",
								children: [
									"The financial ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-primary",
										children: "operating system"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"built for entrepreneurs."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
								initial: {
									opacity: 0,
									y: 20
								},
								animate: {
									opacity: 1,
									y: 0
								},
								transition: {
									duration: .6,
									delay: .2,
									ease: "easeOut"
								},
								className: "mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed",
								children: "Manage income, expenses, invoices, clients, and cash flow across unlimited planners. Feels like Notion. Powered like a spreadsheet."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									scale: .95
								},
								animate: {
									opacity: 1,
									scale: 1
								},
								transition: {
									duration: .5,
									delay: .3,
									ease: "easeOut"
								},
								className: "mt-10 flex flex-wrap gap-3 justify-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "lg",
										className: "h-12 px-6 glow-emerald hover:scale-105 hover:bg-primary/90 transition-all duration-300",
										children: ["Open your workspace", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4" })]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#features",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "lg",
										variant: "outline",
										className: "h-12 px-6 border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-300",
										children: "Explore features"
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 40
								},
								animate: {
									opacity: 1,
									y: 0
								},
								transition: {
									duration: .8,
									delay: .4,
									ease: "easeOut"
								},
								className: "mt-20 relative group max-w-5xl mx-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -inset-4 rounded-3xl bg-primary/10 blur-[80px] -z-10 group-hover:bg-primary/20 transition-all duration-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-white/10 bg-background/20 backdrop-blur-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 will-change-transform",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/10 to-transparent" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid grid-cols-4 gap-3 mb-4 relative z-10",
											children: [
												{
													label: "Total Income",
													value: "$48,240",
													tone: "text-primary"
												},
												{
													label: "Total Expenses",
													value: "$12,910",
													tone: "text-foreground"
												},
												{
													label: "Net Cash Flow",
													value: "$35,330",
													tone: "text-primary"
												},
												{
													label: "Balance",
													value: "$81,450",
													tone: "text-foreground"
												}
											].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-xl bg-card/40 border border-white/5 p-4 text-left hover:bg-card/60 transition-colors backdrop-blur-md",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground uppercase tracking-wider",
													children: k.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: `mt-2 text-2xl font-display font-medium ${k.tone}`,
													children: k.value
												})]
											}, k.label))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl bg-card/30 border border-white/5 h-64 flex items-end justify-between px-6 pb-6 gap-2 relative overflow-hidden backdrop-blur-md z-10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "absolute inset-0 flex flex-col justify-between py-6 px-6 pointer-events-none",
												children: [
													0,
													1,
													2,
													3
												].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-b border-white/5" }, i))
											}), [
												35,
												55,
												42,
												68,
												51,
												78,
												65,
												90,
												72,
												85,
												92,
												78
											].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
												initial: { height: 0 },
												animate: { height: `${h}%` },
												transition: {
													duration: .8,
													delay: .5 + i * .05,
													ease: "easeOut"
												},
												className: "flex-1 rounded-t-lg relative overflow-hidden group-hover:bg-primary/90 bg-primary/70 transition-colors duration-500",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-lg" })
											}, i))]
										})
									]
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-[#030b0c] relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-background to-transparent pointer-events-none" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "features",
						className: "py-28 relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-7xl mx-auto px-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 20
								},
								whileInView: {
									opacity: 1,
									y: 0
								},
								viewport: {
									once: true,
									margin: "-100px"
								},
								transition: {
									duration: .6,
									ease: "easeOut"
								},
								className: "text-center max-w-2xl mx-auto mb-16",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-4xl font-display tracking-tight",
									children: "Everything you track. In one calm place."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-muted-foreground leading-relaxed",
									children: "Spreadsheet flexibility, dashboard clarity, and vault-level file organization — without the mess."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid md:grid-cols-3 gap-4",
								children: [
									{
										icon: LayoutGrid,
										title: "Multi-planner workspace",
										desc: "Separate books for personal, agency, side project. Zero data crossover."
									},
									{
										icon: ChartLine,
										title: "Live cash flow",
										desc: "Daily, weekly, monthly, yearly cuts of income vs expenses."
									},
									{
										icon: Wallet,
										title: "Multiple accounts",
										desc: "Bank, wallet, cash — transfers don't count as income or expense."
									},
									{
										icon: Users,
										title: "Client CRM",
										desc: "Revenue, invoices, and outstanding per client, computed automatically."
									},
									{
										icon: Receipt,
										title: "Invoice & receipt vault",
										desc: "Attach PDFs and screenshots. Link them to income and expense rows."
									},
									{
										icon: Target,
										title: "Goals & budgets",
										desc: "Track savings goals and monthly budgets with live progress."
									}
								].map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									initial: {
										opacity: 0,
										y: 20
									},
									whileInView: {
										opacity: 1,
										y: 0
									},
									viewport: {
										once: true,
										margin: "-50px"
									},
									transition: {
										duration: .5,
										delay: i * .1,
										ease: "easeOut"
									},
									className: "rounded-2xl border border-hairline bg-card/10 backdrop-blur-sm p-6 hover:bg-card/40 hover:border-primary/15 hover:shadow-[0_0_30px_-10px_oklch(0.82_0.17_160_/_0.15)] hover:-translate-y-1 transition-all duration-300 group",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "h-5 w-5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-display text-lg font-medium text-foreground/90 group-hover:text-foreground transition-colors",
											children: f.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm text-muted-foreground leading-relaxed",
											children: f.desc
										})
									]
								}, f.title))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "modules",
						className: "py-28 border-t border-hairline overflow-hidden relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-w-7xl mx-auto px-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid lg:grid-cols-2 gap-16 items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									initial: {
										opacity: 0,
										x: -30
									},
									whileInView: {
										opacity: 1,
										x: 0
									},
									viewport: {
										once: true,
										margin: "-100px"
									},
									transition: {
										duration: .7,
										ease: "easeOut"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "text-4xl font-display tracking-tight",
											children: "Built for how you actually work."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-4 text-muted-foreground leading-relaxed",
											children: "Every module speaks to the next. Add income → invoice → payment proof → account balance updates → cash flow reflects it → dashboard refreshes."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-6 space-y-3 text-sm",
											children: [
												"Editable spreadsheet-style tables",
												"Inline autosave",
												"Sticky headers, keyboard navigation",
												"Custom columns & categories",
												"Drag-and-drop file uploads"
											].map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
												initial: {
													opacity: 0,
													x: -10
												},
												whileInView: {
													opacity: 1,
													x: 0
												},
												viewport: { once: true },
												transition: {
													duration: .4,
													delay: .2 + i * .1
												},
												className: "flex items-center gap-3 text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-primary shrink-0" }),
													" ",
													x
												]
											}, x))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-8",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/auth",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "lg",
													className: "glow-emerald hover:scale-105 transition-transform duration-300",
													children: ["Try it free", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" })]
												})
											})
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									initial: {
										opacity: 0,
										x: 30,
										scale: .95
									},
									whileInView: {
										opacity: 1,
										x: 0,
										scale: 1
									},
									viewport: {
										once: true,
										margin: "-100px"
									},
									transition: {
										duration: .7,
										ease: "easeOut"
									},
									className: "rounded-2xl border border-hairline bg-card/20 backdrop-blur-md overflow-hidden shadow-2xl group hover:border-primary/15 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-500",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "border-b border-hairline px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground bg-card/40 backdrop-blur-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5 text-primary/70" }), " income.planner"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-5 border-b border-hairline text-muted-foreground py-2.5 px-4 uppercase tracking-wider text-[10px] font-medium bg-background/20",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Date" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Client" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Description" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Amount" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Status" })
											]
										}), [
											[
												"Nov 12",
												"Nova Studio",
												"Website redesign",
												"$4,500",
												"Paid"
											],
											[
												"Nov 08",
												"Aurora Labs",
												"SEO retainer",
												"$1,800",
												"Advance"
											],
											[
												"Nov 03",
												"Kite & Co",
												"Landing page",
												"$2,200",
												"Partial"
											],
											[
												"Oct 28",
												"Meridian",
												"Brand system",
												"$6,900",
												"Paid"
											]
										].map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-5 border-b border-hairline py-3 px-4 hover:bg-white/5 transition-colors cursor-pointer",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-muted-foreground",
													children: r[0]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-foreground/90",
													children: r[1]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-muted-foreground",
													children: r[2]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-medium text-primary",
													children: r[3]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "rounded-md bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-medium",
													children: r[4]
												}) })
											]
										}, i))]
									})]
								})]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "pricing",
						className: "pt-32 pb-24 relative overflow-hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-x-0 top-0 z-0 w-full pointer-events-none select-none flex items-start",
								style: {
									maskImage: "linear-gradient(to top, black 50%, transparent 100%)",
									WebkitMaskImage: "linear-gradient(to top, black 50%, transparent 100%)"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/bg-gradient.png",
									alt: "",
									className: "w-full h-auto object-cover opacity-90 rotate-180",
									draggable: false
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#030b0c] to-transparent z-0 pointer-events-none" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 20
								},
								whileInView: {
									opacity: 1,
									y: 0
								},
								viewport: {
									once: true,
									margin: "-100px"
								},
								transition: {
									duration: .6,
									ease: "easeOut"
								},
								className: "relative z-10 max-w-4xl mx-auto px-6 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "text-4xl md:text-6xl font-display tracking-tight leading-tight drop-shadow-md",
										children: [
											"Start with your ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-primary font-medium",
												children: "first planner"
											}),
											"."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-6 text-foreground/90 font-medium text-lg max-w-xl mx-auto leading-relaxed drop-shadow-md",
										children: "Join entrepreneurs and agencies who have brought calm and clarity to their finances. Free while in preview. No credit card required."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
										initial: {
											opacity: 0,
											scale: .95
										},
										whileInView: {
											opacity: 1,
											scale: 1
										},
										viewport: { once: true },
										transition: {
											duration: .5,
											delay: .2
										},
										className: "mt-10 flex flex-col sm:flex-row justify-center items-center gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/auth",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "lg",
												className: "h-14 px-8 text-base glow-emerald hover:scale-105 hover:bg-primary/90 transition-all duration-300",
												children: ["Create your workspace", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4" })]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex -space-x-2",
											children: [[...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-10 h-10 rounded-full border-2 border-[#030b0c] bg-card/50 backdrop-blur flex items-center justify-center relative overflow-hidden",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: `https://i.pravatar.cc/100?img=${i + 10}`,
													alt: "",
													className: "w-full h-full object-cover opacity-80 mix-blend-luminosity"
												})
											}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-10 h-10 rounded-full border-2 border-[#030b0c] bg-elevated flex items-center justify-center text-[10px] font-medium text-muted-foreground",
												children: "+1k"
											})]
										})]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "pt-24 pb-8 text-sm text-muted-foreground relative z-10 overflow-hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 relative z-10 mb-24",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-6",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 text-2xl font-display font-semibold text-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: "/favicon.png",
													alt: "Ledgerly",
													className: "h-5 w-5 object-contain"
												})
											}), "Ledgerly"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "max-w-md text-base leading-relaxed text-muted-foreground/80",
											children: "The financial operating system built for freelancers, agencies, and entrepreneurs. A calm space for your money."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex gap-4 pt-2",
											children: [
												"Twitter",
												"GitHub",
												"Discord"
											].map((platform) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: "#",
												className: "text-muted-foreground/60 hover:text-primary transition-colors",
												children: platform
											}, platform))
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 sm:grid-cols-3 gap-8",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-display font-medium text-foreground mb-4 text-base",
											children: "Product"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "space-y-3",
											children: [
												"Features",
												"Pricing",
												"Modules",
												"Changelog"
											].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: `#${item.toLowerCase()}`,
												className: "hover:text-primary transition-colors",
												children: item
											}) }, item))
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-display font-medium text-foreground mb-4 text-base",
											children: "Resources"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "space-y-3",
											children: [
												"Documentation",
												"Tutorials",
												"Blog",
												"Support"
											].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: "#",
												className: "hover:text-primary transition-colors",
												children: item
											}) }, item))
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-display font-medium text-foreground mb-4 text-base",
											children: "Company"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "space-y-3",
											children: [
												"About",
												"Careers",
												"Terms",
												"Privacy"
											].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: "#",
												className: "hover:text-primary transition-colors",
												children: item
											}) }, item))
										})] })
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full overflow-hidden flex justify-center items-center opacity-40 select-none pointer-events-none mt-20 mb-12",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-[16vw] font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-muted-foreground/30 to-transparent leading-none tracking-tighter mix-blend-plus-lighter",
									children: "Ledgerly"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-w-7xl mx-auto px-6 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-4 text-xs pt-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									"© ",
									(/* @__PURE__ */ new Date()).getFullYear(),
									" Ledgerly. All rights reserved."
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-6",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: "#",
											className: "hover:text-primary transition-colors",
											children: "Privacy Policy"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: "#",
											className: "hover:text-primary transition-colors",
											children: "Terms of Service"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: "#",
											className: "hover:text-primary transition-colors",
											children: "Cookies Settings"
										})
									]
								})]
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
export { Landing as component };
