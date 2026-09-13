import Link from "next/link";
import { StationHome } from "@/components/ops/station-home";
import { formatINR } from "@/lib/format";
import { getOps, getVenues } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function BanquetPage() {
  const [ops, venues] = await Promise.all([getOps(), getVenues()]);
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const open = ops.venueBookings.filter((b) => b.status !== "cancelled");
  const todayEvents = open.filter((b) => b.eventDate === today);
  const tomorrowEvents = open.filter((b) => b.eventDate === tomorrow);
  const due = open.filter((b) => (b.balance ?? 0) > 0);

  return (
    <StationHome
      stationId="banquet"
      ops={ops}
      stats={[
        { label: "Today", value: todayEvents.length },
        { label: "Tomorrow", value: tomorrowEvents.length },
        { label: "Balance due", value: due.length },
        { label: "Venues", value: venues.length },
      ]}
      actions={[
        {
          href: "/ops/admin/venue-bookings",
          title: "Enter / list venue bookings",
          te: "వేదిక బుకింగ్స్",
          desc: "Function details, members, food, advance, balance",
        },
        {
          href: "/ops/admin/venues",
          title: "Venue rates & capacity",
          te: "రేట్లు",
          desc: "Banquet & party hall ₹/day",
        },
        {
          href: "/ops/manager",
          title: "Food package (CHIGURU)",
          te: "ఫుడ్ ప్యాకేజ్",
          desc: "Coordinate catering with restaurant manager",
        },
        {
          href: "/ops/accounts",
          title: "Accounts for advances",
          te: "అకౌంట్స్",
          desc: "Post advance / balance in day book",
        },
        {
          href: "/banquet",
          title: "Guest banquet page",
          te: "గెస్ట్ సైట్",
          desc: "Public banquet enquiry form",
        },
        {
          href: "/ops/admin/bookings",
          title: "Rooms & food ledger",
          te: "ఇతర బుకింగ్స్",
          desc: "Separate from venue function fields",
        },
      ]}
    >
      <h2 className="font-display text-2xl">Today & tomorrow</h2>
      <div className="mt-4 space-y-3">
        {[...todayEvents, ...tomorrowEvents].length === 0 ? (
          <p className="border border-[var(--ag-line)] bg-white px-4 py-8 text-[var(--ag-muted)]">
            No events today or tomorrow —{" "}
            <Link
              href="/ops/admin/venue-bookings"
              className="text-[var(--ag-red)] underline"
            >
              enter a booking
            </Link>
            .
          </p>
        ) : (
          [...todayEvents, ...tomorrowEvents].map((b) => (
            <article
              key={b.id}
              className="border border-[var(--ag-line)] bg-white p-4"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-red)]">
                {b.eventDate === today ? "Today" : "Tomorrow"} · {b.venueName}
              </p>
              <h3 className="mt-1 font-display text-xl">{b.guestName}</h3>
              <p className="text-sm text-[var(--ag-muted)]">
                {b.functionDetails || "Event"} · {b.guests} members
                {b.withFood ? " · with food" : ""}
              </p>
              <p className="mt-1 text-sm">
                {formatINR(b.total)} · bal{" "}
                <span className="text-[var(--ag-maroon)]">
                  {formatINR(b.balance ?? 0)}
                </span>
              </p>
            </article>
          ))
        )}
      </div>
    </StationHome>
  );
}
