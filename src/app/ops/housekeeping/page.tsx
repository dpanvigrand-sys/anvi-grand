import Link from "next/link";
import { HousekeepingBoard } from "@/components/ops/housekeeping-board";
import { StationHome } from "@/components/ops/station-home";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HousekeepingPage() {
  const ops = await getOps();
  const dirty = ops.housekeepingRooms.filter(
    (r) => r.status === "dirty" || r.status === "cleaning",
  ).length;
  const ready = ops.housekeepingRooms.filter((r) => r.status === "ready").length;
  const linenOpen = ops.linenQueue.filter(
    (l) => l.status === "pending" || l.status === "washing",
  ).length;

  return (
    <StationHome
      stationId="housekeeping"
      ops={ops}
      stats={[
        { label: "Need attention", value: dirty },
        { label: "Ready rooms", value: ready },
        { label: "Linen open", value: linenOpen },
        { label: "Board rooms", value: ops.housekeepingRooms.length },
      ]}
      actions={[
        {
          href: "/ops/reception",
          title: "Reception check-outs",
          desc: "See today’s checkouts that need turn-down",
        },
        {
          href: "/ops/accounts/purchases?type=housekeeping",
          title: "HK supplies purchases",
          desc: "Phenyl, cleaners, supplies purchase book",
        },
        {
          href: "/ops/accounts/purchases?type=dhobi",
          title: "Dhobi purchases",
          desc: "Laundry vendor bills",
        },
        {
          href: "/ops/accounts/purchases?type=clothes",
          title: "Clothes / linen buy",
          desc: "Towels, sheets purchase links",
        },
        {
          href: "/ops/store",
          title: "Store outward",
          desc: "Issue cleaning stock to floors",
        },
        {
          href: "/ops/outward",
          title: "Outward entry",
          desc: "Record issues to housekeeping",
        },
      ]}
    >
      <HousekeepingBoard rooms={ops.housekeepingRooms} linen={ops.linenQueue} />
      <p className="mt-6 text-sm text-[var(--ag-muted)]">
        Tip: after checkout, mark room Dirty → Cleaning → Ready, then tell{" "}
        <Link href="/ops/reception" className="text-[var(--ag-red)] underline">
          Reception
        </Link>
        .
      </p>
    </StationHome>
  );
}
