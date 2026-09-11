import Image from "next/image";
import Link from "next/link";
import { getOps } from "@/lib/store";

const cards = [
  { href: "/ops/reception", title: "Reception", desc: "Room bookings, check-in / check-out", tone: "bg-[var(--ag-red)]" },
  { href: "/ops/server", title: "Server", desc: "Floor tables and dine-in orders", tone: "bg-[var(--ag-red-deep)]" },
  { href: "/ops/kitchen", title: "KT Kitchen", desc: "Ticket queue, cook, ready, bump", tone: "bg-[var(--ag-maroon)]" },
  { href: "/ops/admin", title: "Admin", desc: "Occupancy and order overview", tone: "bg-[var(--ag-red)]" },
  { href: "/ops/accounts", title: "Accounts", desc: "Income / expense ledger", tone: "bg-[var(--ag-red-deep)]" },
  { href: "/ops/inward", title: "Inward", desc: "Stock receipts from vendors", tone: "bg-[var(--ag-maroon)]" },
  { href: "/ops/outward", title: "Outward", desc: "Issues to kitchen & departments", tone: "bg-[var(--ag-red)]" },
];

export default async function OpsHomePage() {
  const ops = await getOps();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--ag-red)]">Password gate unlocked</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">Staff desk</h1>
          <p className="mt-2 max-w-xl text-[var(--ag-muted)]">
            All seven systems open from this screen. Live counts read from{" "}
            <code className="text-[var(--ag-ink)]">data/ops.json</code>.
          </p>
        </div>
        <Image src="/logos/anvi-grand.svg" alt="" width={140} height={36} className="h-9 w-auto opacity-90" />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Room bookings", ops.roomBookings.length],
          ["Food orders", ops.foodOrders.length],
          ["Kitchen tickets", ops.kitchenTickets.length],
          ["Ledger lines", ops.ledger.length],
        ].map(([label, n]) => (
          <div key={String(label)} className="border border-[var(--ag-line)] bg-white px-4 py-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">{label}</p>
            <p className="mt-2 font-display text-3xl text-[var(--ag-red)]">{n}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group overflow-hidden border border-[var(--ag-line)] bg-white transition hover:border-[var(--ag-red)]"
          >
            <div className={`h-1.5 w-full ${c.tone}`} />
            <div className="p-6">
              <h2 className="font-display text-2xl text-[var(--ag-ink)] group-hover:text-[var(--ag-red)]">
                {c.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--ag-muted)]">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
