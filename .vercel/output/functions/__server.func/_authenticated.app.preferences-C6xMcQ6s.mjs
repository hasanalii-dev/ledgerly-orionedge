import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { v as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { t as Button } from "./_ssr/button-BkEeRci-.mjs";
import { X as Calendar, k as Globe, o as TriangleAlert } from "./_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CYB-gyWu.mjs";
import { n as CURRENCIES } from "./_ssr/format-Baza-Edg.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { i as useQueryClient, n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, d as SidebarInset, f as SidebarProvider, i as AlertDialogContent, l as AppSidebar, n as AlertDialogAction, o as AlertDialogFooter, p as SidebarTrigger, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog, u as MobileBottomNav } from "./_ssr/mobile-bottom-nav-yznFBjhZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.preferences-C6xMcQ6s.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DATE_FORMATS = [
	"yyyy-MM-dd",
	"dd/MM/yyyy",
	"MM/dd/yyyy"
];
var LOCALES = [
	{
		value: "en-US",
		label: "English (US)"
	},
	{
		value: "en-GB",
		label: "English (UK)"
	},
	{
		value: "de-DE",
		label: "German"
	},
	{
		value: "fr-FR",
		label: "French"
	},
	{
		value: "es-ES",
		label: "Spanish"
	}
];
function PreferencesPage() {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { data: profile, refetch } = useQuery({
		queryKey: ["profile"],
		queryFn: async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return null;
			const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
			return data;
		}
	});
	const [currency, setCurrency] = (0, import_react.useState)("USD");
	const [dateFormat, setDateFormat] = (0, import_react.useState)("yyyy-MM-dd");
	const [locale, setLocale] = (0, import_react.useState)("en-US");
	const [signOutOpen, setSignOutOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (profile) {
			setCurrency(profile.default_currency ?? "USD");
			setDateFormat(profile.date_format ?? "yyyy-MM-dd");
			setLocale(profile.locale ?? "en-US");
		}
	}, [profile]);
	async function save() {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		const { error } = await supabase.from("profiles").upsert({
			id: user.id,
			default_currency: currency,
			date_format: dateFormat,
			locale
		});
		if (error) return toast.error(error.message);
		toast.success("Preferences saved");
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
	async function deleteAccount() {
		if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and will delete all your planners and transactions.")) return;
		const { data: { user } } = await supabase.auth.getUser();
		if (user) {
			await supabase.from("profiles").delete().eq("id", user.id);
			await supabase.auth.signOut();
			navigate({
				to: "/",
				replace: true
			});
		}
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
								children: "Preferences"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
							className: "md:hidden sticky top-0 z-20 h-14 flex items-center justify-center px-4 border-b border-white/5 bg-background/90 backdrop-blur-xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display font-medium text-base",
								children: "Preferences"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
							className: "p-4 md:p-6 max-w-3xl mx-auto w-full space-y-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-3xl",
									children: "Application Preferences"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground text-sm mt-1",
									children: "Manage global app settings like currency, formatting, and language."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "text-sm font-semibold tracking-wider uppercase text-foreground/80 flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-4 w-4" }), " Regional & Display"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-2xl border border-hairline bg-card p-4 md:p-6 space-y-5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid md:grid-cols-2 gap-5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-xs uppercase tracking-wider text-muted-foreground mb-1 block",
													children: "Default currency"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: currency,
													onValueChange: setCurrency,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "bg-background border-hairline h-9",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CURRENCIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: c,
														children: c
													}, c)) })]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "text-xs uppercase tracking-wider text-muted-foreground mb-1 block flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }), " Date format"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: dateFormat,
													onValueChange: setDateFormat,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "bg-background border-hairline h-9",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: DATE_FORMATS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: c,
														children: c
													}, c)) })]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-xs uppercase tracking-wider text-muted-foreground mb-1 block",
													children: "Locale"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: locale,
													onValueChange: setLocale,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "bg-background border-hairline h-9",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: LOCALES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: c.value,
														children: c.label
													}, c.value)) })]
												})] })
											]
										})
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
										children: "Save preferences"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "space-y-4 pt-12",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "text-sm font-semibold tracking-wider uppercase text-destructive flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" }), " Danger Zone"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-2xl border border-destructive/20 bg-destructive/5 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-foreground font-medium",
											children: "Delete Account"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground mt-1",
											children: "Permanently remove your account and all associated data. This action cannot be reversed."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "destructive",
											onClick: deleteAccount,
											className: "whitespace-nowrap w-full md:w-auto",
											children: "Delete my account"
										})]
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
export { PreferencesPage as component };
