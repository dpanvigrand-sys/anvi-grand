"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOps } from "@/components/ops/use-ops";

export default function InwardPage() {
  const { ops, error, loading, refresh } = useOps();
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("kg");
  const [vendorOrDept, setVendorOrDept] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/ops/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        direction: "inward",
        item,
        quantity,
        unit,
        vendorOrDept,
        notes: notes || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }
    setMsg(`Logged ${data.move.id}`);
    setItem("");
    setNotes("");
    await refresh();
  }

  if (loading) return <p className="text-[var(--ag-muted)]">Loading inward…</p>;
  if (error || !ops) return <p className="text-[var(--ag-red)]">{error || "No data"}</p>;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Stores</p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">Inward stock</h1>

      <form onSubmit={onSubmit} className="mt-8 max-w-md space-y-3 border border-[var(--ag-line)] bg-white p-5">
        <div className="space-y-1">
          <Label>Item</Label>
          <Input className="rounded-none" required value={item} onChange={(e) => setItem(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>Qty</Label>
            <Input
              type="number"
              min={0.01}
              step="any"
              className="rounded-none"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>Unit</Label>
            <Input className="rounded-none" required value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Vendor</Label>
          <Input
            className="rounded-none"
            required
            value={vendorOrDept}
            onChange={(e) => setVendorOrDept(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Notes</Label>
          <Input className="rounded-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {msg && <p className="text-sm text-[var(--ag-maroon)]">{msg}</p>}
        <Button type="submit" className="h-10 w-full rounded-none bg-[var(--ag-red)] text-white">
          Record inward
        </Button>
      </form>

      <ul className="mt-8 space-y-2 text-sm">
        {ops.inward.length === 0 ? (
          <li className="text-[var(--ag-muted)]">No inward moves yet.</li>
        ) : (
          ops.inward.map((m) => (
            <li key={m.id} className="border border-[var(--ag-line)] bg-white px-4 py-3">
              {m.item} · {m.quantity} {m.unit} · {m.vendorOrDept} · {m.id}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
