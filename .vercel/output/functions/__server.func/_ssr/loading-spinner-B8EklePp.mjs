import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { x as LoaderCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/loading-spinner-B8EklePp.js
var import_jsx_runtime = require_jsx_runtime();
var $$splitComponentImporter = () => import("../_authenticated.app.p._plannerId-yLTxllBQ.mjs");
var Route = createFileRoute("/_authenticated/app/p/$plannerId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
function LoadingSpinner() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[60vh] w-full items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-4 text-muted-foreground animate-in fade-in duration-500",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: "Loading workspace..."
			})]
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
