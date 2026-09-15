import Link from "next/link";
import { StationHome } from "@/components/ops/station-home";
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
    <StationHome
      stationId="admin"
      ops={ops}
      stats={[
        { label: "Room bookings", value: ops.roomBookings.length },
        { label: "Venue events", value: ops.venueBookings.length },
        { label: "Food orders", value: ops.foodOrders.length },
        { label: "Income booked", value: formatINR(revenue) },
      ]}
      actions={[
        {
          href: "/ops/admin/photos",
          title: "Photos — Add / Edit / Delete",
          desc: "Gallery, hero, rooms, food & banquet images · primary CMS",
        },
        {
          href: "/ops/admin/food",
          title: "Menu — Add / Edit / Delete",
          desc: "CHIGURU dishes, prices, buffets · full item fields",
        },
        {
          href: "/ops/admin/rooms",
          title: "Rooms prices — Add / Edit / Delete",
          desc: "Nightly ₹ rates · add / edit / delete rooms",
        },
        {
          href: "/ops/admin/venues",
          title: "Venues / halls prices — Add / Edit / Delete",
          desc: "Banquet (Royal Grand) + mini hall ₹/day · capacity",
        },
        {
          href: "/ops/admin/venue-bookings",
          title: "Venue bookings",
          desc: "Enter / list banquet & party hall bookings",
        },
        {
          href: "/ops/admin/contacts",
          title: "Contacts",
          desc: "Rooms · food · reception phone lines",
        },
        {
          href: "/ops/admin/bookings",
          title: "Rooms & food reports",
          desc: "Excel · Print A4 · JPG",
        },
        {
          href: "/ops/admin/stock-reports",
          title: "Stock reports",
          desc: "Inward & outward reports",
        },
        {
          href: "/ops/admin/settings",
          title: "Ops settings",
          desc: "Alert thresholds · station labels · name lines",
        },
      ]}
    >
      <h2 className="font-display text-2xl">Current room rates</h2>
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
                  <Link href="/ops/admin/rooms" className="text-[var(--ag-red)] underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-2xl">CHIGURU menu (sample)</h2>
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
            {menu.slice(0, 6).map((dish) => (
              <tr key={dish.id} className="border-b border-[var(--ag-line)]">
                <td className="px-4 py-3 font-medium">{dish.name}</td>
                <td className="px-4 py-3">{formatINR(dish.price)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href="/ops/admin/food" className="text-[var(--ag-red)] underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StationHome>
  );
}
