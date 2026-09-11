"use client";

import { Button } from "@/components/ui/button";
import { useOps } from "@/components/ops/use-ops";
import { formatINR } from "@/lib/format";

export default function AdminPage() {
  const { ops, error, loading, refresh } = useOps();

  if (loading) return <p className="text-[var(--ag-muted)]">Loading admin…</p>;
  if (error || !ops) return <p className="text-[var(--ag-red)]">{error || "No data"}</p>;

  const cards = [
    { label: "Room bookings", value: ops.roomBookings.length },
    { label: "Venue bookings", value: ops.venueBookings.length },
    { label: "Food orders", value: ops.foodOrders.length },
    { label: "Buffet bookings", value: ops.buffetBookings.length },
    { label: "Messages", value: ops.messages.length },
    { label: "Open KT", value: ops.kitchenTickets.filter((t) => t.status !== "bumped").length },
    { label: "Inward moves", value: ops.inward.length },
    { label: "Outward moves", value: ops.outward.length },
  ];

  const income = ops.ledger.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
  const expense = ops.ledger.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Admin</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">House overview</h1>
        </div>
        <Button type="button" variant="outline" className="rounded-none" onClick={() => void refresh()}>
          Refresh
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-[var(--ag-line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-[var(--ag-chocolate)]">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="border border-[var(--ag-line)] bg-white p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">Ledger income</p>
          <p className="mt-2 font-display text-3xl text-[var(--ag-chocolate)]">{formatINR(income)}</p>
        </div>
        <div className="border border-[var(--ag-line)] bg-white p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">Ledger expense</p>
          <p className="mt-2 font-display text-3xl text-[var(--ag-chocolate)]">{formatINR(expense)}</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-[var(--ag-chocolate)]">Recent messages</h2>
        {ops.messages.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ag-muted)]">No contact messages.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {ops.messages.slice(0, 8).map((m) => (
              <li key={m.id} className="border border-[var(--ag-line)] bg-white px-4 py-3">
                <span className="font-medium">{m.name}</span> · {m.subject}
                <p className="mt-1 text-[var(--ag-muted)]">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
