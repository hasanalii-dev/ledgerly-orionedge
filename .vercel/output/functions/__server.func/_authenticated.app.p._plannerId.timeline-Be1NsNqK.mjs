import { c as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { G as Activity } from "./_libs/lucide-react.mjs";
import { c as formatDate } from "./_ssr/format-Baza-Edg.mjs";
import { t as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.timeline-BVJb7Nu6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.timeline-Be1NsNqK.js
var import_jsx_runtime = require_jsx_runtime();
function TimelinePage() {
	const { plannerId } = Route.useParams();
	const { data = [] } = useQuery({
		queryKey: ["timeline", plannerId],
		queryFn: async () => (await supabase.from("activity_events").select("id, kind, title, subtitle, created_at").eq("planner_id", plannerId).order("created_at", { ascending: false }).limit(200)).data ?? []
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "Timeline"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Everything that's happened in this planner."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-2xl border border-hairline bg-card p-6",
			children: data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "py-16 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-8 w-8 mx-auto mb-3 opacity-40" }), "No activity yet."]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-3 top-2 bottom-2 w-px bg-hairline" }), data.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative pl-10 py-3 border-b border-hairline last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-2 top-4 h-2 w-2 rounded-full bg-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm",
							children: e.title
						}),
						e.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: e.subtitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: [
								formatDate(e.created_at),
								" · ",
								e.kind
							]
						})
					]
				}, e.id))]
			})
		})]
	});
}
//#endregion
export { TimelinePage as component };
