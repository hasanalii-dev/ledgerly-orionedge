import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { s as PROJECT_STATUSES } from "./_ssr/format-Baza-Edg.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { n as CellSelect, r as EditableTable, t as CellInput } from "./_ssr/editable-table-CoPQhPm4.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.projects-BVOpbwBB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.projects-f5CBe_8Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProjectsPage() {
	const { plannerId } = Route.useParams();
	const [uid, setUid] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? ""));
	}, []);
	const { data: rows = [] } = useQuery({
		queryKey: ["projects", plannerId],
		queryFn: async () => (await supabase.from("projects").select("*").eq("planner_id", plannerId).order("created_at", { ascending: false })).data ?? []
	});
	const { data: clients = [] } = useQuery({
		queryKey: ["clients", plannerId],
		queryFn: async () => (await supabase.from("clients").select("id, name").eq("planner_id", plannerId)).data ?? []
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "Projects"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Scope, value and status per engagement."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableTable, {
			table: "projects",
			rows,
			planner_id: plannerId,
			user_id: uid,
			invalidateKeys: [["projects", plannerId]],
			onNewRow: () => ({
				name: "New project",
				status: "active"
			}),
			columns: [
				{
					key: "name",
					label: "Name",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						value: r.name ?? "",
						onChange: (v) => on({ name: v })
					})
				},
				{
					key: "client_id",
					label: "Client",
					width: "170px",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellSelect, {
						value: r.client_id ?? "",
						onChange: (v) => on({ client_id: v || null }),
						options: clients.map((c) => ({
							value: c.id,
							label: c.name
						}))
					})
				},
				{
					key: "status",
					label: "Status",
					width: "140px",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellSelect, {
						value: r.status ?? "active",
						onChange: (v) => on({ status: v }),
						options: PROJECT_STATUSES.map((s) => ({
							value: s,
							label: s
						}))
					})
				},
				{
					key: "value",
					label: "Value",
					width: "130px",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						type: "number",
						value: String(r.value ?? 0),
						onChange: (v) => on({ value: parseFloat(v) || 0 }),
						className: "text-right font-mono"
					})
				},
				{
					key: "start_date",
					label: "Start",
					width: "140px",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						type: "date",
						value: r.start_date ?? "",
						onChange: (v) => on({ start_date: v || null })
					})
				},
				{
					key: "deadline",
					label: "Deadline",
					width: "140px",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						type: "date",
						value: r.deadline ?? "",
						onChange: (v) => on({ deadline: v || null })
					})
				},
				{
					key: "notes",
					label: "Notes",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						value: r.notes ?? "",
						onChange: (v) => on({ notes: v })
					})
				}
			]
		})]
	});
}
//#endregion
export { ProjectsPage as component };
