import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { v as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { t as Button } from "./_ssr/button-BkEeRci-.mjs";
import { t as Input } from "./_ssr/input-B8Q2ztVi.mjs";
import { L as Dice5, Q as Bug, i as User, y as Pencil } from "./_libs/lucide-react.mjs";
import { l as formatMoney } from "./_ssr/format-Baza-Edg.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./_ssr/avatar-gunzrkKA.mjs";
import { i as useQueryClient, n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, d as SidebarInset, f as SidebarProvider, i as AlertDialogContent, l as AppSidebar, n as AlertDialogAction, o as AlertDialogFooter, p as SidebarTrigger, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog, u as MobileBottomNav } from "./_ssr/mobile-bottom-nav-yznFBjhZ.mjs";
import { i as format } from "./_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.profile-DmWDW-Om.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { data: profile, refetch } = useQuery({
		queryKey: ["profile"],
		queryFn: async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return null;
			const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
			return {
				...data,
				email: user.email
			};
		}
	});
	const [name, setName] = (0, import_react.useState)("");
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)("");
	const [signOutOpen, setSignOutOpen] = (0, import_react.useState)(false);
	const activePlannerId = profile?.last_planner_id;
	const currentMonthYear = format(/* @__PURE__ */ new Date(), "yyyy-MM");
	const { data: allocations = [] } = useQuery({
		queryKey: [
			"monthly_allocations",
			activePlannerId,
			currentMonthYear
		],
		enabled: !!activePlannerId,
		queryFn: async () => (await supabase.from("monthly_allocations").select("amount, allocation_type").eq("planner_id", activePlannerId).eq("month_year", currentMonthYear)).data ?? []
	});
	const { data: investments = [] } = useQuery({
		queryKey: ["investments", activePlannerId],
		enabled: !!activePlannerId,
		queryFn: async () => (await supabase.from("investments").select("quantity, current_price").eq("planner_id", activePlannerId)).data ?? []
	});
	const monthEarnings = allocations.filter((a) => a.allocation_type === "earning").reduce((s, r) => s + Number(r.amount || 0), 0);
	const monthExpenses = allocations.filter((a) => a.allocation_type !== "earning").reduce((s, r) => s + Number(r.amount || 0), 0);
	const portfolioValue = investments.reduce((sum, inv) => sum + Number(inv.quantity || 0) * Number(inv.current_price || 0), 0);
	const currency = profile?.default_currency ?? "USD";
	(0, import_react.useEffect)(() => {
		if (profile) {
			setName(profile.display_name ?? "");
			setAvatarUrl(profile.avatar_url ?? "");
		}
	}, [profile]);
	async function save() {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		const { error } = await supabase.from("profiles").upsert({
			id: user.id,
			display_name: name,
			avatar_url: avatarUrl
		});
		if (error) return toast.error(error.message);
		toast.success("Profile saved");
		qc.invalidateQueries({ queryKey: ["profile"] });
		refetch();
	}
	async function signOut() {
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	function generateAvatar() {
		const seed = Math.random().toString(36).substring(7);
		const newAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
		setAvatarUrl(newAvatar);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarProvider, {
		defaultOpen: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-screen flex w-full bg-background pb-[80px] md:pb-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden md:flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarInset, {
					className: "flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "hidden md:flex sticky top-0 z-20 h-14 items-center gap-3 px-4 border-b border-hairline bg-background/80 backdrop-blur-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTrigger, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground",
								children: "Profile"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
							className: "md:hidden sticky top-0 z-20 h-14 flex items-center justify-center px-4 border-b border-white/5 bg-background/90 backdrop-blur-xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display font-medium text-base",
								children: "Profile"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
							className: "p-4 md:p-6 max-w-3xl mx-auto w-full space-y-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-3xl",
									children: "Profile"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground text-sm mt-1",
									children: "Manage your personal profile and avatar."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "text-sm font-semibold tracking-wider uppercase text-foreground/80 flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }), " Personal Profile"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-2xl border border-hairline bg-card p-6 flex flex-col md:flex-row gap-8 items-start md:items-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative group flex-shrink-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
												className: "h-28 w-28 border-4 border-background shadow-xl",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: avatarUrl }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
													className: "text-3xl bg-primary/20 text-primary font-medium",
													children: name.charAt(0).toUpperCase() || "U"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: generateAvatar,
												className: "absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95",
												title: "Generate New Avatar",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dice5, { className: "h-5 w-5" })
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 space-y-5 w-full",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative flex-1 max-w-[280px]",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: name,
														onChange: (e) => setName(e.target.value),
														className: "text-3xl font-display font-medium bg-transparent border-transparent hover:border-white/10 focus-visible:ring-1 focus-visible:ring-primary h-auto py-1 px-2 -ml-2",
														placeholder: "Your Name"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none opacity-50" })]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm text-muted-foreground px-1",
												children: profile?.email
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap gap-6 pt-5 border-t border-white/5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1",
														children: "This Month Earnings"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-display text-xl text-primary",
														children: formatMoney(monthEarnings, currency)
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1",
														children: "This Month Expenses"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-display text-xl",
														children: formatMoney(monthExpenses, currency)
													})] }),
													portfolioValue > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1",
														children: "Stock Portfolio"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-display text-xl text-blue-400",
														children: formatMoney(portfolioValue, currency)
													})] })
												]
											})]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-sm font-semibold tracking-wider uppercase text-foreground/80 flex items-center gap-2",
										children: "Support & Feedback"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-2xl border border-hairline bg-card p-6 flex flex-col items-start gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-foreground font-medium",
											children: "Found a bug or need a feature?"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground mt-1",
											children: "Help us improve by reporting issues or suggesting changes to the application."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "secondary",
											className: "gap-2",
											onClick: () => window.open("mailto:support@orionedgedigital.com", "_blank"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bug, { className: "h-4 w-4" }), " Report bugs & request changes"]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between pt-4 border-t border-white/5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										onClick: () => setSignOutOpen(true),
										className: "text-muted-foreground hover:text-foreground",
										children: "Sign out"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										onClick: save,
										className: "glow-emerald px-8",
										children: "Save profile"
									})]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileBottomNav, {})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: signOutOpen,
			onOpenChange: setSignOutOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Are you sure you want to sign out?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "You will be redirected to the login page." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: signOut,
				className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
				children: "Sign out"
			})] })] })
		})]
	});
}
//#endregion
export { ProfilePage as component };
