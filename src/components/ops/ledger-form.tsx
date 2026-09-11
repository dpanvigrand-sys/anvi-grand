"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LedgerForm() {
  const router = useRouter();
  const [kind, setKind] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("misc");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/ops/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, category, description, amount }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      setDescription("");
      setAmount(0);
      router.refresh();
    } catch { setError("Network error"); }
    finally { setPending(false); }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 border border-[var(--ag-line)] bg-white p-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Kind</Label>
          <select className="h-9 border border-[var(--ag-line)] bg-white px-2" value={kind} onChange={(e) => setKind(e.target.value as "income" | "expense")}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="grid gap-2"><Label htmlFor="cat">Category</Label><Input id="cat" value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-none" /></div>
      </div>
      <div className="grid gap-2"><Label htmlFor="desc">Description</Label><Input id="desc" required value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-none" /></div>
      <div className="grid gap-2"><Label htmlFor="amt">Amount (₹)</Label><Input id="amt" type="number" min={0} required value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="rounded-none" /></div>
      <Button type="submit" disabled={pending} className="rounded-none bg-[var(--ag-red)] text-white">{pending ? "Saving…" : "Add entry"}</Button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
