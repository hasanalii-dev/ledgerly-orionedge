import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { t as cn } from "./_ssr/utils-C_uf36nf.mjs";
import { t as Button } from "./_ssr/button-BkEeRci-.mjs";
import { t as Input } from "./_ssr/input-B8Q2ztVi.mjs";
import { _ as Plus, l as Trash2 } from "./_libs/lucide-react.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { i as useQueryClient, n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.notes-ChurKMIh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.notes-CtICDOIZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
function NotesPage() {
	const { plannerId } = Route.useParams();
	const qc = useQueryClient();
	const { data: notes = [] } = useQuery({
		queryKey: ["notes", plannerId],
		queryFn: async () => (await supabase.from("notes").select("*").eq("planner_id", plannerId).order("updated_at", { ascending: false })).data ?? []
	});
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const active = notes.find((n) => n.id === activeId) ?? notes[0];
	const [title, setTitle] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (active) {
			setTitle(active.title ?? "");
			setBody(active.content ?? "");
		}
	}, [active?.id]);
	(0, import_react.useEffect)(() => {
		if (!active) return;
		const t = setTimeout(async () => {
			if (title === (active.title ?? "") && body === (active.content ?? "")) return;
			await supabase.from("notes").update({
				title,
				content: body
			}).eq("id", active.id);
			qc.invalidateQueries({ queryKey: ["notes", plannerId] });
		}, 700);
		return () => clearTimeout(t);
	}, [
		title,
		body,
		active,
		plannerId,
		qc
	]);
	async function addNote() {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		const { data, error } = await supabase.from("notes").insert({
			planner_id: plannerId,
			user_id: user.id,
			title: "Untitled"
		}).select("id").single();
		if (error) return toast.error(error.message);
		qc.invalidateQueries({ queryKey: ["notes", plannerId] });
		setActiveId(data.id);
	}
	async function del(id) {
		if (!confirm("Delete this note?")) return;
		await supabase.from("notes").delete().eq("id", id);
		qc.invalidateQueries({ queryKey: ["notes", plannerId] });
		setActiveId(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[280px_1fr] gap-6 h-[calc(100vh-160px)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-hairline bg-card overflow-hidden flex flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3 border-b border-hairline flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium",
					children: "Notes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: addNote,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-auto",
				children: [notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setActiveId(n.id),
					className: `w-full text-left px-3 py-2.5 border-b border-hairline hover:bg-elevated ${active?.id === n.id ? "bg-elevated" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium truncate",
						children: n.title || "Untitled"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground truncate",
						children: (n.content ?? "").slice(0, 40)
					})]
				}, n.id)), notes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 text-center text-sm text-muted-foreground",
					children: "No notes yet."
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-2xl border border-hairline bg-card overflow-hidden flex flex-col",
			children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3 border-b border-hairline flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: title,
					onChange: (e) => setTitle(e.target.value),
					placeholder: "Title",
					className: "border-0 bg-transparent font-display text-lg focus-visible:ring-0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => del(active.id),
					className: "text-destructive",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: body,
				onChange: (e) => setBody(e.target.value),
				placeholder: "Start writing…",
				className: "flex-1 border-0 rounded-none resize-none focus-visible:ring-0 bg-transparent p-6 text-base leading-relaxed"
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 flex items-center justify-center text-sm text-muted-foreground",
				children: "Select or create a note"
			})
		})]
	});
}
//#endregion
export { NotesPage as component };
