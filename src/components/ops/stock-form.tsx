"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StockForm({ direction }: { direction: "inward" | "outward" }) {
  const router = useRouter();
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("kg");
  const [vendorOrDept, setVendorOrDept] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/ops/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, item, quantity, unit, vendorOrDept, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      setItem("");
      setNotes("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 border border-[var(--ag-line)] bg-white p-5">
      <div className="grid gap-2"><Label htmlFor="item">Item</Label><Input id="item" required value={item} onChange={(e) => setItem(e.target.value)} className="rounded-none" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2"><Label htmlFor="qty">Qty</Label><Input id="qty" type="number" min={0.1} step={0.1} required value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="rounded-none" /></div>
        <div className="grid gap-2"><Label htmlFor="unit">Unit</Label><Input id="unit" required value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-none" /></div>
      </div>
      <div className="grid gap-2"><Label htmlFor="vendor">{direction === "inward" ? "Vendor" : "Department"}</Label><Input id="vendor" required value={vendorOrDept} onChange={(e) => setVendorOrDept(e.target.value)} className="rounded-none" /></div>
      <div className="grid gap-2"><Label htmlFor="notes">Notes</Label><Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-none" /></div>
      <Button type="submit" disabled={pending} className="rounded-none bg-[var(--ag-red)] text-white">{pending ? "Saving…" : "Save move"}</Button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
