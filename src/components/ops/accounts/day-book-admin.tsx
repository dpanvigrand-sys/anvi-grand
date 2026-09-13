"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_LEDGER_ACCOUNTS } from "@/lib/accounts";
import { formatINR } from "@/lib/format";
import type { DayBookEntry } from "@/lib/types";

type Props = { initialRows: DayBookEntry[] };

function downloadCsv(filename: string, rows: DayBookEntry[]) {
  const headers = ["Date", "Voucher", "Particular", "Category", "Debit", "Credit", "Balance", "Notes", "ID"];
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.date, r.voucherNo, r.particular, r.category, r.debit, r.credit, r.balance, r.notes || "", r.id]
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

export function DayBookAdmin({ initialRows }: Props) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [rows, setRows] = useState(initialRows);
  const [mode, setMode] = useState<"day" | "month">("day");
  const [day, setDay] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: today,
    voucherNo: "",
    particular: "",
    debit: 0,
    credit: 0,
    category: "Cash",
    notes: "",
  });

  const filtered = useMemo(() => {
    return rows
      .filter((r) => (mode === "day" ? r.date === day : r.date.startsWith(month)))
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date) || a.voucherNo.localeCompare(b.voucherNo));
  }, [rows, mode, day, month]);

  const totals = useMemo(() => {
    let debit = 0;
    let credit = 0;
    for (const r of filtered) {
      debit += r.debit;
      credit += r.credit;
    }
    return { debit, credit, balance: debit - credit };
  }, [filtered]);

  function resetForm() {
    setEditId(null);
    setForm({
      date: today,
      voucherNo: "",
      particular: "",
      debit: 0,
      credit: 0,
      category: "Cash",
      notes: "",
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const body = { ...form, id: editId || undefined };
    const res = await fetch("/api/ops/accounts/day-book", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    if (!confirm("Delete this day book entry?")) return;
    const res = await fetch("/api/ops/accounts/day-book", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Delete failed");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (editId === id) resetForm();
    startTransition(() => router.refresh());
  }

  function startEdit(r: DayBookEntry) {
    setEditId(r.id);
    setForm({
      date: r.date,
      voucherNo: r.voucherNo,
      particular: r.particular,
      debit: r.debit,
      credit: r.credit,
      category: r.category,
      notes: r.notes || "",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/ops/accounts" className="text-sm text-[var(--ag-red)] hover:underline">
            ← Accounts
          </Link>
          <h1 className="mt-1 font-display text-4xl text-[var(--ag-ink)]">Day Book</h1>
          <p className="text-[var(--ag-muted)]">డే బుక్ · cash &amp; bank daily entries</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            className="rounded-none"
            onClick={() => downloadCsv(`day-book-${mode === "day" ? day : month}.csv`, filtered)}
          >
            Excel CSV
          </Button>
          <Button type="button" variant="outline" className="rounded-none" onClick={() => window.print()}>
            Print A4
          </Button>
        </div>
      </div>

      <form onSubmit={save} className="grid gap-3 border border-[var(--ag-line)] bg-white p-5 print:hidden md:grid-cols-3">
        <div className="grid gap-1">
          <Label>Date</Label>
          <Input type="date" required className="rounded-none" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="grid gap-1">
          <Label>Voucher no</Label>
          <Input className="rounded-none" value={form.voucherNo} placeholder="Auto if blank" onChange={(e) => setForm({ ...form, voucherNo: e.target.value })} />
        </div>
        <div className="grid gap-1">
          <Label>Category / account</Label>
          <select
            className="h-9 border border-[var(--ag-line)] bg-white px-2"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {DEFAULT_LEDGER_ACCOUNTS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-1 md:col-span-3">
          <Label>Particular</Label>
          <Input required className="rounded-none" value={form.particular} onChange={(e) => setForm({ ...form, particular: e.target.value })} />
        </div>
        <div className="grid gap-1">
          <Label>Debit (₹)</Label>
          <Input type="number" min={0} className="rounded-none" value={form.debit} onChange={(e) => setForm({ ...form, debit: Number(e.target.value) })} />
        </div>
        <div className="grid gap-1">
          <Label>Credit (₹)</Label>
          <Input type="number" min={0} className="rounded-none" value={form.credit} onChange={(e) => setForm({ ...form, credit: Number(e.target.value) })} />
        </div>
        <div className="grid gap-1">
          <Label>Notes</Label>
          <Input className="rounded-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex flex-wrap items-end gap-2 md:col-span-3">
          <Button type="submit" disabled={pending} className="rounded-none bg-[var(--ag-red)] text-white">
            {editId ? "Update entry" : "Add entry"}
          </Button>
          {editId ? (
            <Button type="button" variant="outline" className="rounded-none" onClick={resetForm}>
              Cancel edit
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
              className={`px-3 py-1.5 text-sm ${mode === m ? "bg-[var(--ag-red)] text-white" : "border border-[var(--ag-line)] bg-white"}`}
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

      <div ref={printRef} className="overflow-x-auto border border-[var(--ag-line)] bg-white">
        <div className="border-b border-[var(--ag-line)] px-4 py-3">
          <p className="font-display text-xl">ANVI GRAND — Day Book</p>
          <p className="text-sm text-[var(--ag-muted)]">
            {mode === "day" ? day : month} · Debit {formatINR(totals.debit)} · Credit {formatINR(totals.credit)} · Net {formatINR(totals.balance)}
          </p>
        </div>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[var(--ag-soft)] text-xs uppercase tracking-wide text-[var(--ag-muted)]">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Voucher</th>
              <th className="px-3 py-2">Particular</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2 text-right">Debit</th>
              <th className="px-3 py-2 text-right">Credit</th>
              <th className="px-3 py-2 text-right">Balance</th>
              <th className="px-3 py-2 print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-[var(--ag-muted)]">
                  No entries for this period.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t border-[var(--ag-line)]">
                  <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                  <td className="px-3 py-2">{r.voucherNo}</td>
                  <td className="px-3 py-2">
                    <p>{r.particular}</p>
                    {r.notes ? <p className="text-xs text-[var(--ag-muted)]">{r.notes}</p> : null}
                  </td>
                  <td className="px-3 py-2">{r.category}</td>
                  <td className="px-3 py-2 text-right">{r.debit ? formatINR(r.debit) : "—"}</td>
                  <td className="px-3 py-2 text-right">{r.credit ? formatINR(r.credit) : "—"}</td>
                  <td className="px-3 py-2 text-right">{formatINR(r.balance)}</td>
                  <td className="px-3 py-2 print:hidden">
                    <div className="flex gap-2">
                      <button type="button" className="text-[var(--ag-red)] hover:underline" onClick={() => startEdit(r)}>
                        Edit
                      </button>
                      <button type="button" className="text-[var(--ag-muted)] hover:underline" onClick={() => remove(r.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
