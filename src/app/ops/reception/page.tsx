import { StatusActions } from "@/components/ops/status-actions";
import { formatDateLabel, formatINR } from "@/lib/format";
import { getOps } from "@/lib/store";

export default async function ReceptionPage() {
  const ops = await getOps();
  return (
    <div>
      <h1 className="font-display text-4xl text-[var(--ag-ink)]">Reception</h1>
      <p className="mt-2 text-[var(--ag-muted)]">Room bookings and guest status.</p>
      <div className="mt-8 space-y-4">
        {ops.roomBookings.length === 0 ? (
          <p className="border border-[var(--ag-line)] bg-white px-5 py-10 text-[var(--ag-muted)]">No bookings yet.</p>
        ) : ops.roomBookings.map((b) => (
          <article key={b.id} className="border border-[var(--ag-line)] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-[var(--ag-ink)]">{b.guestName}</h2>
                <p className="text-sm text-[var(--ag-muted)]">{b.roomName} · {formatDateLabel(b.checkIn)} → {formatDateLabel(b.checkOut)}</p>
                <p className="mt-1 text-sm">{b.id} · {b.status} · {formatINR(b.total)}</p>
              </div>
              <StatusActions
                endpoint={`/api/ops/bookings/${b.id}`}
                statuses={[
                  { value: "confirmed", label: "Confirm" },
                  { value: "checked-in", label: "Check-in" },
                  { value: "checked-out", label: "Check-out" },
                  { value: "cancelled", label: "Cancel" },
                ]}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
