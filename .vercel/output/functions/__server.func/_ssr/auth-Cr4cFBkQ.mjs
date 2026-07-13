import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-CwRrl1Mu.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { L as Dice5, O as House, S as Mail, nt as ArrowRight, rt as ArrowLeft, w as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as SideRays } from "./SideRays-C7tAYodH.mjs";
import { t as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-Cr4cFBkQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emailSchema = stringType().email("Enter a valid email");
var passwordSchema = stringType().min(6, "Minimum 6 characters");
function AuthBetaPage() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("login");
	const [step, setStep] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [username, setUsername] = (0, import_react.useState)("");
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)(() => `https://api.dicebear.com/7.x/notionists/svg?seed=${Math.random().toString(36).substring(7)}`);
	const [otp, setOtp] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session) navigate({ to: "/app" });
		});
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
			if (session) navigate({ to: "/app" });
		});
		return () => subscription.unsubscribe();
	}, [navigate]);
	const handleGoogleSignIn = async () => {
		try {
			setLoading(true);
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: { redirectTo: `${window.location.origin}/app` }
			});
			if (error) throw error;
		} catch (err) {
			toast.error(err.message);
			setLoading(false);
		}
	};
	const handleNextLogin = () => {
		try {
			emailSchema.parse(email);
			setStep(1);
		} catch (err) {
			toast.error(err.errors[0].message);
		}
	};
	const handleLoginSubmit = async () => {
		try {
			setLoading(true);
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (error) throw error;
			toast.success("Welcome back!");
		} catch (err) {
			toast.error(err.message);
			setLoading(false);
		}
	};
	const handleNextSignupUsername = () => {
		if (username.length < 3) return toast.error("Username must be at least 3 characters");
		setStep(1);
	};
	const handleNextSignupEmail = () => {
		try {
			emailSchema.parse(email);
			setStep(2);
		} catch (err) {
			toast.error(err.errors[0].message);
		}
	};
	const handleSignupSubmit = async () => {
		try {
			passwordSchema.parse(password);
			if (password !== confirmPassword) throw new Error("Passwords do not match");
			setLoading(true);
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: { data: {
					display_name: username,
					full_name: username,
					name: username,
					avatar_url: avatarUrl
				} }
			});
			if (error) throw error;
			if (data.session) toast.success("Welcome aboard! (Auto-login: Email confirmation is disabled in Supabase)");
			else {
				toast.success("Code sent to your email!");
				setStep(3);
			}
		} catch (err) {
			toast.error(err.message || err.errors[0].message);
		} finally {
			setLoading(false);
		}
	};
	const handleOtpSubmit = async () => {
		try {
			if (otp.length < 6) return toast.error("Enter a valid verification code");
			setLoading(true);
			const { error } = await supabase.auth.verifyOtp({
				email,
				token: otp,
				type: "signup"
			});
			if (error) throw error;
			toast.success("Beta enrollment complete! Welcome aboard.");
			navigate({ to: "/app" });
		} catch (err) {
			toast.error(err.message);
			setLoading(false);
		}
	};
	const isStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
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
		className: "min-h-screen w-full flex flex-col bg-[#020505] relative overflow-x-hidden text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/bg-gradient.png",
					alt: "Background",
					className: "w-full h-full object-cover opacity-[0.85]"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-0 pointer-events-none mix-blend-screen",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideRays, {
					speed: 2,
					rayColor1: "#10B981",
					rayColor2: "#34D399",
					intensity: 1.2,
					spread: 1.8,
					origin: "top-right",
					tilt: -15,
					saturation: 1.2,
					blend: .5,
					opacity: .6
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-20 w-full p-4 sm:p-8 flex-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors duration-300",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-10 w-10 shrink-0 rounded-full bg-white/5 border border-white/5 flex items-center justify-center backdrop-blur-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium hidden sm:inline",
						children: "Return to Home"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 flex items-center justify-center p-4 sm:px-8 pb-12 z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 30,
						scale: .95
					},
					animate: {
						opacity: 1,
						y: 0,
						scale: 1
					},
					transition: {
						duration: .7,
						ease: [
							.22,
							1,
							.36,
							1
						]
					},
					className: "relative w-full max-w-[420px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative w-full rounded-[32px] p-[1px] overflow-hidden shadow-2xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-tr from-white/5 via-white/5 to-emerald-400/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-full h-full bg-[#050a0a]/90 backdrop-blur-2xl rounded-[31px] p-6 sm:p-8 pb-8 sm:pb-10 flex flex-col shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]",
							children: [
								step > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "absolute top-6 left-6 h-8 w-8 rounded-full text-muted-foreground hover:bg-white/5 hover:text-white z-50 transition-colors",
									onClick: () => setStep(step - 1),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-8 text-center mt-2 flex flex-col items-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/",
											className: "inline-flex items-center gap-2 mb-6 group cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-9 w-9 bg-[#0b1414] rounded-[10px] flex items-center justify-center border border-white/5",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: "/favicon.png",
													alt: "Lumen",
													className: "h-4 w-4 object-contain"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-display font-semibold text-xl text-white tracking-tight",
												children: "Lumen"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
											className: "text-3xl font-display font-medium text-white tracking-tight",
											children: mode === "login" ? "Welcome back" : "Join the Beta"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground text-sm mt-2",
											children: mode === "login" ? "Sign in to access your ledger" : "Secure your spot in the early access program"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex-1",
									children: [mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center justify-center mb-8 px-2",
										children: [
											0,
											1,
											2,
											3
										].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
												}) : s + 1
											}), i < 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `w-8 sm:w-12 h-[2px] transition-all duration-500 mx-2 rounded-full ${step > s ? "bg-emerald-500/50" : "bg-white/5"}` })]
										}, s))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatePresence, {
										mode: "wait",
										children: [
											mode === "login" && step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
												variants: containerVariants,
												initial: "hidden",
												animate: "visible",
												exit: "exit",
												className: "space-y-4",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "outline",
														className: "w-full h-14 bg-[#0a1212] border-white/5 hover:bg-white/5 text-white/90 rounded-2xl font-medium transition-all",
														onClick: handleGoogleSignIn,
														disabled: loading,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
															className: "w-5 h-5 mr-3",
															viewBox: "0 0 24 24",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
																	fill: "currentColor",
																	d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
																	fill: "#34A853",
																	d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
																	fill: "#FBBC05",
																	d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
																	fill: "#EA4335",
																	d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
																})
															]
														}), "Continue with Google"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "relative py-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "absolute inset-0 flex items-center",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-full border-t border-white/5" })
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "relative flex justify-center text-[10px] uppercase font-semibold tracking-widest",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "bg-[#050a0a] px-3 text-muted-foreground/50",
																children: "Or continue with"
															})
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "space-y-3",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "email",
															placeholder: "Email Address",
															value: email,
															onChange: (e) => setEmail(e.target.value),
															className: "h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all",
															onKeyDown: (e) => e.key === "Enter" && handleNextLogin(),
															autoFocus: true
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														className: "w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group",
														onClick: handleNextLogin,
														children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" })]
													})
												]
											}, "login-0"),
											mode === "login" && step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
												variants: containerVariants,
												initial: "hidden",
												animate: "visible",
												exit: "exit",
												className: "space-y-4",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center justify-between mb-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-sm font-medium text-emerald-400",
																children: email
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: () => setStep(0),
																className: "text-xs text-muted-foreground hover:text-white transition-colors",
																children: "Edit"
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "password",
															placeholder: "Enter Password",
															value: password,
															onChange: (e) => setPassword(e.target.value),
															className: "h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all",
															onKeyDown: (e) => e.key === "Enter" && handleLoginSubmit(),
															autoFocus: true
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														className: "w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4",
														onClick: handleLoginSubmit,
														disabled: loading,
														children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : "Sign In"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-center mt-4",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															className: "text-sm text-muted-foreground hover:text-white transition-colors",
															children: "Forgot your password?"
														})
													})
												]
											}, "login-1"),
											mode === "signup" && step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
												variants: containerVariants,
												initial: "hidden",
												animate: "visible",
												exit: "exit",
												className: "space-y-4",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex flex-col items-center justify-center mb-6",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "relative group",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
																src: avatarUrl,
																alt: "Avatar",
																className: "w-24 h-24 rounded-full border-4 border-[#030606] shadow-xl bg-white/5 object-cover"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: () => setAvatarUrl(`https://api.dicebear.com/7.x/notionists/svg?seed=${Math.random().toString(36).substring(7)}`),
																className: "absolute bottom-0 right-0 p-2 bg-emerald-400 text-[#030808] rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all",
																title: "Generate New Avatar",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dice5, { className: "h-4 w-4" })
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-xs text-muted-foreground mt-3 font-medium",
															children: "Choose your avatar"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
															className: "text-sm font-medium text-white/80 pl-1",
															children: "Choose your Name"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "text",
															placeholder: "e.g. Alex Stone",
															value: username,
															onChange: (e) => setUsername(e.target.value),
															className: "h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all",
															onKeyDown: (e) => e.key === "Enter" && handleNextSignupUsername(),
															autoFocus: true
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														className: "w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group",
														onClick: handleNextSignupUsername,
														children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" })]
													})
												]
											}, "signup-0"),
											mode === "signup" && step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
												variants: containerVariants,
												initial: "hidden",
												animate: "visible",
												exit: "exit",
												className: "space-y-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-sm font-medium text-white/80 pl-1",
														children: "What's your email?"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "email",
														placeholder: "you@example.com",
														value: email,
														onChange: (e) => setEmail(e.target.value),
														className: "h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all",
														onKeyDown: (e) => e.key === "Enter" && handleNextSignupEmail(),
														autoFocus: true
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													className: "w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group",
													onClick: handleNextSignupEmail,
													children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" })]
												})]
											}, "signup-1"),
											mode === "signup" && step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
												variants: containerVariants,
												initial: "hidden",
												animate: "visible",
												exit: "exit",
												className: "space-y-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-3",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																className: "text-sm font-medium text-white/80 pl-1",
																children: "Create a secure password"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "password",
																placeholder: "Password",
																value: password,
																onChange: (e) => setPassword(e.target.value),
																className: "h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all",
																autoFocus: true
															}),
															password.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2 px-1 pt-1",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-1.5 flex-1 rounded-full transition-all duration-500 ${password.length >= 6 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-red-500/50"}` }),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-1.5 flex-1 rounded-full transition-all duration-500 ${isStrong ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"}` }),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-1.5 flex-1 rounded-full transition-all duration-500 ${isStrong && password.length >= 12 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"}` })
																]
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "space-y-3",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "password",
															placeholder: "Re-enter Password",
															value: confirmPassword,
															onChange: (e) => setConfirmPassword(e.target.value),
															className: "h-14 bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:ring-emerald-500/30 rounded-2xl px-4 text-sm transition-all",
															onKeyDown: (e) => e.key === "Enter" && handleSignupSubmit()
														})
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													className: "w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-4 group",
													onClick: handleSignupSubmit,
													disabled: loading || !password || !confirmPassword,
													children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : "Create Account"
												})]
											}, "signup-2"),
											mode === "signup" && step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
												variants: containerVariants,
												initial: "hidden",
												animate: "visible",
												exit: "exit",
												className: "space-y-4 text-center py-4",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-emerald-500/10 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-8 w-8 text-emerald-400 relative z-10" })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-sm text-white/80 mb-6 leading-relaxed",
														children: [
															"We sent an 8-digit verification code to ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
																className: "text-emerald-400",
																children: email
															}),
															"."
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "text",
														placeholder: "• • • • • • • •",
														value: otp,
														onChange: (e) => setOtp(e.target.value),
														className: "h-16 text-center text-2xl tracking-[0.5em] font-mono bg-[#030606] border-white/5 text-white placeholder:text-muted-foreground/30 focus-visible:ring-emerald-500/30 rounded-2xl transition-all",
														maxLength: 8,
														onKeyDown: (e) => e.key === "Enter" && handleOtpSubmit(),
														autoFocus: true
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														className: "w-full h-14 bg-emerald-400 hover:bg-emerald-300 text-[#030808] font-semibold text-base rounded-2xl mt-6 group",
														onClick: handleOtpSubmit,
														disabled: loading || otp.length < 8,
														children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : "Verify Code"
													})
												]
											}, "signup-3")
										]
									})]
								}),
								step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-8 flex justify-center items-center text-sm",
									children: mode === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground/70",
										children: "Don't Have An Account? "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "ml-1 text-emerald-400 font-medium hover:text-emerald-300 transition-colors",
										onClick: () => {
											setMode("signup");
											setStep(0);
											setEmail("");
											setPassword("");
										},
										children: "Enroll in Beta"
									})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground/70",
										children: "Already Have An Account? "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "ml-1 text-emerald-400 font-medium hover:text-emerald-300 transition-colors",
										onClick: () => {
											setMode("login");
											setStep(0);
											setEmail("");
											setPassword("");
											setConfirmPassword("");
											setUsername("");
										},
										children: "Sign in"
									})] })
								})
							]
						})]
					})]
				})
			})
		]
	});
}
//#endregion
export { AuthBetaPage as component };
