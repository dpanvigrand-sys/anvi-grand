import Link from "next/link";
import { BookingsAdmin, type BookingRow } from "@/components/ops/bookings-admin";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

function asRows(): Promise<BookingRow[]> {
  return getOps().then((ops) => {
    const rooms: BookingRow[] = ops.roomBookings.map((b) => ({
      id: b.id,
      kind: "room" as const,
      date: (b.createdAt || b.checkIn || "").slice(0, 10),
      personName: b.guestName,
      address: b.address || "",
      phone: b.phone,
      link: `/bookings/${b.id}`,
      total: b.total,
      advance: b.advance ?? 0,
      balance: b.balance ?? Math.max(0, b.total - (b.advance ?? 0)),
      status: b.status,
      detail: `${b.roomName} · ${b.checkIn} → ${b.checkOut}`,
    }));
    const food: BookingRow[] = ops.foodOrders.map((o) => ({
      id: o.id,
      kind: "food" as const,
      date: (o.createdAt || "").slice(0, 10),
      personName: o.guestName,
      address: o.address || (o.roomNumber ? `Room ${o.roomNumber}` : ""),
      phone: o.phone,
      link: `/food`,
      total: o.total,
      advance: o.advance ?? 0,
      balance: o.balance ?? Math.max(0, o.total - (o.advance ?? 0)),
      status: o.status,
      detail:
        o.items.map((i) => `${i.qty}× ${i.name}`).join(", ") ||
        (o.roomNumber ? `Room ${o.roomNumber}` : "CHIGURU order"),
    }));
    return [...rooms, ...food].sort((a, b) => b.date.localeCompare(a.date));
  });
}

export default async function AdminBookingsPage() {
  const rows = await asRows();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
        Admin · Bookings
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">
        Rooms & food booking reports
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Daily / monthly / date-range register with person name, address, phone,
        advance, and balance. Open from{" "}
        <Link href="/ops" className="text-[var(--ag-red)] underline">
          /ops
        </Link>{" "}
        (password <code>anviops2026</code>) → <strong>Bookings</strong>.
      </p>
      <div className="mt-8">
        <BookingsAdmin initialRows={rows} />
      </div>
    </div>
  );
}
