import Link from "next/link";
import { VenuesAdmin } from "@/components/ops/venues-admin";
import { getVenues } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminVenuesPage() {
  const venues = await getVenues();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
        Admin · Banquet / Venues
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">
        Banquet & mini hall prices
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Add, edit, or delete day price (₹) and guest capacity. Banquet:{" "}
        <strong>Royal Grand Ballroom</strong> (
        <a
          href="#venue-royal-grand-ballroom"
          className="text-[var(--ag-red)] underline"
        >
          jump
        </a>
        ). Mini / party hall:{" "}
        <strong>Imperial Ruby Mini Hall</strong> (
        <a
          href="#venue-imperial-ruby-mini"
          className="text-[var(--ag-red)] underline"
        >
          jump
        </a>
        ). Public pages:{" "}
        <Link href="/banquet" className="text-[var(--ag-red)] underline">
          /banquet
        </Link>{" "}
        and{" "}
        <Link href="/party-hall" className="text-[var(--ag-red)] underline">
          /party-hall
        </Link>
        .
      </p>
      <p className="mt-2 text-sm text-[var(--ag-muted)]">
        Entry: <code>/ops?unlock=anviops2026</code> → Quick edit{" "}
        <strong>Venues / halls prices</strong> or Admin.1. Direct:{" "}
        <code>/ops/admin/venues#venue-royal-grand-ballroom</code> ·{" "}
        <code>/ops/admin/venues#venue-imperial-ruby-mini</code>.
      </p>
      <div className="mt-8">
        <VenuesAdmin initialVenues={venues} />
      </div>
    </div>
  );
}
