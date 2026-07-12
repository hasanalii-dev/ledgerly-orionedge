import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as redirect, _ as Link, b as useRouter, c as HeadContent, f as createRouter, g as createRootRouteWithContext, h as createFileRoute, l as useLocation, m as lazyRouteComponent, p as Outlet, s as Scripts, u as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./client-CwRrl1Mu.mjs";
import { r as Route$7, t as LoadingSpinner } from "./loading-spinner-B8EklePp.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$8 } from "../_authenticated.app.p._plannerId.accounts-Dn7eCUHS.mjs";
import { t as Route$9 } from "../_authenticated.app.p._plannerId.budget-B98MGNKl.mjs";
import { t as Route$10 } from "../_authenticated.app.p._plannerId.cashflow-DyN2__8s.mjs";
import { t as Route$11 } from "../_authenticated.app.p._plannerId.charts-DSjgVoM2.mjs";
import { t as Route$12 } from "../_authenticated.app.p._plannerId.clients-DQgzQuDn.mjs";
import { t as Route$13 } from "../_authenticated.app.p._plannerId.dashboard-BMBjnAHf.mjs";
import { t as Route$14 } from "../_authenticated.app.p._plannerId.expenses-DJ2Wspu9.mjs";
import { t as Route$15 } from "../_authenticated.app.p._plannerId.goals-CtH_nS0u.mjs";
import { t as Route$16 } from "../_authenticated.app.p._plannerId.income-BBeK_9G0.mjs";
import { t as Route$17 } from "../_authenticated.app.p._plannerId.investments-BKztkcJW.mjs";
import { t as Route$18 } from "../_authenticated.app.p._plannerId.invoices-BbrdeSSN.mjs";
import { t as Route$19 } from "../_authenticated.app.p._plannerId.notes-DMItqelf.mjs";
import { t as Route$20 } from "../_authenticated.app.p._plannerId.projects-CawDpB1O.mjs";
import { t as Route$21 } from "../_authenticated.app.p._plannerId.reports-CXiAma_D.mjs";
import { t as Route$22 } from "../_authenticated.app.p._plannerId.timeline-BVJb7Nu6.mjs";
import { t as Route$23 } from "../_authenticated.app.p._plannerId.vault-FAAEa7OS.mjs";
import { i as AnimatePresence, r as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BD0Hb92w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-NXAl3cBI.css";
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xl text-muted-foreground",
					children: "This page could not be found."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go back home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold text-destructive",
					children: "Something went wrong"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground bg-elevated p-4 rounded-lg text-left overflow-auto break-words font-mono",
					children: error.message
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => window.location.reload(),
						className: "inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					})
				})
			]
		})
	});
}
var Route$6 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Ledgerly — Personal & Business Finance Planner" },
			{
				name: "description",
				content: "A premium financial operating system for entrepreneurs, freelancers, and agencies. Track income, expenses, invoices, clients, and cash flow in beautiful spreadsheet-style planners."
			},
			{
				name: "theme-color",
				content: "#0B0F0D"
			},
			{
				property: "og:title",
				content: "Ledgerly — Personal & Business Finance Planner"
			},
			{
				property: "og:description",
				content: "A premium financial operating system for entrepreneurs, freelancers, and agencies. Track income, expenses, invoices, clients, and cash flow in beautiful spreadsheet-style planners."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "Ledgerly — Personal & Business Finance Planner"
			},
			{
				name: "twitter:description",
				content: "A premium financial operating system for entrepreneurs, freelancers, and agencies. Track income, expenses, invoices, clients, and cash flow in beautiful spreadsheet-style planners."
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.png",
				type: "image/png"
			},
			{
				rel: "preconnect",
				href: "https://api.fontshare.com"
			},
			{
				rel: "preconnect",
				href: "https://cdn.fontshare.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&f[]=satoshi@400,500,600,700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function PageLoader() {
	const isPending = useRouterState({ select: (s) => s.status === "pending" });
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	if (!mounted) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		className: "fixed top-0 left-0 right-0 z-50 h-1 bg-primary origin-left overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			className: "h-full bg-white/40",
			initial: { width: "0%" },
			animate: { width: "100%" },
			transition: {
				duration: 1.5,
				ease: "circOut"
			}
		})
	}) });
}
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "antialiased min-h-screen bg-background text-foreground",
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})]
		})]
	});
}
function RootComponent() {
	const { queryClient } = Route$6.useRouteContext();
	const router = useRouter();
	const location = useLocation();
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event) => {
			if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
			router.invalidate();
			if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
		});
		return () => sub.subscription.unsubscribe();
	}, [router, queryClient]);
	const isDashboard = location.pathname.startsWith("/app");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageLoader, {}),
			isDashboard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: {
					opacity: 0,
					y: 12,
					filter: "blur(4px)"
				},
				animate: {
					opacity: 1,
					y: 0,
					filter: "blur(0px)",
					transitionEnd: {
						filter: "none",
						transform: "none"
					}
				},
				transition: {
					duration: .4,
					ease: [
						.22,
						1,
						.36,
						1
					]
				},
				className: "flex min-h-screen flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			}, location.pathname),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				theme: "dark",
				position: "bottom-right"
			})
		]
	});
}
var $$splitComponentImporter$5 = () => import("./reset-password-zXf5Uyb3.mjs");
var Route$5 = createFileRoute("/reset-password")({
	head: () => ({ meta: [{ title: "Reset password — Ledgerly" }, {
		name: "robots",
		content: "noindex"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./auth-DuYQ-pOH.mjs");
var Route$4 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Sign in — Ledgerly" },
		{
			name: "description",
			content: "Sign in to your Ledgerly finance planner."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("../_authenticated-BsiboBRC.mjs");
var Route$3 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./routes-Br4qTcb-.mjs");
var Route$2 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("../_authenticated.app-KL3h9wpw.mjs");
var Route$1 = createFileRoute("/_authenticated/app")({
	loader: async ({ location }) => {
		if (location.pathname === "/app" || location.pathname === "/app/") {
			const { data: planners, error } = await supabase.from("planners").select("id, is_default, created_at").order("is_default", { ascending: false }).order("created_at", { ascending: true }).limit(1);
			if (error) console.error("Error fetching planners:", error);
			const first = planners?.[0];
			if (first) throw redirect({
				to: "/app/p/$plannerId/dashboard",
				params: { plannerId: first.id }
			});
		}
		return null;
	},
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("../_authenticated.app.settings-BmbNjqcS.mjs");
var Route = createFileRoute("/_authenticated/app/settings")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var ResetPasswordRoute = Route$5.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$6
});
var AuthRoute = Route$4.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$6
});
var AuthenticatedRoute = Route$3.update({
	id: "/_authenticated",
	getParentRoute: () => Route$6
});
var IndexRoute = Route$2.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$6
});
var AuthenticatedAppRoute = Route$1.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => AuthenticatedRoute
});
var AuthenticatedAppSettingsRoute = Route.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedAppRoute
});
var AuthenticatedAppPPlannerIdRoute = Route$7.update({
	id: "/p/$plannerId",
	path: "/p/$plannerId",
	getParentRoute: () => AuthenticatedAppRoute
});
var AuthenticatedAppPPlannerIdVaultRoute = Route$23.update({
	id: "/vault",
	path: "/vault",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdTimelineRoute = Route$22.update({
	id: "/timeline",
	path: "/timeline",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdReportsRoute = Route$21.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdProjectsRoute = Route$20.update({
	id: "/projects",
	path: "/projects",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdNotesRoute = Route$19.update({
	id: "/notes",
	path: "/notes",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdInvoicesRoute = Route$18.update({
	id: "/invoices",
	path: "/invoices",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdInvestmentsRoute = Route$17.update({
	id: "/investments",
	path: "/investments",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdIncomeRoute = Route$16.update({
	id: "/income",
	path: "/income",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdGoalsRoute = Route$15.update({
	id: "/goals",
	path: "/goals",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdExpensesRoute = Route$14.update({
	id: "/expenses",
	path: "/expenses",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdDashboardRoute = Route$13.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdClientsRoute = Route$12.update({
	id: "/clients",
	path: "/clients",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdChartsRoute = Route$11.update({
	id: "/charts",
	path: "/charts",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdCashflowRoute = Route$10.update({
	id: "/cashflow",
	path: "/cashflow",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdBudgetRoute = Route$9.update({
	id: "/budget",
	path: "/budget",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdRouteChildren = {
	AuthenticatedAppPPlannerIdAccountsRoute: Route$8.update({
		id: "/accounts",
		path: "/accounts",
		getParentRoute: () => AuthenticatedAppPPlannerIdRoute
	}),
	AuthenticatedAppPPlannerIdBudgetRoute,
	AuthenticatedAppPPlannerIdCashflowRoute,
	AuthenticatedAppPPlannerIdChartsRoute,
	AuthenticatedAppPPlannerIdClientsRoute,
	AuthenticatedAppPPlannerIdDashboardRoute,
	AuthenticatedAppPPlannerIdExpensesRoute,
	AuthenticatedAppPPlannerIdGoalsRoute,
	AuthenticatedAppPPlannerIdIncomeRoute,
	AuthenticatedAppPPlannerIdInvestmentsRoute,
	AuthenticatedAppPPlannerIdInvoicesRoute,
	AuthenticatedAppPPlannerIdNotesRoute,
	AuthenticatedAppPPlannerIdProjectsRoute,
	AuthenticatedAppPPlannerIdReportsRoute,
	AuthenticatedAppPPlannerIdTimelineRoute,
	AuthenticatedAppPPlannerIdVaultRoute
};
var AuthenticatedAppRouteChildren = {
	AuthenticatedAppSettingsRoute,
	AuthenticatedAppPPlannerIdRoute: AuthenticatedAppPPlannerIdRoute._addFileChildren(AuthenticatedAppPPlannerIdRouteChildren)
};
var AuthenticatedRouteChildren = { AuthenticatedAppRoute: AuthenticatedAppRoute._addFileChildren(AuthenticatedAppRouteChildren) };
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRoute: AuthenticatedRoute._addFileChildren(AuthenticatedRouteChildren),
	AuthRoute,
	ResetPasswordRoute
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		defaultPendingComponent: LoadingSpinner
	});
};
//#endregion
export { getRouter };
