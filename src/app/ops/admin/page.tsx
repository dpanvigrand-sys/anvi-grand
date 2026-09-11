"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/format";
import type { OpsStore } from "@/lib/types";

export default function AdminPage() {
  const [ops, setOps] = useState<OpsStore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await (await fetch("/api/ops")).json();
        setOps(data);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <p className="text-[var(--ag-muted)]">Loading…</p>;
  if (!ops) return <p className="text-[var(--ag-red)]">Could not load ops store.</p>;

  const counts = [
    { label: "Room bookings", value: ops.roomBookings.length },
    { label: "Venue bookings", value: ops.venueBookings.length },
    { label: "Food orders", value: ops.foodOrders.length },
    { label: "Buffets", value: ops.buffetBookings.length },
    { label: "Open KT", value: ops.kitchenTickets.filter((t) => t.status !== "bumped").length },
    { label: "Messages", value: ops.messages.length },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--ag-chocolate)]">Admin</h1>
      <p className="mt-1 text-sm text-[var(--ag-muted)]">Overview · recent activity</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {counts.map((c) => (
          <div key={c.label} className="border border-[var(--ag-line)] bg-white p-4 text-center">
            <p className="font-display text-3xl text-[var(--ag-red)]">{c.value}</p>
            <p className="mt-1 text-xs text-[var(--ag-muted)]">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl text-[var(--ag-chocolate)]">Recent room bookings</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {ops.roomBookings.slice(0, 5).map((b) => (
              <li key={b.id} className="border border-[var(--ag-line)] bg-white px-4 py-3">
                {b.guestName} · {b.roomName} · {formatINR(b.total)} · {b.status}
              </li>
            ))}
            {ops.roomBookings.length === 0 && (
              <li className="text-[var(--ag-muted)]">None yet.</li>
            )}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-xl text-[var(--ag-chocolate)]">Recent food orders</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {ops.foodOrders.slice(0, 5).map((o) => (
              <li key={o.id} className="border border-[var(--ag-line)] bg-white px-4 py-3">
                {o.guestName} · {formatINR(o.total)} · {o.status} · {o.source}
              </li>
            ))}
            {ops.foodOrders.length === 0 && (
              <li className="text-[var(--ag-muted)]">None yet.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
