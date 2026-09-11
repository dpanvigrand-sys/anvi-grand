import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Staff Ops",
  description: "ANVI GRAND staff operations — reception, kitchen, accounts, and more.",
};

const roles = [
  {
    href: "/ops/reception",
    title: "Reception",
    blurb: "Room bookings, check-in / check-out, guest list.",
  },
  {
    href: "/ops/server",
    title: "Server",
    blurb: "Dining tables and floor orders to CHIGURU kitchen.",
  },
  {
    href: "/ops/kitchen",
    title: "Kitchen (KT)",
    blurb: "Ticket queue — queued → cooking → ready → bumped.",
  },
  {
    href: "/ops/admin",
    title: "Admin",
    blurb: "Overview of bookings, orders, messages, and stock.",
  },
  {
    href: "/ops/accounts",
    title: "Accounts",
    blurb: "Ledger income/expense entries for the house.",
  },
  {
    href: "/ops/inward",
    title: "Inward",
    blurb: "Record stock arriving from vendors.",
  },
  {
    href: "/ops/outward",
    title: "Outward",
    blurb: "Record stock issued to departments.",
  },
];

export default function OpsHomePage() {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Staff</p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)] md:text-5xl">
        Choose your station
      </h1>
      <p className="mt-3 max-w-xl text-[var(--ag-muted)]">
        Demo ops for ANVI GRAND — no login. Pick a role to work the live JSON store.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="border border-[var(--ag-line)] bg-white p-5 transition hover:border-[var(--ag-red)]"
          >
            <h2 className="font-display text-2xl text-[var(--ag-chocolate)]">{r.title}</h2>
            <p className="mt-2 text-sm text-[var(--ag-muted)]">{r.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
