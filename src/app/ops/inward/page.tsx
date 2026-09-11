"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StockMove } from "@/lib/types";

function StockPage({ direction }: { direction: "inward" | "outward" }) {
  const [moves, setMoves] = useState<StockMove[]>([]);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("kg");
  const [vendorOrDept, setVendorOrDept] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ops = await (await fetch("/api/ops")).json();
      setMoves(direction === "inward" ? ops.inward || [] : ops.outward || []);
    } finally {
      setLoading(false);
    }
  }, [direction]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/ops/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction, item, quantity, unit, vendorOrDept, notes }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }
    setItem("");
    setQuantity(1);
    setNotes("");
    setMsg("Recorded.");
    await load();
  }

  const title = direction === "inward" ? "Inward" : "Outward";
  const partyLabel = direction === "inward" ? "Vendor" : "Department";

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--ag-chocolate)]">{title}</h1>
      <p className="mt-1 text-sm text-[var(--ag-muted)]">
        {direction === "inward" ? "Stock received" : "Stock issued"}
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 max-w-md space-y-3 border border-[var(--ag-line)] bg-white p-5"
      >
        <div className="space-y-2">
          <Label>Item</Label>
          <Input
            required
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="rounded-none"
            placeholder="Rice, oil, linen…"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Qty</Label>
            <Input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="rounded-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{partyLabel}</Label>
          <Input
            required
            value={vendorOrDept}
            onChange={(e) => setVendorOrDept(e.target.value)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label>Notes</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-none"
          />
        </div>
        {msg && <p className="text-sm text-[var(--ag-maroon)]">{msg}</p>}
        <Button
          type="submit"
          className="h-10 w-full rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          Record {direction}
        </Button>
      </form>

      {loading ? (
        <p className="mt-8 text-[var(--ag-muted)]">Loading…</p>
      ) : (
        <ul className="mt-8 space-y-2">
          {moves.length === 0 && (
            <li className="text-[var(--ag-muted)]">No {direction} records yet.</li>
          )}
          {moves.map((m) => (
            <li
              key={m.id}
              className="border border-[var(--ag-line)] bg-white px-4 py-3 text-sm"
            >
              {m.quantity} {m.unit} {m.item} · {m.vendorOrDept}
              {m.notes ? ` · ${m.notes}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function InwardPage() {
  return <StockPage direction="inward" />;
}
