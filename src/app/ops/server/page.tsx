import { StationHome } from "@/components/ops/station-home";
import { StatusActions } from "@/components/ops/status-actions";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ServerPage() {
  const ops = await getOps();
  const ready = ops.kitchenTickets.filter((t) => t.status === "ready").length;
  const openOrders = ops.foodOrders.filter(
    (o) => o.status !== "served" && o.status !== "cancelled",
  ).length;

  return (
    <StationHome
      stationId="server"
      ops={ops}
      stats={[
        { label: "Tables free", value: ops.tables.filter((t) => t.status === "free").length },
        { label: "Occupied", value: ops.tables.filter((t) => t.status === "occupied").length },
        { label: "KT ready", value: ready },
        { label: "Open orders", value: openOrders },
      ]}
      actions={[
        {
          href: "/ops/kitchen",
          title: "Send / watch kitchen",
          desc: "See queued tickets and ready-to-serve bumps",
        },
        {
          href: "/ops/manager",
          title: "Restaurant manager",
          desc: "Menu prices and food booking overview",
        },
        {
          href: "/food",
          title: "IRAA Dine Dine menu (guest)",
          desc: "Reference dishes and ₹ while taking orders",
        },
        {
          href: "/ops/admin/food",
          title: "Menu price CMS",
          desc: "Confirm current rates with manager",
        },
      ]}
    >
      <h2 className="font-display text-2xl">Floor tables</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ops.tables.map((t) => (
          <article key={t.id} className="border border-[var(--ag-line)] bg-white p-5">
            <h3 className="font-display text-2xl">{t.label}</h3>
            <p className="text-sm text-[var(--ag-muted)]">
              {t.section} · {t.seats} seats
            </p>
            <p className="mt-2 text-sm uppercase tracking-wide text-[var(--ag-red)]">
              {t.status}
            </p>
            <div className="mt-4">
              <StatusActions
                endpoint={`/api/ops/tables/${t.id}`}
                statuses={[
                  { value: "free", label: "Free" },
                  { value: "occupied", label: "Seat" },
                  { value: "billing", label: "Bill" },
                  { value: "reserved", label: "Hold" },
                ]}
              />
            </div>
          </article>
        ))}
      </div>
    </StationHome>
  );
}
