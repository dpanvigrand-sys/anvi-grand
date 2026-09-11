"use client";

import { Button } from "@/components/ui/button";
import { useOps } from "@/components/ops/use-ops";
import { formatDateLabel, formatINR } from "@/lib/format";
import type { RoomBooking } from "@/lib/types";

const statuses: RoomBooking["status"][] = [
  "pending",
  "confirmed",
  "checked-in",
  "checked-out",
  "cancelled",
];

export default function ReceptionPage() {
  const { ops, error, loading, refresh } = useOps();

  async function setStatus(id: string, status: RoomBooking["status"]) {
    await fetch(`/api/ops/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await refresh();
  }

  if (loading) return <p className="text-[var(--ag-muted)]">Loading reception…</p>;
  if (error || !ops) return <p className="text-[var(--ag-red)]">{error || "No data"}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Reception</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">Room desk</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-none"
          onClick={() => void refresh()}
        >
          Refresh
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-2xl text-[var(--ag-chocolate)]">Bookings</h2>
        {ops.roomBookings.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--ag-muted)]">No room bookings yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--ag-line)] border border-[var(--ag-line)] bg-white">
            {ops.roomBookings.map((b) => (
              <li key={b.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-[var(--ag-ink)]">
                    {b.guestName} · {b.roomName}
                  </p>
                  <p className="text-sm text-[var(--ag-muted)]">
                    {formatDateLabel(b.checkIn)} → {formatDateLabel(b.checkOut)} · {formatINR(b.total)} ·{" "}
                    {b.id}
                  </p>
                  <p className="text-sm text-[var(--ag-muted)]">
                    {b.phone} · {b.email}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
                    disabled={b.status === "checked-in" || b.status === "checked-out"}
                    onClick={() => void setStatus(b.id, "checked-in")}
                  >
                    Check-in
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-none"
                    disabled={b.status === "checked-out"}
                    onClick={() => void setStatus(b.id, "checked-out")}
                  >
                    Check-out
                  </Button>
                  {statuses
                    .filter((s) => s !== "checked-in" && s !== "checked-out")
                    .map((s) => (
                      <Button
                        key={s}
                        type="button"
                        size="sm"
                        variant={b.status === s ? "default" : "outline"}
                        className="rounded-none"
                        onClick={() => void setStatus(b.id, s)}
                      >
                        {s}
                      </Button>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-[var(--ag-chocolate)]">Guests</h2>
        {ops.guests.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--ag-muted)]">No guest records.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {ops.guests.map((g) => (
              <li key={g.id} className="border border-[var(--ag-line)] bg-white px-4 py-3">
                {g.name} · {g.phone} · {g.roomId || "—"} · {g.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
