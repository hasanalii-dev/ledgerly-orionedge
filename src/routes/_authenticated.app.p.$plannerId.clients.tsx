import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableTable, CellInput, CellSelect } from "@/components/editable-table";
import { useEffect, useState } from "react";
import { usePlannerCurrency } from "@/hooks/use-planner-currency";
import { Users, Ticket, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/app/p/$plannerId/clients")({
  component: ClientsPage,
});

type Row = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  payment_status: string | null;
  amount_paid: number | null;
  member_count: number | null;
  payment_type: string | null;
  payment_proof_url: string | null;
};

const PAYMENT_STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
];

function ClientsPage() {
  const { plannerId } = Route.useParams();
  const [uid, setUid] = useState("");
  const currency = usePlannerCurrency(plannerId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? ""));
  }, []);

  const { data: planner } = useQuery({
    queryKey: ["planner", plannerId],
    queryFn: async () => {
      const { data } = await supabase.from("planners").select("*").eq("id", plannerId).maybeSingle();
      return data;
    },
  });

  const workspaceType = planner?.workspace_type || "personal";
  const isSociety = workspaceType === "society";

  const { data: rows = [] } = useQuery({
    queryKey: ["clients", plannerId],
    queryFn: async () => (await supabase.from("clients").select("*").eq("planner_id", plannerId).order("name")).data as Row[] ?? [],
  });

  const pageTitle = isSociety ? "Participants" : (planner?.custom_config?.clientTerm || "Clients");
  const pageSubtitle = isSociety
    ? "Track event participants, pass counts, payment status (paid/unpaid), cash or online payment, and proof links."
    : "People and companies you work with.";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          {isSociety ? (
            <Ticket className="h-7 w-7 text-[#3DDC97]" />
          ) : (
            <Users className="h-7 w-7 text-[#3DDC97]" />
          )}
          {pageTitle}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{pageSubtitle}</p>
      </div>

      {isSociety ? (
        <EditableTable<Row>
          table="clients"
          rows={rows}
          planner_id={plannerId}
          user_id={uid}
          currency={currency}
          invalidateKeys={[["clients", plannerId]]}
          onNewRow={() => ({
            name: "New Participant",
            payment_status: "unpaid",
            amount_paid: 0,
            member_count: 1,
            payment_type: "cash",
            payment_proof_url: "",
          })}
          columns={[
            {
              key: "name",
              label: "Participant Name",
              render: (r, on) => <CellInput value={r.name ?? ""} onChange={(v) => on({ name: v })} />,
            },
            {
              key: "payment_status",
              label: "Status",
              width: "140px",
              render: (r, on) => (
                <div className="flex items-center gap-1.5">
                  <CellSelect
                    value={r.payment_status ?? "unpaid"}
                    onChange={(v) => on({ payment_status: v })}
                    options={PAYMENT_STATUS_OPTIONS}
                  />
                  {r.payment_status === "paid" ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0.5 shrink-0">
                      <CheckCircle2 className="h-3 w-3 mr-0.5 inline" /> Paid
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0.5 shrink-0">
                      <Clock className="h-3 w-3 mr-0.5 inline" /> Unpaid
                    </Badge>
                  )}
                </div>
              ),
            },
            {
              key: "amount_paid",
              label: "Amount Paid",
              width: "130px",
              render: (r, on) => (
                <CellInput
                  type="number"
                  value={String(r.amount_paid ?? 0)}
                  onChange={(v) => on({ amount_paid: parseFloat(v) || 0 })}
                  className="text-right font-mono"
                />
              ),
            },
            {
              key: "member_count",
              label: "Members / Passes",
              width: "130px",
              render: (r, on) => (
                <CellInput
                  type="number"
                  value={String(r.member_count ?? 1)}
                  onChange={(v) => on({ member_count: parseInt(v, 10) || 1 })}
                  className="text-right font-mono"
                />
              ),
            },
            {
              key: "payment_type",
              label: "Payment Type",
              width: "130px",
              render: (r, on) => (
                <CellSelect
                  value={r.payment_type ?? "cash"}
                  onChange={(v) => on({ payment_type: v })}
                  options={PAYMENT_TYPE_OPTIONS}
                />
              ),
            },
            {
              key: "payment_proof_url",
              label: "Payment Screenshot / Link",
              width: "220px",
              render: (r, on) => (
                <div className="flex items-center gap-2 w-full">
                  <CellInput
                    value={r.payment_proof_url ?? ""}
                    onChange={(v) => on({ payment_proof_url: v })}
                    placeholder={r.payment_type === "online" ? "https://screenshot.link..." : "Optional"}
                    className="flex-1 text-xs"
                  />
                  {r.payment_proof_url?.trim() && (
                    <a
                      href={r.payment_proof_url.startsWith("http") ? r.payment_proof_url : `https://${r.payment_proof_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3DDC97] hover:text-[#3DDC97]/80 p-1.5 rounded-md hover:bg-white/5 transition-colors shrink-0"
                      title="Open Payment Screenshot Proof"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ),
            },
            {
              key: "phone",
              label: "Phone",
              width: "130px",
              render: (r, on) => <CellInput value={r.phone ?? ""} onChange={(v) => on({ phone: v })} />,
            },
            {
              key: "email",
              label: "Email",
              width: "180px",
              render: (r, on) => <CellInput value={r.email ?? ""} onChange={(v) => on({ email: v })} />,
            },
          ]}
        />
      ) : (
        <EditableTable<Row>
          table="clients"
          rows={rows}
          planner_id={plannerId}
          user_id={uid}
          currency={currency}
          invalidateKeys={[["clients", plannerId]]}
          onNewRow={() => ({ name: `New ${pageTitle.toLowerCase()}` })}
          columns={[
            { key: "name", label: "Name", render: (r, on) => <CellInput value={r.name ?? ""} onChange={(v) => on({ name: v })} /> },
            { key: "company", label: "Company / Brand", render: (r, on) => <CellInput value={r.company ?? ""} onChange={(v) => on({ company: v })} /> },
            { key: "email", label: "Email", render: (r, on) => <CellInput value={r.email ?? ""} onChange={(v) => on({ email: v })} /> },
            { key: "phone", label: "Phone", render: (r, on) => <CellInput value={r.phone ?? ""} onChange={(v) => on({ phone: v })} /> },
            { key: "notes", label: "Notes", render: (r, on) => <CellInput value={r.notes ?? ""} onChange={(v) => on({ notes: v })} /> },
          ]}
        />
      )}
    </div>
  );
}
