import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, Copy, Search } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";

type ColumnDef<T> = {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (row: T, onChange: (patch: Partial<T>) => void) => React.ReactNode;
};

type BaseRow = { id: string; [k: string]: unknown };

export function EditableTable<T extends BaseRow>({
  table, rows, columns, invalidateKeys, planner_id, user_id, onNewRow, currency = "USD",
  totals,
}: {
  table: string;
  rows: T[];
  columns: ColumnDef<T>[];
  invalidateKeys: string[][];
  planner_id: string;
  user_id: string;
  onNewRow: () => Partial<T>;
  currency?: string;
  totals?: { amountKey: keyof T; label: string };
}) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState<Record<string, Partial<T>>>({});

  useEffect(() => {
    const t = setTimeout(async () => {
      const entries = Object.entries(dirty);
      if (entries.length === 0) return;
      for (const [id, patch] of entries) {
        // @ts-expect-error dynamic table name
        const { error } = await supabase.from(table).update(patch).eq("id", id);
        if (error) toast.error(error.message);
      }
      setDirty({});
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
    }, 600);
    return () => clearTimeout(t);
  }, [dirty, table, qc, invalidateKeys]);

  function patchRow(id: string, patch: Partial<T>) {
    setDirty((d) => ({ ...d, [id]: { ...(d[id] ?? {}), ...patch } }));
  }

  async function addRow() {
    const insert = { ...onNewRow(), planner_id, user_id };
    // @ts-expect-error dynamic table name
    const { error } = await supabase.from(table).insert(insert);
    if (error) return toast.error(error.message);
    invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
  }

  async function deleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} row(s)?`)) return;
    // @ts-expect-error dynamic table name
    const { error } = await supabase.from(table).delete().in("id", Array.from(selected));
    if (error) return toast.error(error.message);
    setSelected(new Set());
    invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
  }

  async function duplicateSelected() {
    const toDup = rows.filter((r) => selected.has(r.id));
    if (toDup.length === 0) return;
    const inserts = toDup.map((r) => {
      const { id, created_at, updated_at, ...rest } = r as Record<string, unknown>;
      void id; void created_at; void updated_at;
      return { ...rest, planner_id, user_id };
    });
    // @ts-expect-error dynamic
    const { error } = await supabase.from(table).insert(inserts);
    if (error) return toast.error(error.message);
    setSelected(new Set());
    invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
  }

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q));
  });

  const totalAmount = totals ? filtered.reduce((s, r) => s + Number((r[totals.amountKey] as number | string | null) ?? 0), 0) : 0;

  return (
    <div className="rounded-2xl border border-hairline bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-8 h-9 bg-background border-hairline" />
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} rows</div>
        {selected.size > 0 && (
          <>
            <Button size="sm" variant="ghost" onClick={duplicateSelected}><Copy className="h-4 w-4 mr-1" />Duplicate</Button>
            <Button size="sm" variant="ghost" onClick={deleteSelected} className="text-destructive"><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
          </>
        )}
        <Button size="sm" onClick={addRow} className="glow-emerald"><Plus className="h-4 w-4 mr-1" />New</Button>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-260px)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground bg-card sticky-th">
              <th className="w-8 p-2 border-b border-hairline">
                <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={(c) => setSelected(c ? new Set(filtered.map((r) => r.id)) : new Set())} />
              </th>
              {columns.map((c) => (
                <th key={String(c.key)} className="text-left font-medium p-2 border-b border-hairline whitespace-nowrap" style={{ width: c.width }}>{c.label}</th>
              ))}
              <th className="w-8 p-2 border-b border-hairline"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={columns.length + 2} className="p-10 text-center text-sm text-muted-foreground">
                No rows yet. Click <span className="text-primary">New</span> to add one.
              </td></tr>
            )}
            {filtered.map((row) => {
              const merged = { ...row, ...(dirty[row.id] ?? {}) } as T;
              return (
                <tr key={row.id} className="hover:bg-elevated/60 group">
                  <td className="p-2 border-b border-hairline">
                    <Checkbox checked={selected.has(row.id)} onCheckedChange={(c) => {
                      setSelected((s) => { const n = new Set(s); if (c) n.add(row.id); else n.delete(row.id); return n; });
                    }} />
                  </td>
                  {columns.map((c) => (
                    <td key={String(c.key)} className="p-1 border-b border-hairline align-top">
                      {c.render
                        ? c.render(merged, (patch) => patchRow(row.id, patch))
                        : <CellInput value={String((merged as Record<string, unknown>)[c.key as string] ?? "")} onChange={(v) => patchRow(row.id, { [c.key]: v } as Partial<T>)} />}
                    </td>
                  ))}
                  <td className="p-1 border-b border-hairline">
                    <button onClick={async () => {
                      // @ts-expect-error dynamic
                      const { error } = await supabase.from(table).delete().eq("id", row.id);
                      if (error) toast.error(error.message);
                      else invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
                    }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {totals && filtered.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={columns.length + 2} className="p-3 text-right text-sm">
                  <span className="text-muted-foreground mr-3">{totals.label}</span>
                  <span className="font-display text-primary text-lg">{formatMoney(totalAmount, currency)}</span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export function CellInput({ value, onChange, type = "text", className = "" }: { value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      step={type === "number" ? "any" : undefined}
      className={`w-full bg-transparent px-2 py-1.5 text-sm outline-none focus:bg-elevated rounded-md focus:ring-1 focus:ring-primary/40 ${className}`}
    />
  );
}

export function CellSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-elevated px-2 focus:ring-1 focus:ring-primary/40"><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}
