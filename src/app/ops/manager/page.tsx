import Link from "next/link";
import { StationHome } from "@/components/ops/station-home";
import { formatINR } from "@/lib/format";
import { getMenu, getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
  const [ops, menu] = await Promise.all([getOps(), getMenu()]);
  const openTickets = ops.kitchenTickets.filter(
    (t) => t.status === "queued" || t.status === "cooking" || t.status === "ready",
  ).length;
  const openFood = ops.foodOrders.filter(
    (o) => o.status !== "served" && o.status !== "cancelled",
  );

  return (
    <StationHome
      stationId="manager"
      ops={ops}
      stats={[
        { label: "Open food orders", value: openFood.length },
        { label: "KT pulse", value: openTickets },
        { label: "Buffet bookings", value: ops.buffetBookings.length },
        { label: "Menu items", value: menu.length },
      ]}
      actions={[
        {
          href: "/ops/admin/food",
          title: "Menu — Add / Edit / Delete",
          desc: "IRAA dishes, prices, buffets · full item fields",
        },
        {
          href: "/ops/admin/bookings",
          title: "Food bookings overview",
          desc: "Orders ledger with advance / balance",
        },
        {
          href: "/ops/kitchen",
          title: "Kitchen pulse",
          desc: "Queued → cook → ready tickets",
        },
        {
          href: "/ops/server",
          title: "Server floor pulse",
          desc: "Table free / occupied / billing",
        },
        {
          href: "/ops/store",
          title: "Grocery / ingredients",
          desc: "Low stock and inward needed",
        },
        {
          href: "/ops/banquet",
          title: "Banquet with food",
          desc: "Events that need IRAA catering",
        },
      ]}
    >
      <h2 className="font-display text-2xl">Open food orders</h2>
      <div className="mt-4 space-y-3">
        {openFood.length === 0 ? (
          <p className="border border-[var(--ag-line)] bg-white px-4 py-8 text-[var(--ag-muted)]">
            No open food orders.
          </p>
        ) : (
          openFood.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-2 border border-[var(--ag-line)] bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {o.guestName} · {o.status}
                </p>
                <p className="text-sm text-[var(--ag-muted)]">
                  {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                </p>
              </div>
              <p className="font-display text-xl text-[var(--ag-red)]">
                {formatINR(o.total)}
              </p>
            </div>
          ))
        )}
      </div>
      <p className="mt-6 text-sm">
        <Link href="/ops/admin/food" className="text-[var(--ag-red)] underline">
          Menu (Food) — Add / Edit →
        </Link>
      </p>
    </StationHome>
  );
}
