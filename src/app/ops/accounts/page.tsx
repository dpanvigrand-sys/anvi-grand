"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOps } from "@/components/ops/use-ops";
import { formatINR } from "@/lib/format";

export default function AccountsPage() {
  const { ops, error, loading, refresh } = useOps();
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("ops");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/ops/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, category, description, amount }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }
    setMsg(`Saved ${data.entry.id}`);
    setDescription("");
    setAmount(0);
    await refresh();
  }

  if (loading) return <p className="text-[var(--ag-muted)]">Loading accounts…</p>;
  if (error || !ops) return <p className="text-[var(--ag-red)]">{error || "No data"}</p>;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Accounts</p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">Ledger</h1>

      <form onSubmit={onSubmit} className="mt-8 max-w-md space-y-3 border border-[var(--ag-line)] bg-white p-5">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>Kind</Label>
            <select
              className="h-9 w-full border border-[var(--ag-line)] px-2 text-sm"
              value={kind}
              onChange={(e) => setKind(e.target.value as "income" | "expense")}
            >
              <option value="income">income</option>
              <option value="expense">expense</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Input className="rounded-none" value={category} onChange={(e) => setCategory(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Description</Label>
          <Input className="rounded-none" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Amount (INR)</Label>
          <Input
            type="number"
            min={1}
            className="rounded-none"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
        </div>
        {msg && <p className="text-sm text-[var(--ag-maroon)]">{msg}</p>}
        <Button type="submit" className="h-10 w-full rounded-none bg-[var(--ag-red)] text-white">
          Post entry
        </Button>
      </form>

      <ul className="mt-8 space-y-2 text-sm">
        {ops.ledger.length === 0 ? (
          <li className="text-[var(--ag-muted)]">No ledger entries yet.</li>
        ) : (
          ops.ledger.map((e) => (
            <li key={e.id} className="flex justify-between gap-4 border border-[var(--ag-line)] bg-white px-4 py-3">
              <span>
                <span className="font-medium">{e.kind}</span> · {e.category} · {e.description}
              </span>
              <span className={e.kind === "income" ? "text-emerald-800" : "text-[var(--ag-red)]"}>
                {formatINR(e.amount)}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
