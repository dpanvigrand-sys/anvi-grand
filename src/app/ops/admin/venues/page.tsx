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
        Banquet & party hall rates
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Edit day price (₹) and guest capacity for venues including{" "}
        <strong>Royal Grand Ballroom</strong>. Public pages at{" "}
        <Link href="/banquet" className="text-[var(--ag-red)] underline">
          /banquet
        </Link> 
        and 
        <Link href="/party-hall" className="text-[var(--ag-red)] underline">
          /party-hall
        </Link> 
        read <code>data/catalog.json</code> live.
      </p>
      <p className="mt-2 text-sm text-[var(--ag-muted)]">
        Entry: <code>/ops</code> → unlock with <code>anviops2026</code> → 
        <strong>Venues</strong>. Direct: 
        <code>/ops/admin/venues#venue-royal-grand-ballroom</code>.
      </p>
      <div className="mt-8">
        <VenuesAdmin initialVenues={venues} />
      </div>
    </div>
  );
}
