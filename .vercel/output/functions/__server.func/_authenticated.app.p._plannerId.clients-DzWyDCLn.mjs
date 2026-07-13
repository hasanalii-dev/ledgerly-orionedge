import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { r as EditableTable, t as CellInput } from "./_ssr/editable-table-CoPQhPm4.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.clients-CRsqB8Jw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.clients-DzWyDCLn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ClientsPage() {
	const { plannerId } = Route.useParams();
	const [uid, setUid] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? ""));
	}, []);
	const { data: rows = [] } = useQuery({
		queryKey: ["clients", plannerId],
		queryFn: async () => (await supabase.from("clients").select("*").eq("planner_id", plannerId).order("name")).data ?? []
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "Clients"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "People and companies you work with."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableTable, {
			table: "clients",
			rows,
			planner_id: plannerId,
			user_id: uid,
			invalidateKeys: [["clients", plannerId]],
			onNewRow: () => ({ name: "New client" }),
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
					key: "company",
					label: "Company",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						value: r.company ?? "",
						onChange: (v) => on({ company: v })
					})
				},
				{
					key: "email",
					label: "Email",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						value: r.email ?? "",
						onChange: (v) => on({ email: v })
					})
				},
				{
					key: "phone",
					label: "Phone",
					render: (r, on) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
						value: r.phone ?? "",
						onChange: (v) => on({ phone: v })
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
export { ClientsPage as component };
