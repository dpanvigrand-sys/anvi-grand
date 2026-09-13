import { VenueBookingsAdmin } from "@/components/ops/venue-bookings-admin";
import { getOps, getVenues } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function VenueBookingsPage() {
  const [ops, venues] = await Promise.all([getOps(), getVenues()]);
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--ag-red)]">
        Banquet.1 / Admin · Venue bookings
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">
        Venue bookings
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Banquet & party hall ledger — function details, members, food package,
        recommend person, advance and balance.
      </p>
      <div className="mt-8">
        <VenueBookingsAdmin venues={venues} initial={ops.venueBookings} />
      </div>
    </div>
  );
}
