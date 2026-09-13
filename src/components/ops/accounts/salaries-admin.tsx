"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";
import type { SalaryEntry, SalaryPayStatus } from "@/lib/types";

type Props = { initialRows: SalaryEntry[] };

function downloadCsv(filename: string, rows: SalaryEntry[]) {
  const headers = ["Month", "Staff", "Basic", "Deductions", "Net", "Status", "Notes", "ID"];
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.month, r.staffName, r.basic, r.deductions, r.net, r.status, r.notes || "", r.id]
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

export function SalariesAdmin({ initialRows }: Props) {
  const router = useRouter();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [rows, setRows] = useState(initialRows);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    month: today.slice(0, 7),
    staffName: "",
    basic: 0,
    deductions: 0,
    status: "pending" as SalaryPayStatus,
    notes: "",
  });

  const filtered = useMemo(
    () =>
      rows
        .filter((r) => r.month === month)
        .sort((a, b) => a.staffName.localeCompare(b.staffName)),
    [rows, month],
  );

  const totals = useMemo(() => {
    let basic = 0;
    let deductions = 0;
    let net = 0;
    let pendingPay = 0;
    for (const r of filtered) {
      basic += r.basic;
      deductions += r.deductions;
      net += r.net;
      if (r.status === "pending") pendingPay += r.net;
    }
    return { basic, deductions, net, pendingPay };
  }, [filtered]);

  function resetForm() {
    setEditId(null);
    setForm({
      month,
      staffName: "",
      basic: 0,
      deductions: 0,
      status: "pending",
      notes: "",
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/ops/accounts/salaries", {
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
    if (!confirm("Delete salary row?")) return;
    const res = await fetch("/api/ops/accounts/salaries", {
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
          <h1 className="mt-1 font-display text-4xl text-[var(--ag-ink)]">Salaries</h1>
          <p className="text-[var(--ag-muted)]">జీతాలు · monthly salary register</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            className="rounded-none"
            onClick={() => downloadCsv(`salaries-${month}.csv`, filtered)}
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
          <Label>Month</Label>
          <Input type="month" required className="rounded-none" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
        </div>
        <div className="grid gap-1">
          <Label>Staff name</Label>
          <Input required className="rounded-none" value={form.staffName} onChange={(e) => setForm({ ...form, staffName: e.target.value })} />
        </div>
        <div className="grid gap-1">
          <Label>Status</Label>
          <select
            className="h-9 border border-[var(--ag-line)] bg-white px-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as SalaryPayStatus })}
          >
            <option value="pending">Pending · పెండింగ్</option>
            <option value="paid">Paid · చెల్లించబడింది</option>
          </select>
        </div>
        <div className="grid gap-1">
          <Label>Basic (₹)</Label>
          <Input type="number" min={0} required className="rounded-none" value={form.basic} onChange={(e) => setForm({ ...form, basic: Number(e.target.value) })} />
        </div>
        <div className="grid gap-1">
          <Label>Deductions (₹)</Label>
          <Input type="number" min={0} className="rounded-none" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: Number(e.target.value) })} />
        </div>
        <div className="grid gap-1">
          <Label>Notes</Label>
          <Input className="rounded-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-3">
          <Button type="submit" disabled={pending} className="rounded-none bg-[var(--ag-red)] text-white">
            {editId ? "Update salary" : "Add salary"}
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
        <div className="grid gap-1">
          <Label>View month</Label>
          <Input type="month" className="w-auto rounded-none" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <p className="text-sm text-[var(--ag-muted)]">
          Net {formatINR(totals.net)} · Pending pay {formatINR(totals.pendingPay)}
        </p>
      </div>

      <div className="overflow-x-auto border border-[var(--ag-line)] bg-white">
        <div className="border-b border-[var(--ag-line)] px-4 py-3">
          <p className="font-display text-xl">ANVI GRAND — Salary register · {month}</p>
          <p className="text-sm text-[var(--ag-muted)]">
            Basic {formatINR(totals.basic)} · Deductions {formatINR(totals.deductions)} · Net {formatINR(totals.net)}
          </p>
        </div>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[var(--ag-soft)] text-xs uppercase tracking-wide text-[var(--ag-muted)]">
            <tr>
              <th className="px-3 py-2">Staff</th>
              <th className="px-3 py-2 text-right">Basic</th>
              <th className="px-3 py-2 text-right">Deductions</th>
              <th className="px-3 py-2 text-right">Net</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2 print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-[var(--ag-muted)]">
                  No salary rows for this month.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t border-[var(--ag-line)]">
                  <td className="px-3 py-2 font-medium">{r.staffName}</td>
                  <td className="px-3 py-2 text-right">{formatINR(r.basic)}</td>
                  <td className="px-3 py-2 text-right">{formatINR(r.deductions)}</td>
                  <td className="px-3 py-2 text-right">{formatINR(r.net)}</td>
                  <td className="px-3 py-2">
                    <span className={r.status === "paid" ? "text-[var(--ag-maroon)]" : "text-[var(--ag-red)]"}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[var(--ag-muted)]">{r.notes || "—"}</td>
                  <td className="px-3 py-2 print:hidden">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-[var(--ag-red)] hover:underline"
                        onClick={() => {
                          setEditId(r.id);
                          setForm({
                            month: r.month,
                            staffName: r.staffName,
                            basic: r.basic,
                            deductions: r.deductions,
                            status: r.status,
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
