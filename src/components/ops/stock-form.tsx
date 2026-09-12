"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";

export function StockForm({ direction }: { direction: "inward" | "outward" }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("kg");
  const [vendorOrDept, setVendorOrDept] = useState("");
  const [amount, setAmount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const balance = Math.max(0, amount - advance);
  const partyLabel = direction === "inward" ? "Vendor / supplier" : "Department / party";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/ops/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction,
          item,
          quantity,
          unit,
          vendorOrDept,
          amount,
          advance,
          balance,
          date,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      setItem("");
      setQuantity(1);
      setAmount(0);
      setAdvance(0);
      setNotes("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 border border-[var(--ag-line)] bg-white p-5"
    >
      <div className="grid gap-2">
        <Label htmlFor="item">Item</Label>
        <Input
          id="item"
          required
          value={item}
          onChange={(e) => setItem(e.target.value)}
          className="rounded-none"
          placeholder="e.g. Basmati rice"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="qty">Qty</Label>
          <Input
            id="qty"
            type="number"
            min={0.1}
            step={0.1}
            required
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="rounded-none"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            required
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded-none"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="vendor">{partyLabel}</Label>
        <Input
          id="vendor"
          required
          value={vendorOrDept}
          onChange={(e) => setVendorOrDept(e.target.value)}
          className="rounded-none"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-none"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            step={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="rounded-none"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="advance">Advance (₹)</Label>
          <Input
            id="advance"
            type="number"
            min={0}
            step={1}
            value={advance}
            onChange={(e) => setAdvance(Number(e.target.value) || 0)}
            className="rounded-none"
          />
        </div>
        <div className="grid gap-2">
          <Label>Balance</Label>
          <p className="flex h-9 items-center border border-[var(--ag-line)] bg-[#fff8f7] px-3 text-sm">
            {formatINR(balance)}
          </p>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-none"
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
      >
        {pending ? "Saving…" : `Save ${direction} entry`}
      </Button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
