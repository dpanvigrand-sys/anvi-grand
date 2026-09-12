import Link from "next/link";
import { formatINR } from "@/lib/format";
import { getMenu, getOps, getRooms } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [ops, rooms, menu] = await Promise.all([
    getOps(),
    getRooms(),
    getMenu(),
  ]);
  const revenue = ops.ledger
    .filter((l) => l.kind === "income")
    .reduce((s, l) => s + l.amount, 0);

  return (
    <div>
      <h1 className="font-display text-4xl text-[var(--ag-ink)]">Admin</h1>
      <p className="mt-2 text-[var(--ag-muted)]">Property snapshot and CMS.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/ops/admin/rooms"
          className="border border-[var(--ag-line)] bg-white p-5 transition hover:border-[var(--ag-red)]"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-red)]">
            CMS
          </p>
          <p className="mt-2 font-display text-2xl text-[var(--ag-ink)]">
            Rooms & prices
          </p>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            Edit ₹ rates · add / delete rooms
          </p>
        </Link>
        <Link
          href="/ops/admin/venues"
          className="border border-[var(--ag-line)] bg-white p-5 transition hover:border-[var(--ag-red)]"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-red)]">
            CMS
          </p>
          <p className="mt-2 font-display text-2xl text-[var(--ag-ink)]">
            Banquet / Venues
          </p>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            Royal Grand Ballroom · ₹/day · capacity
          </p>
        </Link>
        <Link
          href="/ops/admin/food"
          className="border border-[var(--ag-line)] bg-white p-5 transition hover:border-[var(--ag-red)]"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-red)]">
            CMS
          </p>
          <p className="mt-2 font-display text-2xl text-[var(--ag-ink)]">
            Food & prices
          </p>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            CHIGURU menu · buffet ₹ rates
          </p>
        </Link>
        <Link
          href="/ops/admin/contacts"
          className="border border-[var(--ag-line)] bg-white p-5 transition hover:border-[var(--ag-red)]"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-red)]">
            CMS
          </p>
          <p className="mt-2 font-display text-2xl text-[var(--ag-ink)]">
            Contacts
          </p>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            Rooms · food · reception phones
          </p>
        </Link>
        <Link
          href="/ops/admin/bookings"
          className="border border-[var(--ag-line)] bg-white p-5 transition hover:border-[var(--ag-red)]"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-red)]">
            Reports
          </p>
          <p className="mt-2 font-display text-2xl text-[var(--ag-ink)]">
            Bookings
          </p>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            Rooms & food · day / month · Excel · Print A4 · JPG
          </p>
        </Link>
        <Link
          href="/ops/admin/stock-reports"
          className="border border-[var(--ag-line)] bg-white p-5 transition hover:border-[var(--ag-red)]"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-red)]">
            Reports
          </p>
          <p className="mt-2 font-display text-2xl text-[var(--ag-ink)]">
            Stock reports
          </p>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            Inward & outward · Excel · Print A4 · JPG
          </p>
        </Link>
        <Link
          href="/ops/admin/photos"
          className="border border-[var(--ag-line)] bg-white p-5 transition hover:border-[var(--ag-red)]"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-red)]">
            CMS
          </p>
          <p className="mt-2 font-display text-2xl text-[var(--ag-ink)]">
            Photos
          </p>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            Gallery & website images
          </p>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-[var(--ag-line)] bg-white p-5">
          <p className="text-xs uppercase text-[var(--ag-muted)]">Rooms booked</p>
          <p className="font-display text-3xl">{ops.roomBookings.length}</p>
        </div>
        <div className="border border-[var(--ag-line)] bg-white p-5">
          <p className="text-xs uppercase text-[var(--ag-muted)]">Venue events</p>
          <p className="font-display text-3xl">{ops.venueBookings.length}</p>
        </div>
        <div className="border border-[var(--ag-line)] bg-white p-5">
          <p className="text-xs uppercase text-[var(--ag-muted)]">Food orders</p>
          <p className="font-display text-3xl">{ops.foodOrders.length}</p>
        </div>
        <div className="border border-[var(--ag-line)] bg-white p-5">
          <p className="text-xs uppercase text-[var(--ag-muted)]">Income booked</p>
          <p className="font-display text-3xl">{formatINR(revenue)}</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-2xl">Current room rates</h2>
      <div className="mt-4 overflow-x-auto border border-[var(--ag-line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--ag-line)] bg-[var(--ag-soft)] text-xs uppercase tracking-[0.12em] text-[var(--ag-muted)]">
            <tr>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Price / night</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b border-[var(--ag-line)]">
                <td className="px-4 py-3 font-medium">{room.name}</td>
                <td className="px-4 py-3">{formatINR(room.pricePerNight)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href="/ops/admin/rooms"
                    className="text-[var(--ag-red)] underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-2xl">CHIGURU menu prices</h2>
      <div className="mt-4 overflow-x-auto border border-[var(--ag-line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--ag-line)] bg-[var(--ag-soft)] text-xs uppercase tracking-[0.12em] text-[var(--ag-muted)]">
            <tr>
              <th className="px-4 py-3">Dish</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {menu.slice(0, 8).map((dish) => (
              <tr key={dish.id} className="border-b border-[var(--ag-line)]">
                <td className="px-4 py-3 font-medium">{dish.name}</td>
                <td className="px-4 py-3">{formatINR(dish.price)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href="/ops/admin/food"
                    className="text-[var(--ag-red)] underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-2xl">Recent messages</h2>
      <div className="mt-4 space-y-3">
        {ops.messages.slice(0, 5).map((m) => (
          <div
            key={m.id}
            className="border border-[var(--ag-line)] bg-white px-4 py-3 text-sm"
          >
            <p className="font-medium">{m.subject}</p>
            <p className="text-[var(--ag-muted)]">
              {m.name} · {m.email}
            </p>
          </div>
        ))}
        {ops.messages.length === 0 ? (
          <p className="text-[var(--ag-muted)]">No concierge messages.</p>
        ) : null}
      </div>
    </div>
  );
}
