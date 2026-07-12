import { b as useRouter, p as Outlet } from "./_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app-KL3h9wpw.js
var import_jsx_runtime = require_jsx_runtime();
var SplitComponent = () => {
	const pathname = useRouter().state.location.pathname;
	if (pathname === "/app" || pathname === "/app/") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold mb-4",
				children: "No Planner Found"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground mb-6 text-center max-w-md",
				children: "It looks like your account doesn't have a default planner. This usually happens if you signed up before running the Supabase SQL migrations, or if the database trigger failed."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "px-4 py-2 bg-primary text-primary-foreground rounded-md",
				onClick: async () => {
					const { data: user } = await supabase.auth.getUser();
					if (user.user) {
						await supabase.from("planners").insert({
							user_id: user.user.id,
							name: "Personal",
							is_default: true
						});
						window.location.reload();
					}
				},
				children: "Fix: Create Default Planner"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
};
//#endregion
export { SplitComponent as component };
