import { LedgerForm } from "@/components/ops/ledger-form";
import { formatINR } from "@/lib/format";
import { getOps } from "@/lib/store";

export default async function AccountsPage() {
  const ops = await getOps();
  const income = ops.ledger.filter((l) => l.kind === "income").reduce((s, l) => s + l.amount, 0);
  const expense = ops.ledger.filter((l) => l.kind === "expense").reduce((s, l) => s + l.amount, 0);
  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <h1 className="font-display text-4xl text-[var(--ag-ink)]">Accounts</h1>
        <p className="mt-2 text-[var(--ag-muted)]">Income {formatINR(income)} · Expense {formatINR(expense)}</p>
        <div className="mt-6"><LedgerForm /></div>
      </div>
      <div className="space-y-3">
        {ops.ledger.length === 0 ? <p className="text-[var(--ag-muted)]">Ledger empty.</p> : ops.ledger.map((l) => (
          <div key={l.id} className="flex items-center justify-between border border-[var(--ag-line)] bg-white px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{l.description}</p>
              <p className="text-[var(--ag-muted)]">{l.kind} · {l.category}</p>
            </div>
            <p className={l.kind === "income" ? "text-[var(--ag-red)]" : "text-[var(--ag-muted)]"}>{formatINR(l.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
