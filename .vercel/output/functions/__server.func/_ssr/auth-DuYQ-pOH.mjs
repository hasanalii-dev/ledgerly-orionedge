import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./client-CwRrl1Mu.mjs";
import { d as Sparkles, x as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Checkbox } from "./checkbox-kt6FvQcE.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as stringType } from "../_libs/zod.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DuYQ-pOH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var emailSchema = stringType().email("Enter a valid email");
var passwordSchema = stringType().min(6, "Minimum 6 characters").max(72);
function AuthPage() {
	const navigate = useNavigate();
	const [session, setSession] = (0, import_react.useState)(null);
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [remember, setRemember] = (0, import_react.useState)(true);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [redirecting, setRedirecting] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) {
				setRedirecting(true);
				navigate({
					to: "/app",
					replace: true
				});
			} else setSession(false);
		});
	}, [navigate]);
	if (session === null || redirecting) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" })
	});
	async function handleEmail(e) {
		e.preventDefault();
		setLoading(true);
		try {
			emailSchema.parse(email);
			if (mode !== "forgot") passwordSchema.parse(password);
			if (mode === "signin") {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) throw error;
				toast.success("Signed in");
				setRedirecting(true);
				navigate({
					to: "/app",
					replace: true
				});
			} else if (mode === "signup") {
				const { data, error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						emailRedirectTo: window.location.origin,
						data: { full_name: name || email.split("@")[0] }
					}
				});
				if (error) throw error;
				if (data.session) {
					toast.success("Account created successfully!");
					setRedirecting(true);
					navigate({
						to: "/app",
						replace: true
					});
				} else toast.success("Check your inbox to confirm your email");
			} else {
				const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
				if (error) throw error;
				toast.success("Password reset link sent");
				setMode("signin");
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Something went wrong";
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	}
	async function handleGoogle() {
		setLoading(true);
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: { redirectTo: `${window.location.origin}/app` }
			});
			if (error) throw error;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Google sign-in failed");
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen w-full grid lg:grid-cols-2 bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden lg:flex relative flex-col justify-between p-12 overflow-hidden border-r border-hairline",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 pointer-events-none select-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/bg-gradient.png",
						alt: "",
						className: "w-full h-full object-cover opacity-60"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 opacity-[0.03]",
					style: {
						backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
						backgroundRepeat: "repeat",
						backgroundSize: "256px 256px"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/3 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex items-center gap-2 text-xl font-display font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
					}), "Ledgerly"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-5xl font-display leading-[1.05] tracking-tight",
							children: [
								"Your financial ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-primary",
									children: "operating\xA0system"
								}),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg text-muted-foreground max-w-md leading-relaxed",
							children: "Track income, expenses, invoices, clients, and cash flow across unlimited planners. Built for entrepreneurs and agencies."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-3 max-w-md pt-4",
							children: [
								"Multi-planner workspace",
								"Editable spreadsheet ledgers",
								"Client & project tracking",
								"Invoice & receipt vault"
							].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl border border-hairline bg-card/40 backdrop-blur-sm px-4 py-3 text-sm text-muted-foreground hover:border-primary/20 hover:bg-card/60 transition-all duration-300",
								children: f
							}, f))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "relative text-xs text-muted-foreground",
					children: "© Ledgerly. A calm space for your money."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md space-y-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:hidden flex items-center gap-2 text-lg font-display font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
						}), "Ledgerly"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-3xl font-display tracking-tight",
						children: mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: mode === "signin" ? "Sign in to open your planners." : mode === "signup" ? "Start planning in under a minute." : "We'll email you a reset link."
					})] }),
					mode !== "forgot" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						className: "w-full h-12 border-hairline bg-card hover:bg-accent hover:border-primary/20 transition-all",
						onClick: handleGoogle,
						disabled: loading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							className: "mr-2 h-4 w-4",
							viewBox: "0 0 24 24",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								fill: "#EA4335",
								d: "M12 10.2v3.9h5.4c-.24 1.4-1.68 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.09.79 3.8 1.47l2.6-2.5C16.75 3.7 14.6 2.8 12 2.8 6.9 2.8 2.75 6.95 2.75 12S6.9 21.2 12 21.2c6.9 0 9.4-4.85 9.4-7.35 0-.5-.05-.87-.12-1.25H12z"
							})
						}), "Continue with Google"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-full border-t border-hairline" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative flex justify-center text-xs uppercase tracking-wider",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-background px-3 text-muted-foreground",
								children: "or"
							})
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						value: mode === "forgot" ? "signin" : mode,
						onValueChange: (v) => setMode(v),
						children: [mode !== "forgot" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "grid w-full grid-cols-2 bg-card border border-hairline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signin",
								children: "Sign in"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signup",
								children: "Sign up"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: mode === "forgot" ? "signin" : mode,
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleEmail,
								className: "space-y-4",
								children: [
									mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "name",
											children: "Full name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "name",
											value: name,
											onChange: (e) => setName(e.target.value),
											placeholder: "Alex Rivera",
											className: "h-11 bg-card border-hairline focus:border-primary/30"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "email",
											children: "Email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "email",
											type: "email",
											required: true,
											value: email,
											onChange: (e) => setEmail(e.target.value),
											placeholder: "you@company.com",
											className: "h-11 bg-card border-hairline focus:border-primary/30"
										})]
									}),
									mode !== "forgot" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "password",
												children: "Password"
											}), mode === "signin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setMode("forgot"),
												className: "text-xs text-primary hover:underline",
												children: "Forgot password?"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "password",
											type: "password",
											required: true,
											value: password,
											onChange: (e) => setPassword(e.target.value),
											placeholder: "••••••••",
											className: "h-11 bg-card border-hairline focus:border-primary/30"
										})]
									}),
									mode === "signin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											id: "remember",
											checked: remember,
											onCheckedChange: (c) => setRemember(!!c)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "remember",
											className: "text-sm text-muted-foreground font-normal",
											children: "Remember me on this device"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "submit",
										className: "w-full h-12 glow-emerald text-base font-medium",
										disabled: loading,
										children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"]
									}),
									mode === "forgot" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setMode("signin"),
										className: "w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors",
										children: "← Back to sign in"
									})
								]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-center text-xs text-muted-foreground",
						children: [
							"By continuing you agree to our terms & privacy.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "underline hover:text-foreground transition-colors",
								children: "Back home"
							})
						]
					})
				]
			})
		})]
	});
}
//#endregion
export { AuthPage as component };
