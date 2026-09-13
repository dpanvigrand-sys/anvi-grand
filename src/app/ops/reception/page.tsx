import Link from "next/link";
import { StationHome } from "@/components/ops/station-home";
import { StatusActions } from "@/components/ops/status-actions";
import { formatDateLabel, formatINR } from "@/lib/format";
import { getHotel, getOps, resolveHotelPhones } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ReceptionPage() {
  const [ops, hotel] = await Promise.all([getOps(), getHotel()]);
  const phones = resolveHotelPhones(hotel);
  const today = new Date().toISOString().slice(0, 10);
  const checkoutToday = ops.roomBookings.filter(
    (b) =>
      b.checkOut === today &&
      (b.status === "checked-in" || b.status === "confirmed"),
  ).length;
  const occupied = ops.roomBookings.filter((b) => b.status === "checked-in").length;

  return (
    <StationHome
      stationId="reception"
      ops={ops}
      stats={[
        { label: "Checkout today", value: checkoutToday },
        { label: "Occupied", value: occupied },
        { label: "Bookings", value: ops.roomBookings.length },
        { label: "Desk phone", value: phones.reception },
      ]}
      actions={[
        {
          href: "/ops/admin/bookings",
          title: "Room bookings ledger",
          te: "రూమ్ బుకింగ్స్",
          desc: "Name, address, phone, advance, balance · Excel / Print",
        },
        {
          href: "/ops/admin/contacts",
          title: "Phone contacts",
          te: "ఫోన్ నంబర్లు",
          desc: "Rooms / food / reception lines for guest desk",
        },
        {
          href: "/ops/housekeeping",
          title: "Housekeeping board",
          te: "హౌస్‌కీపింగ్",
          desc: "Dirty / clean / ready rooms after checkout",
        },
        {
          href: "/rooms",
          title: "Walk-in rates (guest site)",
          te: "వాక్-ఇన్ రేట్లు",
          desc: "Open public rooms page for walk-in quotes",
        },
      ]}
    >
      <h2 className="font-display text-2xl text-[var(--ag-ink)]">
        Live room desk · చెక్-ఇన్ / అవుట్
      </h2>
      <div className="mt-4 space-y-4">
        {ops.roomBookings.length === 0 ? (
          <p className="border border-[var(--ag-line)] bg-white px-5 py-10 text-[var(--ag-muted)]">
            No bookings yet.
          </p>
        ) : (
          ops.roomBookings.map((b) => (
            <article key={b.id} className="border border-[var(--ag-line)] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-[var(--ag-ink)]">
                    {b.guestName}
                  </h3>
                  <p className="text-sm text-[var(--ag-muted)]">
                    {b.roomName} · {formatDateLabel(b.checkIn)} →{" "}
                    {formatDateLabel(b.checkOut)}
                  </p>
                  <p className="mt-1 text-sm">
                    {b.id} · {b.status} · {formatINR(b.total)}
                    {(b.balance ?? 0) > 0 ? (
                      <span className="ml-2 text-[var(--ag-maroon)]">
                        bal {formatINR(b.balance)}
                      </span>
                    ) : null}
                  </p>
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
          ))
        )}
      </div>
      <p className="mt-6 text-sm text-[var(--ag-muted)]">
        Related:{" "}
        <Link href="/ops/accounts" className="text-[var(--ag-red)] underline">
          Accounts
        </Link>
      </p>
    </StationHome>
  );
}
