import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as redirect, _ as Link, b as useRouter, c as HeadContent, f as createRouter, g as createRootRouteWithContext, h as createFileRoute, l as useLocation, m as lazyRouteComponent, p as Outlet, s as Scripts, u as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-CwRrl1Mu.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { r as Route$12, t as LoadingSpinner } from "./loading-spinner-BvXWlYey.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Route$13 } from "../_authenticated.app.p._plannerId.accounts-C8wSPDtv.mjs";
import { t as Route$14 } from "../_authenticated.app.p._plannerId.budget-B98MGNKl.mjs";
import { t as Route$15 } from "../_authenticated.app.p._plannerId.cashflow-DyN2__8s.mjs";
import { t as Route$16 } from "../_authenticated.app.p._plannerId.charts-DSjgVoM2.mjs";
import { t as Route$17 } from "../_authenticated.app.p._plannerId.clients-CRsqB8Jw.mjs";
import { t as Route$18 } from "../_authenticated.app.p._plannerId.dashboard-CNLa04vv.mjs";
import { t as Route$19 } from "../_authenticated.app.p._plannerId.expenses-Cd7rTYid.mjs";
import { t as Route$20 } from "../_authenticated.app.p._plannerId.income-dk_ea-pc.mjs";
import { t as Route$21 } from "../_authenticated.app.p._plannerId.investments-BMgwdroD.mjs";
import { t as Route$22 } from "../_authenticated.app.p._plannerId.invoices-C5yjGAhS.mjs";
import { t as Route$23 } from "../_authenticated.app.p._plannerId.monthly-DOJGkw2k.mjs";
import { t as Route$24 } from "../_authenticated.app.p._plannerId.notes-ChurKMIh.mjs";
import { t as Route$25 } from "../_authenticated.app.p._plannerId.projects-BVOpbwBB.mjs";
import { t as Route$26 } from "../_authenticated.app.p._plannerId.reports-AwGw0Res.mjs";
import { t as Route$27 } from "../_authenticated.app.p._plannerId.timeline-BVJb7Nu6.mjs";
import { t as Route$28 } from "../_authenticated.app.p._plannerId.vault-z5Dej2c-.mjs";
import { t as Route$29 } from "../_authenticated.app.p._plannerId.goals-BPLr19oQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Djx70Rys.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-LxdP0mo7.css";
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center relative z-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-5xl font-display font-bold text-foreground tracking-tight",
					children: "Coming Soon"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-lg text-muted-foreground",
					children: "This page is currently under development. Check back later!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 glow-emerald",
						children: "Return Home"
					})
				})
			]
		})]
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
var Route$11 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Lumen — Personal & Business Finance Planner" },
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
				content: "Lumen — Personal & Business Finance Planner"
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
				content: "Lumen — Personal & Business Finance Planner"
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
function InitialSplash() {
	const [show, setShow] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => setShow(false), 1800);
		return () => clearTimeout(timer);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: show && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 1,
			y: 0
		},
		exit: {
			y: "-100vh",
			opacity: .8
		},
		transition: {
			duration: .8,
			ease: [
				.76,
				0,
				.24,
				1
			]
		},
		className: "fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#020505] shadow-2xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				scale: .9,
				opacity: 0,
				y: 10
			},
			animate: {
				scale: 1,
				opacity: 1,
				y: 0
			},
			exit: {
				scale: .9,
				opacity: 0
			},
			transition: {
				duration: .8,
				ease: "easeOut"
			},
			className: "relative flex flex-col items-center justify-center gap-8 w-full max-w-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/favicon.png",
					alt: "Lumen",
					className: "h-24 w-24 object-contain"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center w-full gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						y: 10
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						delay: .3,
						duration: .5
					},
					className: "text-white/80 font-display tracking-[0.2em] uppercase text-xs",
					children: "Lumen"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: { opacity: 0 },
					animate: { opacity: 1 },
					transition: {
						delay: .5,
						duration: .4
					},
					className: "w-48 h-[2px] bg-white/5 rounded-full overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: { width: "0%" },
						animate: { width: [
							"0%",
							"30%",
							"70%",
							"100%"
						] },
						transition: {
							duration: 1.5,
							times: [
								0,
								.4,
								.8,
								1
							],
							ease: "easeInOut"
						},
						className: "h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
					})
				})]
			})]
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
	const { queryClient } = Route$11.useRouteContext();
	const router = useRouter();
	const location = useLocation();
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event) => {
			if (event === "SIGNED_OUT") {
				queryClient.clear();
				setTimeout(() => router.navigate({
					to: "/auth",
					replace: true
				}), 0);
			} else if (event === "SIGNED_IN") {
				queryClient.invalidateQueries();
				if (location.pathname === "/auth" || location.pathname === "/") setTimeout(() => router.navigate({
					to: "/app",
					replace: true
				}), 0);
			} else if (event === "USER_UPDATED") setTimeout(() => router.invalidate(), 0);
		});
		return () => sub.subscription.unsubscribe();
	}, [
		router,
		queryClient,
		location.pathname
	]);
	const isDashboard = location.pathname.startsWith("/app");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InitialSplash, {}),
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
var $$splitComponentImporter$10 = () => import("./reset-password-CKq4E3ZG.mjs");
var Route$10 = createFileRoute("/reset-password")({
	head: () => ({ meta: [{ title: "Reset password — Lumen" }, {
		name: "robots",
		content: "noindex"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./docs-D-FHjQFc.mjs");
var Route$9 = createFileRoute("/docs")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./contact-62msmcLs.mjs");
var Route$8 = createFileRoute("/contact")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./coming-soon-DUFRN_XB.mjs");
var Route$7 = createFileRoute("/coming-soon")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./auth-Cr4cFBkQ.mjs");
var Route$6 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Join Beta — Lumen" },
		{
			name: "description",
			content: "Join the Lumen Beta program."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./about-C0CPCLmh.mjs");
var Route$5 = createFileRoute("/about")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("../_authenticated-BsiboBRC.mjs");
var Route$4 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) {
			await supabase.auth.signOut();
			throw redirect({ to: "/auth" });
		}
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./routes-CbyBN84_.mjs");
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("../_authenticated.app-DgBjCDfj.mjs");
var Route$2 = createFileRoute("/_authenticated/app")({
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
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("../_authenticated.app.profile-DmWDW-Om.mjs");
var Route$1 = createFileRoute("/_authenticated/app/profile")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("../_authenticated.app.preferences-C6xMcQ6s.mjs");
var Route = createFileRoute("/_authenticated/app/preferences")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var ResetPasswordRoute = Route$10.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$11
});
var DocsRoute = Route$9.update({
	id: "/docs",
	path: "/docs",
	getParentRoute: () => Route$11
});
var ContactRoute = Route$8.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$11
});
var ComingSoonRoute = Route$7.update({
	id: "/coming-soon",
	path: "/coming-soon",
	getParentRoute: () => Route$11
});
var AuthRoute = Route$6.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$11
});
var AboutRoute = Route$5.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$11
});
var AuthenticatedRoute = Route$4.update({
	id: "/_authenticated",
	getParentRoute: () => Route$11
});
var IndexRoute = Route$3.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$11
});
var AuthenticatedAppRoute = Route$2.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => AuthenticatedRoute
});
var AuthenticatedAppProfileRoute = Route$1.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AuthenticatedAppRoute
});
var AuthenticatedAppPreferencesRoute = Route.update({
	id: "/preferences",
	path: "/preferences",
	getParentRoute: () => AuthenticatedAppRoute
});
var AuthenticatedAppPPlannerIdRoute = Route$12.update({
	id: "/p/$plannerId",
	path: "/p/$plannerId",
	getParentRoute: () => AuthenticatedAppRoute
});
var AuthenticatedAppPPlannerIdVaultRoute = Route$28.update({
	id: "/vault",
	path: "/vault",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdTimelineRoute = Route$27.update({
	id: "/timeline",
	path: "/timeline",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdReportsRoute = Route$26.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdProjectsRoute = Route$25.update({
	id: "/projects",
	path: "/projects",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdNotesRoute = Route$24.update({
	id: "/notes",
	path: "/notes",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdMonthlyRoute = Route$23.update({
	id: "/monthly",
	path: "/monthly",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdInvoicesRoute = Route$22.update({
	id: "/invoices",
	path: "/invoices",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdInvestmentsRoute = Route$21.update({
	id: "/investments",
	path: "/investments",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdIncomeRoute = Route$20.update({
	id: "/income",
	path: "/income",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdGoalsRoute = Route$29.update({
	id: "/goals",
	path: "/goals",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdExpensesRoute = Route$19.update({
	id: "/expenses",
	path: "/expenses",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdDashboardRoute = Route$18.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdClientsRoute = Route$17.update({
	id: "/clients",
	path: "/clients",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdChartsRoute = Route$16.update({
	id: "/charts",
	path: "/charts",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdCashflowRoute = Route$15.update({
	id: "/cashflow",
	path: "/cashflow",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdBudgetRoute = Route$14.update({
	id: "/budget",
	path: "/budget",
	getParentRoute: () => AuthenticatedAppPPlannerIdRoute
});
var AuthenticatedAppPPlannerIdRouteChildren = {
	AuthenticatedAppPPlannerIdAccountsRoute: Route$13.update({
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
	AuthenticatedAppPPlannerIdMonthlyRoute,
	AuthenticatedAppPPlannerIdNotesRoute,
	AuthenticatedAppPPlannerIdProjectsRoute,
	AuthenticatedAppPPlannerIdReportsRoute,
	AuthenticatedAppPPlannerIdTimelineRoute,
	AuthenticatedAppPPlannerIdVaultRoute
};
var AuthenticatedAppRouteChildren = {
	AuthenticatedAppPreferencesRoute,
	AuthenticatedAppProfileRoute,
	AuthenticatedAppPPlannerIdRoute: AuthenticatedAppPPlannerIdRoute._addFileChildren(AuthenticatedAppPPlannerIdRouteChildren)
};
var AuthenticatedRouteChildren = { AuthenticatedAppRoute: AuthenticatedAppRoute._addFileChildren(AuthenticatedAppRouteChildren) };
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRoute: AuthenticatedRoute._addFileChildren(AuthenticatedRouteChildren),
	AboutRoute,
	AuthRoute,
	ComingSoonRoute,
	ContactRoute,
	DocsRoute,
	ResetPasswordRoute
};
var routeTree = Route$11._addFileChildren(rootRouteChildren)._addFileTypes();
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
