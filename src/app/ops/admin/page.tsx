import { formatINR } from "@/lib/format";
import { getOps } from "@/lib/store";

export default async function AdminPage() {
  const ops = await getOps();
  const revenue = ops.ledger.filter((l) => l.kind === "income").reduce((s, l) => s + l.amount, 0);
  return (
    <div>
      <h1 className="font-display text-4xl text-[var(--ag-ink)]">Admin</h1>
      <p className="mt-2 text-[var(--ag-muted)]">Property snapshot.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-[var(--ag-line)] bg-white p-5"><p className="text-xs uppercase text-[var(--ag-muted)]">Rooms booked</p><p className="font-display text-3xl">{ops.roomBookings.length}</p></div>
        <div className="border border-[var(--ag-line)] bg-white p-5"><p className="text-xs uppercase text-[var(--ag-muted)]">Venue events</p><p className="font-display text-3xl">{ops.venueBookings.length}</p></div>
        <div className="border border-[var(--ag-line)] bg-white p-5"><p className="text-xs uppercase text-[var(--ag-muted)]">Food orders</p><p className="font-display text-3xl">{ops.foodOrders.length}</p></div>
        <div className="border border-[var(--ag-line)] bg-white p-5"><p className="text-xs uppercase text-[var(--ag-muted)]">Income booked</p><p className="font-display text-3xl">{formatINR(revenue)}</p></div>
      </div>
      <h2 className="mt-10 font-display text-2xl">Recent messages</h2>
      <div className="mt-4 space-y-3">
        {ops.messages.slice(0, 5).map((m) => (
          <div key={m.id} className="border border-[var(--ag-line)] bg-white px-4 py-3 text-sm">
            <p className="font-medium">{m.subject}</p>
            <p className="text-[var(--ag-muted)]">{m.name} · {m.email}</p>
          </div>
        ))}
        {ops.messages.length === 0 ? <p className="text-[var(--ag-muted)]">No concierge messages.</p> : null}
      </div>
    </div>
  );
}
