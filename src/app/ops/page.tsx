import Link from "next/link";
import { getOps } from "@/lib/store";

const cards = [
  { href: "/ops/reception", title: "Reception", desc: "Room bookings, check-in / check-out" },
  { href: "/ops/server", title: "Server", desc: "Floor tables and dine-in orders" },
  { href: "/ops/kitchen", title: "KT Kitchen", desc: "Ticket queue, cook, ready, bump" },
  { href: "/ops/admin", title: "Admin", desc: "Occupancy and order overview" },
  { href: "/ops/accounts", title: "Accounts", desc: "Income / expense ledger" },
  { href: "/ops/inward", title: "Inward", desc: "Stock receipts from vendors" },
  { href: "/ops/outward", title: "Outward", desc: "Issues to kitchen & departments" },
];

export default async function OpsHomePage() {
  const ops = await getOps();
  return (
    <div>
      <h1 className="font-display text-4xl text-[var(--ag-ink)]">Staff desk</h1>
      <p className="mt-2 text-[var(--ag-muted)]">Pick a system. Live counts from data/ops.json.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Room bookings", ops.roomBookings.length],
          ["Food orders", ops.foodOrders.length],
          ["Kitchen tickets", ops.kitchenTickets.length],
          ["Ledger lines", ops.ledger.length],
        ].map(([label, n]) => (
          <div key={label as string} className="border border-[var(--ag-line)] bg-white px-4 py-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">{label}</p>
            <p className="mt-2 font-display text-3xl text-[var(--ag-red)]">{n}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="border border-[var(--ag-line)] bg-white p-6 transition hover:border-[var(--ag-red)]">
            <h2 className="font-display text-2xl text-[var(--ag-ink)]">{c.title}</h2>
            <p className="mt-2 text-sm text-[var(--ag-muted)]">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
