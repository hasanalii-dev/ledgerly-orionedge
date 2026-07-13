import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/loading-spinner-BvXWlYey.js
var import_jsx_runtime = require_jsx_runtime();
var $$splitComponentImporter = () => import("../_authenticated.app.p._plannerId-B1YjrmQK.mjs");
var Route = createFileRoute("/_authenticated/app/p/$plannerId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
function LoadingSpinner() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full min-h-[60vh] w-full flex-1 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col items-center gap-8 animate-in fade-in duration-500",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-emerald-500/20 blur-[30px] rounded-full animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						scale: .95,
						opacity: .8
					},
					animate: {
						scale: [
							.95,
							1.05,
							.95
						],
						opacity: [
							.8,
							1,
							.8
						]
					},
					transition: {
						duration: 1.5,
						repeat: Infinity,
						ease: "easeInOut"
					},
					className: "relative h-20 w-20 bg-[#050a0a] border border-white/10 rounded-[20px] flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_0_40px_rgba(16,185,129,0.1)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/favicon.png",
						alt: "Loading",
						className: "h-10 w-10 object-contain"
					})
				})]
			})
		})
	});
}
function PageTransition({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both",
		children
	});
}
//#endregion
export { PageTransition as n, Route as r, LoadingSpinner as t };
