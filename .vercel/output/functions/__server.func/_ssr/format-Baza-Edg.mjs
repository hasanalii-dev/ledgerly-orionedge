//#region node_modules/.nitro/vite/services/ssr/assets/format-Baza-Edg.js
function formatMoney(amount, currency = "USD", compact = false) {
	const n = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
	if (Number.isNaN(n)) return "—";
	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
			notation: compact ? "compact" : "standard",
			maximumFractionDigits: compact ? 1 : 2
		}).format(n);
	} catch {
		return `${currency} ${n.toFixed(2)}`;
	}
}
function formatDate(d, fmt = "medium") {
	if (!d) return "—";
	const date = typeof d === "string" ? new Date(d) : d;
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: fmt === "short" ? "short" : "short",
		day: "numeric"
	});
}
var CURRENCIES = [
	"USD",
	"EUR",
	"GBP",
	"PKR",
	"AED",
	"INR",
	"CAD",
	"AUD",
	"JPY"
];
var ACCOUNT_KINDS = [
	"bank",
	"wallet",
	"cash",
	"other"
];
var INCOME_STATUSES = [
	"pending",
	"advance",
	"partial",
	"paid",
	"refunded"
];
var INVOICE_STATUSES = [
	"pending",
	"sent",
	"paid",
	"overdue",
	"cancelled"
];
var PROJECT_STATUSES = [
	"active",
	"on-hold",
	"completed",
	"cancelled"
];
var DEFAULT_EXPENSE_CATEGORIES = [
	{
		name: "Marketing",
		color: "#3DDC97"
	},
	{
		name: "Software",
		color: "#7CC4FF"
	},
	{
		name: "Hosting",
		color: "#FFB86B"
	},
	{
		name: "Domains",
		color: "#B794F4"
	},
	{
		name: "Education",
		color: "#F687B3"
	},
	{
		name: "Hardware",
		color: "#68D391"
	},
	{
		name: "Office",
		color: "#F6AD55"
	},
	{
		name: "Internet",
		color: "#4FD1C5"
	},
	{
		name: "Phone",
		color: "#9F7AEA"
	},
	{
		name: "Transportation",
		color: "#F56565"
	},
	{
		name: "Food",
		color: "#ED8936"
	},
	{
		name: "Taxes",
		color: "#E53E3E"
	},
	{
		name: "Miscellaneous",
		color: "#A0AEC0"
	}
];
var DEFAULT_FOLDERS = [
	"Invoices",
	"Payment Proofs",
	"Receipts",
	"Contracts",
	"Tax Documents",
	"Other Documents"
];
//#endregion
export { INCOME_STATUSES as a, formatDate as c, DEFAULT_FOLDERS as i, formatMoney as l, CURRENCIES as n, INVOICE_STATUSES as o, DEFAULT_EXPENSE_CATEGORIES as r, PROJECT_STATUSES as s, ACCOUNT_KINDS as t };
