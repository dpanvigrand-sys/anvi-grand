"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toJpeg } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";
import type { StockRow } from "@/lib/stock-reports";
import type { StockMove } from "@/lib/types";

export type { StockRow };

type Props = {
  initialRows: StockRow[];
  fixedDirection?: "inward" | "outward";
  title?: string;
};

function toDateKey(iso: string) {
  return (iso || "").slice(0, 10);
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

function rowsToCsv(rows: StockRow[]) {
  const headers = [
    "Date",
    "Direction",
    "Item",
    "Supplier / party",
    "Qty",
    "Unit",
    "Amount",
    "Advance",
    "Balance",
    "Notes",
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
        r.direction,
        r.item,
        r.party,
        r.quantity,
        r.unit,
        r.amount,
        r.advance,
        r.balance,
        r.notes,
        r.id,
      ]
        .map(escape)
        .join(","),
    ),
  ];
  return "\uFEFF" + lines.join("\n");
}

export function StockReportsAdmin({
  initialRows,
  fixedDirection,
  title: titleProp,
}: Props) {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(initialRows);
  const [direction, setDirection] = useState<"all" | "inward" | "outward">(
    fixedDirection || "all",
  );
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
    item: "",
    party: "",
    quantity: 0,
    unit: "kg",
    amount: 0,
    advance: 0,
    balance: 0,
    notes: "",
    date: today,
  });

  const filtered = useMemo(() => {
    const dir = fixedDirection || direction;
    return rows.filter((r) => {
      if (dir !== "all" && r.direction !== dir) return false;
      const d = toDateKey(r.date);
      if (mode === "day") return d === day;
      if (mode === "month") return monthKey(d) === month;
      return d >= from && d <= to;
    });
  }, [rows, direction, fixedDirection, mode, day, month, from, to]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, r) => ({
          amount: acc.amount + r.amount,
          advance: acc.advance + r.advance,
          balance: acc.balance + r.balance,
          qty: acc.qty + r.quantity,
        }),
        { amount: 0, advance: 0, balance: 0, qty: 0 },
      ),
    [filtered],
  );

  const title = useMemo(() => {
    if (titleProp) return titleProp;
    const type =
      (fixedDirection || direction) === "inward"
        ? "Inward"
        : (fixedDirection || direction) === "outward"
          ? "Outward"
          : "Inward + Outward";
    if (mode === "day") return `${type} stock · ${day}`;
    if (mode === "month") return `${type} stock · ${month}`;
    return `${type} stock · ${from} → ${to}`;
  }, [titleProp, fixedDirection, direction, mode, day, month, from, to]);

  function startEdit(row: StockRow) {
    setEditId(row.id);
    setDraft({
      item: row.item,
      party: row.party,
      quantity: row.quantity,
      unit: row.unit,
      amount: row.amount,
      advance: row.advance,
      balance: row.balance,
      notes: row.notes,
      date: row.date,
    });
    setMessage("");
    setError("");
  }

  async function saveEdit(row: StockRow) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/ops/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: row.id,
          item: draft.item,
          vendorOrDept: draft.party,
          quantity: draft.quantity,
          unit: draft.unit,
          amount: draft.amount,
          advance: draft.advance,
          balance: draft.balance,
          notes: draft.notes,
          date: draft.date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const saved = data.move as StockMove;
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                item: saved.item,
                party: saved.vendorOrDept,
                quantity: saved.quantity,
                unit: saved.unit,
                amount: saved.amount ?? 0,
                advance: saved.advance ?? 0,
                balance: saved.balance ?? 0,
                notes: saved.notes || "",
                date: (saved.date || saved.createdAt).slice(0, 10),
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
    downloadBlob(
      `anvi-stock-${fixedDirection || direction}-${mode}.csv`,
      new Blob([rowsToCsv(filtered)], { type: "text/csv;charset=utf-8" }),
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
      a.download = `anvi-stock-${fixedDirection || direction}-${mode}.jpg`;
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
        {!fixedDirection ? (
          <div className="grid gap-1">
            <Label>Type</Label>
            <select
              className="h-9 border border-[var(--ag-line)] bg-white px-2 text-sm"
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value as typeof direction)
              }
            >
              <option value="all">Inward + Outward</option>
              <option value="inward">Inward only</option>
              <option value="outward">Outward only</option>
            </select>
          </div>
        ) : null}
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

      {message ? (
        <p className="no-print text-sm text-emerald-700">{message}</p>
      ) : null}
      {error ? (
        <p role="alert" className="no-print text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div
        ref={reportRef}
        className="stock-report border border-[var(--ag-line)] bg-white p-5 md:p-6"
      >
        <div className="border-b border-[var(--ag-line)] pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
            ANVI GRAND · Stock register
          </p>
          <h2 className="mt-1 font-display text-3xl text-[var(--ag-ink)]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            {filtered.length} line{filtered.length === 1 ? "" : "s"} · Qty{" "}
            {totals.qty} · Amount {formatINR(totals.amount)} · Advance{" "}
            {formatINR(totals.advance)} · Balance {formatINR(totals.balance)}
            {pending ? " · refreshing…" : ""}
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-[var(--ag-muted)]">
            No stock moves in this date view. Add entries above or widen the
            filter.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--ag-line)] text-xs uppercase tracking-[0.12em] text-[var(--ag-muted)]">
                  <th className="py-2 pr-3">Date</th>
                  {!fixedDirection ? <th className="py-2 pr-3">Dir</th> : null}
                  <th className="py-2 pr-3">Item</th>
                  <th className="py-2 pr-3">Supplier / party</th>
                  <th className="py-2 pr-3 text-right">Qty</th>
                  <th className="py-2 pr-3 text-right">Amount</th>
                  <th className="py-2 pr-3 text-right">Advance</th>
                  <th className="py-2 pr-3 text-right">Balance</th>
                  <th className="py-2 pr-3">Notes</th>
                  <th className="no-print py-2">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--ag-line)] align-top"
                  >
                    <td className="py-3 pr-3 whitespace-nowrap">
                      {editId === row.id ? (
                        <Input
                          type="date"
                          className="h-8 rounded-none"
                          value={draft.date}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, date: e.target.value }))
                          }
                        />
                      ) : (
                        row.date
                      )}
                    </td>
                    {!fixedDirection ? (
                      <td className="py-3 pr-3 capitalize">{row.direction}</td>
                    ) : null}
                    <td className="py-3 pr-3">
                      {editId === row.id ? (
                        <Input
                          className="h-8 rounded-none"
                          value={draft.item}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, item: e.target.value }))
                          }
                        />
                      ) : (
                        <span className="font-medium">{row.item}</span>
                      )}
                      <p className="text-xs text-[var(--ag-muted)]">{row.id}</p>
                    </td>
                    <td className="max-w-[160px] py-3 pr-3">
                      {editId === row.id ? (
                        <Input
                          className="h-8 rounded-none"
                          value={draft.party}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, party: e.target.value }))
                          }
                        />
                      ) : (
                        row.party
                      )}
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      {editId === row.id ? (
                        <div className="flex justify-end gap-1">
                          <Input
                            type="number"
                            className="h-8 w-20 rounded-none text-right"
                            value={draft.quantity}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                quantity: Number(e.target.value) || 0,
                              }))
                            }
                          />
                          <Input
                            className="h-8 w-14 rounded-none"
                            value={draft.unit}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, unit: e.target.value }))
                            }
                          />
                        </div>
                      ) : (
                        `${row.quantity} ${row.unit}`
                      )}
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      {editId === row.id ? (
                        <Input
                          type="number"
                          className="h-8 rounded-none text-right"
                          value={draft.amount}
                          onChange={(e) => {
                            const amount = Number(e.target.value) || 0;
                            setDraft((d) => ({
                              ...d,
                              amount,
                              balance: Math.max(0, amount - d.advance),
                            }));
                          }}
                        />
                      ) : (
                        formatINR(row.amount)
                      )}
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
                              balance: Math.max(0, d.amount - advance),
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
                    <td className="max-w-[140px] py-3 pr-3">
                      {editId === row.id ? (
                        <Input
                          className="h-8 rounded-none"
                          value={draft.notes}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, notes: e.target.value }))
                          }
                        />
                      ) : (
                        row.notes || "—"
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
                  <td className="py-3" colSpan={fixedDirection ? 3 : 4}>
                    Totals
                  </td>
                  <td className="py-3 text-right">{totals.qty}</td>
                  <td className="py-3 text-right">{formatINR(totals.amount)}</td>
                  <td className="py-3 text-right">{formatINR(totals.advance)}</td>
                  <td className="py-3 text-right">{formatINR(totals.balance)}</td>
                  <td />
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
          .stock-report, .stock-report * { visibility: visible !important; }
          .stock-report {
            position: absolute; left: 0; top: 0; width: 100%;
            border: none !important; box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
