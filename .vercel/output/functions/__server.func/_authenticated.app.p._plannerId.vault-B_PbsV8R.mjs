import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./_ssr/client-CwRrl1Mu.mjs";
import { t as Button } from "./_ssr/button-BkEeRci-.mjs";
import { A as Folder, I as Download, P as FileText, a as Upload, l as Trash2 } from "./_libs/lucide-react.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { i as useQueryClient, n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as Route } from "./_authenticated.app.p._plannerId.vault-z5Dej2c-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.app.p._plannerId.vault-B_PbsV8R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VaultPage() {
	const { plannerId } = Route.useParams();
	const qc = useQueryClient();
	const fileRef = (0, import_react.useRef)(null);
	const [activeFolder, setActiveFolder] = (0, import_react.useState)(null);
	const { data: folders = [] } = useQuery({
		queryKey: ["folders", plannerId],
		queryFn: async () => (await supabase.from("doc_folders").select("id, name").eq("planner_id", plannerId).order("name")).data ?? []
	});
	const { data: docs = [] } = useQuery({
		queryKey: [
			"docs",
			plannerId,
			activeFolder
		],
		queryFn: async () => {
			let q = supabase.from("documents").select("*").eq("planner_id", plannerId).order("created_at", { ascending: false });
			if (activeFolder) q = q.eq("folder_id", activeFolder);
			return (await q).data ?? [];
		}
	});
	async function upload(files) {
		if (!files || files.length === 0) return;
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		for (const file of Array.from(files)) {
			const path = `${user.id}/${plannerId}/${Date.now()}-${file.name}`;
			const { error: upErr } = await supabase.storage.from("planner-files").upload(path, file);
			if (upErr) {
				toast.error(upErr.message);
				continue;
			}
			const { error } = await supabase.from("documents").insert({
				planner_id: plannerId,
				user_id: user.id,
				folder_id: activeFolder,
				file_name: file.name,
				file_path: path,
				size_bytes: file.size,
				mime_type: file.type
			});
			if (error) toast.error(error.message);
		}
		toast.success("Uploaded");
		qc.invalidateQueries({ queryKey: ["docs", plannerId] });
	}
	async function download(doc) {
		const { data, error } = await supabase.storage.from("planner-files").createSignedUrl(doc.file_path, 60);
		if (error) return toast.error(error.message);
		window.open(data.signedUrl, "_blank");
	}
	async function remove(doc) {
		if (!confirm(`Delete "${doc.file_name}"?`)) return;
		await supabase.storage.from("planner-files").remove([doc.file_path]);
		await supabase.from("documents").delete().eq("id", doc.id);
		qc.invalidateQueries({ queryKey: ["docs", plannerId] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Vault"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Invoices, receipts, contracts — private and encrypted at rest."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileRef,
					type: "file",
					multiple: true,
					hidden: true,
					onChange: (e) => upload(e.target.files)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => fileRef.current?.click(),
					className: "glow-emerald",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4 mr-1" }), "Upload"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[240px_1fr] gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-hairline bg-card p-2 h-fit",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setActiveFolder(null),
					className: `w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${!activeFolder ? "bg-elevated" : "hover:bg-elevated/60"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "h-4 w-4" }), "All files"]
				}), folders.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setActiveFolder(f.id),
					className: `w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${activeFolder === f.id ? "bg-elevated" : "hover:bg-elevated/60"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "h-4 w-4" }), f.name]
				}, f.id))]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-hairline bg-card overflow-hidden",
				children: docs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-16 text-center text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-8 w-8 mx-auto mb-3 opacity-40" }), "Drop files or click Upload to get started."]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: docs.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-4 py-3 border-b border-hairline last:border-0 hover:bg-elevated/40 group",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium truncate",
								children: d.file_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [d.size_bytes ? `${(d.size_bytes / 1024).toFixed(1)} KB · ` : "", new Date(d.created_at).toLocaleDateString()]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => download(d),
							className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => remove(d),
							className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
						})
					]
				}, d.id)) })
			})]
		})]
	});
}
//#endregion
export { VaultPage as component };
