"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PURCHASE_TYPES, isPurchaseType, purchaseTypeLabel } from "@/lib/accounts";
import { formatINR } from "@/lib/format";
import type { PurchaseEntry, PurchaseType } from "@/lib/types";

type Props = { initialRows: PurchaseEntry[]; initialType?: string };

function downloadCsv(filename: string, rows: PurchaseEntry[]) {
  const headers = ["Date", "Type", "Item", "Vendor", "Qty", "Unit", "Amount", "Notes", "ID"];
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.date, r.type, r.item, r.vendor, r.qty, r.unit, r.amount, r.notes || "", r.id]
        .map(escape)
        .join(","),
    ),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PurchasesAdmin({ initialRows, initialType }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const typeFromUrl = searchParams.get("type") || initialType || "all";
  const [rows, setRows] = useState(initialRows);
  const [type, setType] = useState<string>(
    isPurchaseType(typeFromUrl) || typeFromUrl === "all" ? typeFromUrl : "all",
  );
  const [mode, setMode] = useState<"day" | "month">("month");
  const [day, setDay] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: today,
    type: (isPurchaseType(typeFromUrl) ? typeFromUrl : "groceries") as PurchaseType,
    item: "",
    vendor: "",
    qty: 1,
    unit: "pcs",
    amount: 0,
    notes: "",
  });

  const filtered = useMemo(() => {
    return rows
      .filter((r) => {
        if (type !== "all" && r.type !== type) return false;
        if (mode === "day") return r.date === day;
        return r.date.startsWith(month);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [rows, type, mode, day, month]);

  const totalAmount = useMemo(
    () => filtered.reduce((s, r) => s + r.amount, 0),
    [filtered],
  );

  function setTypeFilter(next: string) {
    setType(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("type");
    else params.set("type", next);
    const q = params.toString();
    router.replace(q ? `/ops/accounts/purchases?${q}` : "/ops/accounts/purchases");
  }

  function resetForm() {
    setEditId(null);
    setForm({
      date: today,
      type: (isPurchaseType(type) ? type : "groceries") as PurchaseType,
      item: "",
      vendor: "",
      qty: 1,
      unit: "pcs",
      amount: 0,
      notes: "",
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/ops/accounts/purchases", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editId || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setRows((prev) => {
      if (editId) return prev.map((r) => (r.id === editId ? data.entry : r));
      return [data.entry, ...prev];
    });
    resetForm();
    startTransition(() => router.refresh());
  }

  async function remove(id: string) {
    if (!confirm("Delete purchase row?")) return;
    const res = await fetch("/api/ops/accounts/purchases", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/ops/accounts" className="text-sm text-[var(--ag-red)] hover:underline">
            ← Accounts
          </Link>
          <h1 className="mt-1 font-display text-4xl text-[var(--ag-ink)]">Purchases</h1>
          <p className="text-[var(--ag-muted)]">Groceries, kitchen, dhobi, linen, supplies</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            className="rounded-none"
            onClick={() =>
              downloadCsv(
                `purchases-${type}-${mode === "day" ? day : month}.csv`,
                filtered,
              )
            }
          >
            Excel CSV
          </Button>
          <Button type="button" variant="outline" className="rounded-none" onClick={() => window.print()}>
            Print A4
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={() => setTypeFilter("all")}
          className={`px-3 py-1.5 text-sm ${type === "all" ? "bg-[var(--ag-red)] text-white" : "border border-[var(--ag-line)] bg-white"}`}
        >
          All
        </button>
        {PURCHASE_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTypeFilter(t.id)}
            className={`px-3 py-1.5 text-sm ${type === t.id ? "bg-[var(--ag-red)] text-white" : "border border-[var(--ag-line)] bg-white"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="grid gap-3 border border-[var(--ag-line)] bg-white p-5 print:hidden md:grid-cols-3">
        <div className="grid gap-1">
          <Label>Date</Label>
          <Input type="date" required className="rounded-none" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="grid gap-1">
          <Label>Type</Label>
          <select
            className="h-9 border border-[var(--ag-line)] bg-white px-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as PurchaseType })}
          >
            {PURCHASE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <Label>Vendor</Label>
          <Input className="rounded-none" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
        </div>
        <div className="grid gap-1 md:col-span-2">
          <Label>Item</Label>
          <Input required className="rounded-none" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
        </div>
        <div className="grid gap-1">
          <Label>Amount (₹)</Label>
          <Input type="number" min={0} required className="rounded-none" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
        </div>
        <div className="grid gap-1">
          <Label>Qty</Label>
          <Input type="number" min={0} className="rounded-none" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} />
        </div>
        <div className="grid gap-1">
          <Label>Unit</Label>
          <Input className="rounded-none" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        </div>
        <div className="grid gap-1">
          <Label>Notes</Label>
          <Input className="rounded-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-3">
          <Button type="submit" disabled={pending} className="rounded-none bg-[var(--ag-red)] text-white">
            {editId ? "Update purchase" : "Add purchase"}
          </Button>
          {editId ? (
            <Button type="button" variant="outline" className="rounded-none" onClick={resetForm}>
              Cancel
            </Button>
          ) : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </form>

      <div className="flex flex-wrap items-end gap-3 print:hidden">
        <div className="flex gap-1">
          {(["day", "month"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-sm ${mode === m ? "bg-[var(--ag-maroon)] text-white" : "border border-[var(--ag-line)] bg-white"}`}
            >
              {m === "day" ? "Daily" : "Monthly"}
            </button>
          ))}
        </div>
        {mode === "day" ? (
          <Input type="date" className="w-auto rounded-none" value={day} onChange={(e) => setDay(e.target.value)} />
        ) : (
          <Input type="month" className="w-auto rounded-none" value={month} onChange={(e) => setMonth(e.target.value)} />
        )}
      </div>

      <div className="overflow-x-auto border border-[var(--ag-line)] bg-white">
        <div className="border-b border-[var(--ag-line)] px-4 py-3">
          <p className="font-display text-xl">
            ANVI GRAND — Purchases
            {type !== "all" ? ` · ${purchaseTypeLabel(type as PurchaseType).label}` : ""}
          </p>
          <p className="text-sm text-[var(--ag-muted)]">
            {mode === "day" ? day : month} · Total {formatINR(totalAmount)} · {filtered.length} lines
          </p>
        </div>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[var(--ag-soft)] text-xs uppercase tracking-wide text-[var(--ag-muted)]">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-[var(--ag-muted)]">
                  No purchases for this filter.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const label = purchaseTypeLabel(r.type);
                return (
                  <tr key={r.id} className="border-t border-[var(--ag-line)]">
                    <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                    <td className="px-3 py-2">{label.label}</td>
                    <td className="px-3 py-2">
                      <p>{r.item}</p>
                      {r.notes ? <p className="text-xs text-[var(--ag-muted)]">{r.notes}</p> : null}
                    </td>
                    <td className="px-3 py-2">{r.vendor || "—"}</td>
                    <td className="px-3 py-2 text-right">
                      {r.qty} {r.unit}
                    </td>
                    <td className="px-3 py-2 text-right">{formatINR(r.amount)}</td>
                    <td className="px-3 py-2 print:hidden">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-[var(--ag-red)] hover:underline"
                          onClick={() => {
                            setEditId(r.id);
                            setForm({
                              date: r.date,
                              type: r.type,
                              item: r.item,
                              vendor: r.vendor,
                              qty: r.qty,
                              unit: r.unit,
                              amount: r.amount,
                              notes: r.notes || "",
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button type="button" className="text-[var(--ag-muted)] hover:underline" onClick={() => remove(r.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-[var(--ag-muted)] print:hidden">
        Stock movement books stay separate:{" "}
        <Link href="/ops/inward" className="text-[var(--ag-red)] hover:underline">
          Inward
        </Link>
        {" · "}
        <Link href="/ops/outward" className="text-[var(--ag-red)] hover:underline">
          Outward
        </Link>
        {" · "}
        <Link href="/ops/admin/stock-reports" className="text-[var(--ag-red)] hover:underline">
          Stock reports
        </Link>
      </p>
    </div>
  );
}
