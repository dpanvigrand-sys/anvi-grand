"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MUSTER_STATUS_LABELS } from "@/lib/accounts";
import type { MusterEntry, MusterStatus } from "@/lib/types";

type Props = { initialRows: MusterEntry[] };

export function MusterAdmin({ initialRows }: Props) {
  const router = useRouter();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [rows, setRows] = useState(initialRows);
  const [day, setDay] = useState(today);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: today,
    staffName: "",
    status: "present" as MusterStatus,
    notes: "",
  });

  const filtered = useMemo(
    () => rows.filter((r) => r.date === day).sort((a, b) => a.staffName.localeCompare(b.staffName)),
    [rows, day],
  );

  const summary = useMemo(() => {
    const s = { present: 0, absent: 0, half: 0 };
    for (const r of filtered) s[r.status] += 1;
    return s;
  }, [filtered]);

  function resetForm() {
    setEditId(null);
    setForm({ date: day, staffName: "", status: "present", notes: "" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/ops/accounts/muster", {
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
    if (!confirm("Delete muster row?")) return;
    const res = await fetch("/api/ops/accounts/muster", {
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
          <h1 className="mt-1 font-display text-4xl text-[var(--ag-ink)]">Daily Muster</h1>
          <p className="text-[var(--ag-muted)]">డైలీ మస్టర్ · staff attendance</p>
        </div>
        <Button type="button" variant="outline" className="rounded-none print:hidden" onClick={() => window.print()}>
          Print A4
        </Button>
      </div>

      <form onSubmit={save} className="grid gap-3 border border-[var(--ag-line)] bg-white p-5 print:hidden md:grid-cols-4">
        <div className="grid gap-1">
          <Label>Date</Label>
          <Input type="date" required className="rounded-none" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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
            onChange={(e) => setForm({ ...form, status: e.target.value as MusterStatus })}
          >
            <option value="present">Present · హాజరు</option>
            <option value="absent">Absent · గైర్‌హాజరు</option>
            <option value="half">Half · సగం రోజు</option>
          </select>
        </div>
        <div className="grid gap-1">
          <Label>Notes</Label>
          <Input className="rounded-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-4">
          <Button type="submit" disabled={pending} className="rounded-none bg-[var(--ag-red)] text-white">
            {editId ? "Update" : "Add attendance"}
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
          <Label>View date</Label>
          <Input type="date" className="w-auto rounded-none" value={day} onChange={(e) => setDay(e.target.value)} />
        </div>
        <p className="text-sm text-[var(--ag-muted)]">
          Present {summary.present} · Half {summary.half} · Absent {summary.absent}
        </p>
      </div>

      <div className="overflow-x-auto border border-[var(--ag-line)] bg-white">
        <div className="border-b border-[var(--ag-line)] px-4 py-3">
          <p className="font-display text-xl">ANVI GRAND — Daily Muster · {day}</p>
        </div>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-[var(--ag-soft)] text-xs uppercase tracking-wide text-[var(--ag-muted)]">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2 print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-[var(--ag-muted)]">
                  No muster rows for this date.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t border-[var(--ag-line)]">
                  <td className="px-3 py-2 font-medium">{r.staffName}</td>
                  <td className="px-3 py-2">
                    {MUSTER_STATUS_LABELS[r.status].en} · {MUSTER_STATUS_LABELS[r.status].te}
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
                            date: r.date,
                            staffName: r.staffName,
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
