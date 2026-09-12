"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toJpeg } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";
import type { FoodOrder, RoomBooking } from "@/lib/types";

export type BookingRow = {
  id: string;
  kind: "room" | "food";
  date: string;
  personName: string;
  address: string;
  phone: string;
  link: string;
  total: number;
  advance: number;
  balance: number;
  status: string;
  detail: string;
};

type Props = {
  initialRows: BookingRow[];
};

function toDateKey(iso: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function rowsToCsv(rows: BookingRow[]) {
  const headers = [
    "Date",
    "Type",
    "Person name",
    "Address",
    "Phone",
    "Booking / order",
    "Detail",
    "Total",
    "Advance",
    "Balance",
    "Status",
    "ID",
  ];
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.date,
        r.kind === "room" ? "Rooms booking" : "Food booking",
        r.personName,
        r.address,
        r.phone,
        r.link,
        r.detail,
        r.total,
        r.advance,
        r.balance,
        r.status,
        r.id,
      ]
        .map(escape)
        .join(","),
    ),
  ];
  return "\uFEFF" + lines.join("\n");
}

export function BookingsAdmin({ initialRows }: Props) {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(initialRows);
  const [kind, setKind] = useState<"all" | "room" | "food">("all");
  const [mode, setMode] = useState<"day" | "month" | "range">("day");
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [day, setDay] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    personName: "",
    address: "",
    phone: "",
    advance: 0,
    balance: 0,
  });

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (kind !== "all" && r.kind !== kind) return false;
      const d = toDateKey(r.date);
      if (mode === "day") return d === day;
      if (mode === "month") return monthKey(d) === month;
      return d >= from && d <= to;
    });
  }, [rows, kind, mode, day, month, from, to]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => ({
        total: acc.total + r.total,
        advance: acc.advance + r.advance,
        balance: acc.balance + r.balance,
      }),
      { total: 0, advance: 0, balance: 0 },
    );
  }, [filtered]);

  const title = useMemo(() => {
    const type =
      kind === "room" ? "Rooms" : kind === "food" ? "Food" : "Rooms + Food";
    if (mode === "day") return `${type} bookings · ${day}`;
    if (mode === "month") return `${type} bookings · ${month}`;
    return `${type} bookings · ${from} → ${to}`;
  }, [kind, mode, day, month, from, to]);

  function startEdit(row: BookingRow) {
    setEditId(row.id);
    setDraft({
      personName: row.personName,
      address: row.address,
      phone: row.phone,
      advance: row.advance,
      balance: row.balance,
    });
    setMessage("");
    setError("");
  }

  async function saveEdit(row: BookingRow) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/ops/bookings/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: draft.personName,
          address: draft.address,
          phone: draft.phone,
          advance: draft.advance,
          balance: draft.balance,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const saved = (data.booking || data.order) as RoomBooking | FoodOrder;
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                personName: saved.guestName,
                address: saved.address || "",
                phone: saved.phone,
                advance: saved.advance ?? 0,
                balance: saved.balance ?? 0,
              }
            : r,
        ),
      );
      setEditId(null);
      setMessage(`Saved ${row.id}`);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function downloadExcel() {
    const csv = rowsToCsv(filtered);
    downloadBlob(
      `anvi-bookings-${mode}-${day || month}.csv`,
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    setMessage("Excel-compatible CSV downloaded.");
  }

  function printA4() {
    window.print();
  }

  async function exportJpg() {
    if (!reportRef.current) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = await toJpeg(reportRef.current, {
        quality: 0.92,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `anvi-bookings-${mode}.jpg`;
      a.click();
      setMessage("JPG report exported.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "JPG export failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap gap-3">
        <div className="grid gap-1">
          <Label>Type</Label>
          <select
            className="h-9 border border-[var(--ag-line)] bg-white px-2 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
          >
            <option value="all">Rooms + Food</option>
            <option value="room">Rooms only</option>
            <option value="food">Food only</option>
          </select>
        </div>
        <div className="grid gap-1">
          <Label>View</Label>
          <select
            className="h-9 border border-[var(--ag-line)] bg-white px-2 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
          >
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
            <option value="range">Date range</option>
          </select>
        </div>
        {mode === "day" ? (
          <div className="grid gap-1">
            <Label>Date</Label>
            <Input
              type="date"
              className="h-9 rounded-none"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>
        ) : null}
        {mode === "month" ? (
          <div className="grid gap-1">
            <Label>Month</Label>
            <Input
              type="month"
              className="h-9 rounded-none"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
        ) : null}
        {mode === "range" ? (
          <>
            <div className="grid gap-1">
              <Label>From</Label>
              <Input
                type="date"
                className="h-9 rounded-none"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <Label>To</Label>
              <Input
                type="date"
                className="h-9 rounded-none"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="no-print flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy || filtered.length === 0}
          onClick={downloadExcel}
          className="h-9 rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          Download Excel
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy || filtered.length === 0}
          onClick={printA4}
          className="h-9 rounded-none border-[var(--ag-red)] text-[var(--ag-red)]"
        >
          Print A4
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy || filtered.length === 0}
          onClick={() => void exportJpg()}
          className="h-9 rounded-none"
        >
          Export JPG
        </Button>
      </div>

      {message ? <p className="no-print text-sm text-emerald-700">{message}</p> : null}
      {error ? (
        <p role="alert" className="no-print text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div
        ref={reportRef}
        className="bookings-report border border-[var(--ag-line)] bg-white p-5 md:p-6"
      >
        <div className="border-b border-[var(--ag-line)] pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
            ANVI GRAND · Booking register
          </p>
          <h2 className="mt-1 font-display text-3xl text-[var(--ag-ink)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            {filtered.length} record{filtered.length === 1 ? "" : "s"} · Total{" "}
            {formatINR(totals.total)} · Advance {formatINR(totals.advance)} ·
            Balance {formatINR(totals.balance)}
            {pending ? " · refreshing…" : ""}
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-[var(--ag-muted)]">
            No bookings in this date view.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--ag-line)] text-xs uppercase tracking-[0.12em] text-[var(--ag-muted)]">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Person</th>
                  <th className="py-2 pr-3">Address</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Link</th>
                  <th className="py-2 pr-3 text-right">Total</th>
                  <th className="py-2 pr-3 text-right">Advance</th>
                  <th className="py-2 pr-3 text-right">Balance</th>
                  <th className="no-print py-2">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--ag-line)] align-top">
                    <td className="py-3 pr-3 whitespace-nowrap">{row.date}</td>
                    <td className="py-3 pr-3">
                      {row.kind === "room" ? "Rooms" : "Food"}
                    </td>
                    <td className="py-3 pr-3">
                      {editId === row.id ? (
                        <Input
                          className="h-8 rounded-none"
                          value={draft.personName}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, personName: e.target.value }))
                          }
                        />
                      ) : (
                        <span className="font-medium text-[var(--ag-ink)]">
                          {row.personName}
                        </span>
                      )}
                      <p className="mt-0.5 text-xs text-[var(--ag-muted)]">{row.detail}</p>
                    </td>
                    <td className="py-3 pr-3 max-w-[180px]">
                      {editId === row.id ? (
                        <Input
                          className="h-8 rounded-none"
                          value={draft.address}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, address: e.target.value }))
                          }
                        />
                      ) : (
                        row.address || "—"
                      )}
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      {editId === row.id ? (
                        <Input
                          className="h-8 rounded-none"
                          value={draft.phone}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, phone: e.target.value }))
                          }
                        />
                      ) : (
                        <a href={`tel:${row.phone}`} className="text-[var(--ag-red)]">
                          {row.phone}
                        </a>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <a
                        href={row.link}
                        className="text-[var(--ag-red)] underline-offset-2 hover:underline"
                      >
                        {row.id}
                      </a>
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      {formatINR(row.total)}
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      {editId === row.id ? (
                        <Input
                          type="number"
                          className="h-8 rounded-none text-right"
                          value={draft.advance}
                          onChange={(e) => {
                            const advance = Number(e.target.value) || 0;
                            setDraft((d) => ({
                              ...d,
                              advance,
                              balance: Math.max(0, row.total - advance),
                            }));
                          }}
                        />
                      ) : (
                        formatINR(row.advance)
                      )}
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      {editId === row.id ? (
                        <Input
                          type="number"
                          className="h-8 rounded-none text-right"
                          value={draft.balance}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              balance: Number(e.target.value) || 0,
                            }))
                          }
                        />
                      ) : (
                        formatINR(row.balance)
                      )}
                    </td>
                    <td className="no-print py-3">
                      {editId === row.id ? (
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() => void saveEdit(row)}
                            className="h-8 rounded-none bg-[var(--ag-red)] px-2 text-xs text-white"
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() => setEditId(null)}
                            className="h-8 rounded-none px-2 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => startEdit(row)}
                          className="h-8 rounded-none px-2 text-xs"
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-[var(--ag-ink)]">
                  <td className="py-3" colSpan={6}>
                    Totals
                  </td>
                  <td className="py-3 text-right">{formatINR(totals.total)}</td>
                  <td className="py-3 text-right">{formatINR(totals.advance)}</td>
                  <td className="py-3 text-right">{formatINR(totals.balance)}</td>
                  <td className="no-print" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body * { visibility: hidden !important; }
          .bookings-report, .bookings-report * { visibility: visible !important; }
          .bookings-report {
            position: absolute; left: 0; top: 0; width: 100%;
            border: none !important; box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
