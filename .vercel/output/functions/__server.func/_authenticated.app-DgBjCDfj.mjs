import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { b as useRouter, l as useLocation, p as Outlet } from "./_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { t as Button } from "./_ssr/button-BkEeRci-.mjs";
import { t as Input } from "./_ssr/input-B8Q2ztVi.mjs";
import { $ as Briefcase, T as Lightbulb, Z as Building2, i as User, k as Globe, nt as ArrowRight, rt as ArrowLeft, w as LoaderCircle } from "./_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CYB-gyWu.mjs";
import { n as CURRENCIES } from "./_ssr/format-Baza-Edg.mjs";
import { n as AnimatePresence, t as motion } from "./_libs/framer-motion.mjs";
import { n as toast } from "./_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app-DgBjCDfj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COUNTRIES = [
	"United States",
	"United Kingdom",
	"Canada",
	"Australia",
	"Germany",
	"France",
	"India",
	"Pakistan",
	"Singapore",
	"United Arab Emirates",
	"Other"
];
var SOURCES = [
	"Google Search",
	"Instagram",
	"Referral",
	"LinkedIn",
	"AI (ChatGPT, Gemini, etc.)",
	"YouTube",
	"Other"
];
function AppLayout() {
	const pathname = useLocation().pathname;
	if (pathname === "/app" || pathname === "/app/") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingWizard, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
}
function OnboardingWizard() {
	const router = useRouter();
	const [step, setStep] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [country, setCountry] = (0, import_react.useState)("");
	const [purpose, setPurpose] = (0, import_react.useState)("");
	const [companyName, setCompanyName] = (0, import_react.useState)("");
	const [website, setWebsite] = (0, import_react.useState)("");
	const [source, setSource] = (0, import_react.useState)("");
	const [plannerName, setPlannerName] = (0, import_react.useState)("");
	const [currency, setCurrency] = (0, import_react.useState)("USD");
	const handleFinish = async () => {
		try {
			if (!plannerName.trim()) {
				toast.error("Please enter a planner name");
				return;
			}
			setLoading(true);
			const { data: user } = await supabase.auth.getUser();
			if (!user.user) throw new Error("Authentication error");
			const { error: profileError } = await supabase.from("profiles").update({
				country,
				purpose,
				company_name: companyName,
				website,
				source
			}).eq("id", user.user.id);
			if (profileError) console.error("Failed to save profile details:", profileError);
			const { error } = await supabase.from("planners").insert({
				user_id: user.user.id,
				name: plannerName.trim(),
				currency,
				is_default: true
			});
			if (error) throw error;
			toast.success("Planner created successfully!");
			await router.invalidate();
		} catch (err) {
			toast.error(err.message);
			setLoading(false);
		}
	};
	const nextStep = () => {
		if (step === 0) {
			if (!country.trim()) return toast.error("Please enter your country");
			if (!purpose) return toast.error("Please select a purpose");
			if (purpose === "personal") setStep(2);
			else setStep(1);
		} else if (step === 1) {
			if (!companyName.trim()) return toast.error("Please enter your business name");
			setStep(2);
		} else if (step === 2) setStep(3);
	};
	const prevStep = () => {
		if (step === 2 && purpose === "personal") setStep(0);
		else setStep(step - 1);
	};
	const containerVariants = {
		hidden: {
			opacity: 0,
			x: 20
		},
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				duration: .4,
				ease: [
					.22,
					1,
					.36,
					1
				]
			}
		},
		exit: {
			opacity: 0,
			x: -20,
			transition: {
				duration: .3,
				ease: [
					.22,
					1,
					.36,
					1
				]
			}
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen w-full flex items-center justify-center bg-[#020505] relative overflow-hidden text-foreground p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[url('/bg-gradient.png')] bg-cover opacity-10 mix-blend-screen pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full max-w-[480px] rounded-[32px] p-[1px] shadow-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-tr from-white/5 via-white/5 to-emerald-400/50 rounded-[32px]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full bg-[#050a0a]/95 backdrop-blur-2xl rounded-[31px] p-8 sm:p-10 flex flex-col shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]",
					children: [
						step > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "absolute top-6 left-6 h-8 w-8 rounded-full text-muted-foreground hover:bg-white/5 hover:text-white transition-colors",
							onClick: prevStep,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-8 text-center mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "inline-flex h-12 w-12 bg-[#0b1414] rounded-xl items-center justify-center border border-white/5 mb-6",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: "/favicon.png",
										alt: "Lumen",
										className: "h-6 w-6 object-contain"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-2xl font-display font-medium text-white tracking-tight",
									children: "Welcome to Lumen"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground text-sm mt-2",
									children: "Let's set up your workspace"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-center items-center mb-8",
								children: (purpose === "personal" ? [
									0,
									2,
									3
								] : [
									0,
									1,
									2,
									3
								]).map((s, i, arr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${step === s ? "bg-emerald-500 text-[#030808] shadow-[0_0_15px_rgba(16,185,129,0.4)]" : step > s ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/40"}`,
										children: step > s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
											className: "w-4 h-4",
											fill: "none",
											viewBox: "0 0 24 24",
											stroke: "currentColor",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												strokeWidth: 2,
												d: "M5 13l4 4L19 7"
											})
										}) : i + 1
									}), i < arr.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `w-8 sm:w-12 h-[2px] transition-all duration-500 mx-2 rounded-full ${step > s ? "bg-emerald-500/50" : "bg-white/5"}` })]
								}, s))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatePresence, {
								mode: "wait",
								children: [
									step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
										variants: containerVariants,
										initial: "hidden",
										animate: "visible",
										exit: "exit",
										className: "space-y-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-sm font-medium text-white/80 pl-1",
													children: "Where are you located?"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 z-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: country,
														onValueChange: setCountry,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-14 bg-[#030606] border-white/5 text-white focus:ring-emerald-500/30 rounded-2xl pl-11 pr-4 text-sm transition-all w-full",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a country" })
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
															className: "bg-[#050a0a] border-white/10 text-white rounded-xl shadow-2xl w-[var(--radix-select-trigger-width)] max-h-[300px]",
															children: COUNTRIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: c,
																className: "focus:bg-white/5 focus:text-emerald-400 cursor-pointer",
																children: c
															}, c))
														})]
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-sm font-medium text-white/80 pl-1",
													children: "How will you use Lumen?"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														onClick: () => setPurpose("personal"),
														className: `h-24 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${purpose === "personal" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-[#030606] border-white/5 text-muted-foreground hover:border-white/20 hover:text-white"}`,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-6 w-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-sm font-medium",
															children: "Personal"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														onClick: () => setPurpose("business"),
														className: `h-24 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${purpose === "business" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-[#030606] border-white/5 text-muted-foreground hover:border-white/20 hover:text-white"}`,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-6 w-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-sm font-medium",
															children: "Business"
														})]
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												className: "w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group",
												onClick: nextStep,
												children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" })]
											})
										]
									}, "step-0"),
									step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
										variants: containerVariants,
										initial: "hidden",
										animate: "visible",
										exit: "exit",
										className: "space-y-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-sm font-medium text-white/80 pl-1",
													children: "Business Name"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "text",
														placeholder: "e.g. Acme Corp",
														value: companyName,
														onChange: (e) => setCompanyName(e.target.value),
														className: "h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl pl-11 pr-4 text-sm transition-all",
														autoFocus: true
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "text-sm font-medium text-white/80 pl-1",
													children: ["Website ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground/50 font-normal",
														children: "(Optional)"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "text",
														placeholder: "e.g. acme.com",
														value: website,
														onChange: (e) => setWebsite(e.target.value),
														className: "h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl pl-11 pr-4 text-sm transition-all"
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												className: "w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group",
												onClick: nextStep,
												children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" })]
											})
										]
									}, "step-1"),
									step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
										variants: containerVariants,
										initial: "hidden",
										animate: "visible",
										exit: "exit",
										className: "space-y-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "text-sm font-medium text-white/80 pl-1",
													children: ["How did you hear about us? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground/50 font-normal",
														children: "(Optional)"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: source,
													onValueChange: setSource,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-14 bg-[#030606] border-white/5 text-white focus:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all w-full",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select an option" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
														className: "bg-[#050a0a] border-white/10 text-white rounded-xl shadow-2xl w-[var(--radix-select-trigger-width)] max-h-[300px]",
														children: SOURCES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: s,
															className: "focus:bg-white/5 focus:text-emerald-400 cursor-pointer",
															children: s
														}, s))
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-3 text-sm text-emerald-400/90 leading-relaxed mt-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "h-5 w-5 text-emerald-400 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-medium text-emerald-400 mb-1",
														children: "We're in active development"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs mb-3",
														children: "If you encounter any issues or have feedback, please let us know at the links below."
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex gap-4",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
																href: "#",
																className: "text-xs font-semibold text-white hover:text-emerald-300 transition-colors underline decoration-white/20 underline-offset-4",
																children: "Report Issue"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
																href: "#",
																className: "text-xs font-semibold text-white hover:text-emerald-300 transition-colors underline decoration-white/20 underline-offset-4",
																children: "Give Feedback"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
																href: "#",
																className: "text-xs font-semibold text-white hover:text-emerald-300 transition-colors underline decoration-white/20 underline-offset-4",
																children: "Support"
															})
														]
													})
												] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												className: "w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl group",
												onClick: nextStep,
												children: ["Almost Done ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" })]
											})
										]
									}, "step-2"),
									step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
										variants: containerVariants,
										initial: "hidden",
										animate: "visible",
										exit: "exit",
										className: "space-y-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-center mb-6",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-emerald-500/10 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-8 w-8 text-emerald-400 relative z-10" })]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm text-muted-foreground leading-relaxed px-4",
													children: "Let's create your first planner to start tracking your finances."
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-sm font-medium text-white/80 pl-1",
														children: "Planner Name"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "text",
														placeholder: purpose === "business" ? "e.g. Acme Finances" : "e.g. Personal Budget",
														value: plannerName,
														onChange: (e) => setPlannerName(e.target.value),
														className: "h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all",
														onKeyDown: (e) => e.key === "Enter" && handleFinish(),
														autoFocus: true
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-sm font-medium text-white/80 pl-1",
														children: "Primary Currency"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: currency,
														onValueChange: setCurrency,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-14 bg-[#030606] border-white/5 text-white focus:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all w-full",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a currency" })
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
															className: "bg-[#050a0a] border-white/10 text-white rounded-xl shadow-2xl w-[var(--radix-select-trigger-width)] max-h-[300px]",
															children: CURRENCIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: c,
																className: "focus:bg-white/5 focus:text-emerald-400 cursor-pointer",
																children: c
															}, c))
														})]
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												className: "w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group",
												onClick: handleFinish,
												disabled: loading,
												children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin mx-auto" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Create Planner ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" })] })
											})
										]
									}, "step-3")
								]
							})]
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { AppLayout as component };
