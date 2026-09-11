"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";
import type { LedgerEntry } from "@/lib/types";

export default function AccountsPage() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [kind, setKind] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ops = await (await fetch("/api/ops")).json();
      setLedger(ops.ledger || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
    setDescription("");
    setAmount(0);
    setMsg("Entry added.");
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--ag-chocolate)]">Accounts</h1>
      <p className="mt-1 text-sm text-[var(--ag-muted)]">Ledger · income & expense</p>

      <form
        onSubmit={onSubmit}
        className="mt-8 max-w-md space-y-3 border border-[var(--ag-line)] bg-white p-5"
      >
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={kind === "income" ? "default" : "outline"}
            className="rounded-none"
            onClick={() => setKind("income")}
          >
            Income
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kind === "expense" ? "default" : "outline"}
            className="rounded-none"
            onClick={() => setKind("expense")}
          >
            Expense
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label>Amount (INR)</Label>
          <Input
            type="number"
            min={1}
            required
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="rounded-none"
          />
        </div>
        {msg && <p className="text-sm text-[var(--ag-maroon)]">{msg}</p>}
        <Button
          type="submit"
          className="h-10 w-full rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          Add entry
        </Button>
      </form>

      {loading ? (
        <p className="mt-8 text-[var(--ag-muted)]">Loading…</p>
      ) : (
        <ul className="mt-8 space-y-2">
          {ledger.length === 0 && (
            <li className="text-[var(--ag-muted)]">No ledger entries yet.</li>
          )}
          {ledger.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-2 border border-[var(--ag-line)] bg-white px-4 py-3 text-sm"
            >
              <span>
                <span
                  className={
                    e.kind === "income" ? "text-emerald-700" : "text-[var(--ag-red)]"
                  }
                >
                  {e.kind}
                </span>{" "}
                · {e.category} · {e.description}
              </span>
              <span className="font-medium">{formatINR(e.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
