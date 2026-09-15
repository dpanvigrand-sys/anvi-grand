import Image from "next/image";
import Link from "next/link";
import { OpsAlerts } from "@/components/ops/ops-alerts";
import { buildOpsAlerts } from "@/lib/ops-alerts";
import { OPS_STATIONS, resolveStationLabel } from "@/lib/ops-stations";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function OpsHomePage() {
  const ops = await getOps();
  const settings = ops.settings;
  const alerts = buildOpsAlerts(ops, settings);

  return (
    <div>
      <div className="relative overflow-hidden border border-[var(--ag-line)] bg-[linear-gradient(135deg,#fff8f7_0%,#ffffff_45%,#f3ebe8_100%)]">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_70%_30%,rgba(139,0,0,0.12),transparent_60%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4 px-5 py-8 md:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">
              Multi-client stations · 9 desks
            </p>
            <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)] md:text-5xl">
              {settings.hotelNameLine} OPS
            </h1>
            <p className="mt-2 max-w-xl text-[var(--ag-muted)]">
              Pick your client PC station. One job per card — easy for desk staff.
              Restaurant brand: <strong className="text-[var(--ag-maroon)]">{settings.foodBrandLine}</strong>.
            </p>
          </div>
          <Image
            src="/logos/anvi-grand.svg"
            alt="ANVI GRAND"
            width={160}
            height={40}
            className="h-10 w-auto opacity-95"
          />
        </div>
      </div>

      <div className="mt-6">
        <OpsAlerts stationId="hub" initialAlerts={alerts} />
      </div>

      <section className="mt-8" aria-labelledby="ops-quick-edit">
        <h2 id="ops-quick-edit" className="font-display text-2xl text-[var(--ag-ink)]">
          Quick edit
        </h2>
        <p className="mt-1 text-sm text-[var(--ag-muted)]">
          Primary CMS — add, edit, or delete gallery photos, menu, room rates, and hall prices.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/ops/admin/photos"
            className="group flex min-h-[140px] flex-col overflow-hidden border-2 border-[var(--ag-red)] bg-white transition hover:shadow-[0_8px_24px_rgba(139,0,0,0.12)]"
          >
            <div className="h-2 w-full bg-[var(--ag-red)]" />
            <div className="flex flex-1 flex-col justify-center p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-maroon)]">
                Admin CMS
              </p>
              <h3 className="mt-2 font-display text-2xl text-[var(--ag-ink)] group-hover:text-[var(--ag-red)] md:text-3xl">
                Photos — Add / Edit / Delete
              </h3>
              <p className="mt-2 text-sm text-[var(--ag-muted)]">
                Gallery, hero, rooms, food & banquet images · /ops/admin/photos
              </p>
            </div>
          </Link>
          <Link
            href="/ops/admin/food"
            className="group flex min-h-[140px] flex-col overflow-hidden border-2 border-[var(--ag-red)] bg-white transition hover:shadow-[0_8px_24px_rgba(139,0,0,0.12)]"
          >
            <div className="h-2 w-full bg-[var(--ag-maroon)]" />
            <div className="flex flex-1 flex-col justify-center p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-maroon)]">
                Admin CMS · CHIGURU
              </p>
              <h3 className="mt-2 font-display text-2xl text-[var(--ag-ink)] group-hover:text-[var(--ag-red)] md:text-3xl">
                Menu — Add / Edit / Delete
              </h3>
              <p className="mt-2 text-sm text-[var(--ag-muted)]">
                Dishes, prices, buffets · /ops/admin/food
              </p>
            </div>
          </Link>
          <Link
            href="/ops/admin/rooms"
            className="group flex min-h-[140px] flex-col overflow-hidden border-2 border-[var(--ag-red)] bg-white transition hover:shadow-[0_8px_24px_rgba(139,0,0,0.12)]"
          >
            <div className="h-2 w-full bg-[var(--ag-red)]" />
            <div className="flex flex-1 flex-col justify-center p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-maroon)]">
                Admin CMS · Rooms
              </p>
              <h3 className="mt-2 font-display text-2xl text-[var(--ag-ink)] group-hover:text-[var(--ag-red)] md:text-3xl">
                Rooms prices — Add / Edit / Delete
              </h3>
              <p className="mt-2 text-sm text-[var(--ag-muted)]">
                Nightly ₹ rates · /ops/admin/rooms
              </p>
            </div>
          </Link>
          <Link
            href="/ops/admin/venues"
            className="group flex min-h-[140px] flex-col overflow-hidden border-2 border-[var(--ag-red)] bg-white transition hover:shadow-[0_8px_24px_rgba(139,0,0,0.12)]"
          >
            <div className="h-2 w-full bg-[var(--ag-maroon)]" />
            <div className="flex flex-1 flex-col justify-center p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-maroon)]">
                Admin CMS · Halls
              </p>
              <h3 className="mt-2 font-display text-2xl text-[var(--ag-ink)] group-hover:text-[var(--ag-red)] md:text-3xl">
                Venues / halls prices
              </h3>
              <p className="mt-2 text-sm text-[var(--ag-muted)]">
                Banquet + mini hall ₹/day · /ops/admin/venues
              </p>
            </div>
          </Link>
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Room bookings", ops.roomBookings.length],
          ["Food / KT open", ops.kitchenTickets.filter((t) => t.status !== "bumped").length],
          ["Venue events", ops.venueBookings.length],
          ["HK dirty/clean", ops.housekeepingRooms.filter((r) => r.status === "dirty" || r.status === "cleaning").length],
        ].map(([label, n]) => (
          <div key={String(label)} className="border border-[var(--ag-line)] bg-white px-4 py-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">{label}</p>
            <p className="mt-2 font-display text-3xl text-[var(--ag-red)]">{n}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-2xl text-[var(--ag-ink)]">
        Stations
      </h2>
      <p className="mt-1 text-sm text-[var(--ag-muted)]">
        Open each on its own Chrome window for client PCs (Reception.1 … Banquet.1).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {OPS_STATIONS.map((s) => {
          const label = resolveStationLabel(s, settings);
          return (
            <Link
              key={s.id}
              href={s.href}
              className="group flex min-h-[168px] flex-col overflow-hidden border border-[var(--ag-line)] bg-white transition hover:border-[var(--ag-red)] hover:shadow-[0_8px_24px_rgba(139,0,0,0.08)]"
            >
              <div className={`h-2 w-full ${s.tone}`} />
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-maroon)]">
                  {s.clientLabel}
                </p>
                <h3 className="mt-2 font-display text-2xl text-[var(--ag-ink)] group-hover:text-[var(--ag-red)]">
                  {label.en}
                </h3>
                <p className="mt-3 text-sm leading-snug text-[var(--ag-muted)]">
                  {label.job}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 border border-[var(--ag-line)] bg-white p-4 text-sm">
        <Link href="/ops/admin/photos" className="font-semibold text-[var(--ag-red)] underline">
          Photos — Add / Edit / Delete →
        </Link>
        <Link href="/ops/admin/food" className="font-semibold text-[var(--ag-red)] underline">
          Menu — Add / Edit / Delete →
        </Link>
        <Link href="/ops/admin/rooms" className="font-semibold text-[var(--ag-red)] underline">
          Rooms prices →
        </Link>
        <Link href="/ops/admin/venues" className="font-semibold text-[var(--ag-red)] underline">
          Venues / halls prices →
        </Link>
        <Link href="/ops/accounts" className="text-[var(--ag-red)] underline">
          Accounts.1 →
        </Link>
        <Link href="/ops/admin/bookings" className="text-[var(--ag-red)] underline">
          Bookings reports →
        </Link>
        <Link href="/ops/admin/venue-bookings" className="text-[var(--ag-red)] underline">
          Venue bookings ledger →
        </Link>
        <Link href="/ops/inward" className="text-[var(--ag-red)] underline">
          Inward →
        </Link>
        <Link href="/ops/outward" className="text-[var(--ag-red)] underline">
          Outward →
        </Link>
        <Link href="/ops/admin/settings" className="text-[var(--ag-red)] underline">
          Ops settings →
        </Link>
      </div>
    </div>
  );
}
