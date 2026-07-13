import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { p as Outlet, v as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CYB-gyWu.mjs";
import { i as DEFAULT_FOLDERS, n as CURRENCIES, r as DEFAULT_EXPENSE_CATEGORIES } from "./_ssr/format-Baza-Edg.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as PageTransition, r as Route, t as LoadingSpinner } from "./_ssr/loading-spinner-BvXWlYey.mjs";
import { i as useQueryClient, n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { d as SidebarInset, f as SidebarProvider, l as AppSidebar, p as SidebarTrigger, u as MobileBottomNav } from "./_ssr/mobile-bottom-nav-yznFBjhZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId-B1YjrmQK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlannerLayout() {
	const { plannerId } = Route.useParams();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { data: planner, isError, isLoading } = useQuery({
		queryKey: ["planner", plannerId],
		queryFn: async () => {
			const { data, error } = await supabase.from("planners").select("*").eq("id", plannerId).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	(0, import_react.useEffect)(() => {
		if (!planner) return;
		(async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			const { count: catCount } = await supabase.from("expense_categories").select("id", {
				count: "exact",
				head: true
			}).eq("planner_id", planner.id);
			if ((catCount ?? 0) === 0) {
				await supabase.from("expense_categories").insert(DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
					user_id: user.id,
					planner_id: planner.id,
					name: c.name,
					color: c.color
				})));
				qc.invalidateQueries({ queryKey: ["expense_categories", planner.id] });
			}
			const { count: fCount } = await supabase.from("doc_folders").select("id", {
				count: "exact",
				head: true
			}).eq("planner_id", planner.id);
			if ((fCount ?? 0) === 0) await supabase.from("doc_folders").insert(DEFAULT_FOLDERS.map((f) => ({
				user_id: user.id,
				planner_id: planner.id,
				name: f,
				is_system: true
			})));
			await supabase.from("profiles").update({ last_planner_id: planner.id }).eq("id", user.id);
		})();
	}, [planner, qc]);
	(0, import_react.useEffect)(() => {
		if (!isLoading && (isError || !planner)) navigate({ to: "/app" });
	}, [
		isLoading,
		isError,
		planner,
		navigate
	]);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSpinner, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarProvider, {
		defaultOpen: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-screen flex w-full bg-background pb-[80px] md:pb-0 relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden md:flex relative z-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarInset, {
					className: "flex-1 overflow-hidden relative z-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "hidden md:flex sticky top-0 z-20 h-14 items-center gap-3 px-4 border-b border-hairline bg-background/80 backdrop-blur-xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTrigger, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm text-muted-foreground truncate flex-1",
									children: planner?.name ?? ""
								}),
								planner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground uppercase tracking-wider",
										children: "Currency"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: planner.currency ?? "USD",
										onValueChange: async (v) => {
											const { error } = await supabase.from("planners").update({ currency: v }).eq("id", planner.id);
											if (error) return toast.error(error.message);
											qc.invalidateQueries({ queryKey: ["planner", planner.id] });
											qc.invalidateQueries({ queryKey: ["planners"] });
											toast.success(`Currency set to ${v}`);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 w-[92px] bg-card border-hairline",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CURRENCIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: c,
											children: c
										}, c)) })]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
							className: "md:hidden sticky top-0 z-20 h-14 flex items-center justify-center px-4 border-b border-white/5 bg-background/90 backdrop-blur-xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display font-medium text-base truncate",
								children: planner?.name ?? "Planner"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
							className: "p-4 md:p-6 overflow-y-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileBottomNav, {})
			]
		})
	});
}
//#endregion
export { PlannerLayout as component };
