import type { Metadata } from "next";
import Image from "next/image";
import { VenueBookingForm } from "@/components/anvi/venue-booking-form";
import { formatINR } from "@/lib/format";
import { getVenues } from "@/lib/store";

export const metadata: Metadata = { title: "Party Hall" };
export const dynamic = "force-dynamic";

export default async function PartyHallPage() {
  const venues = await getVenues("party-hall");
  const venue = venues[0];
  if (!venue) {
    return <div className="mx-auto max-w-3xl px-5 py-20 text-center text-[var(--ag-muted)]">Party hall unavailable.</div>;
  }
  return (
    <div>
      <section className="relative h-[45vh] min-h-[280px] overflow-hidden">
        <Image src={venue.image} alt={venue.name} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(227,27,35,0.7),rgba(90,20,24,0.68))]" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-10 md:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Party hall</p>
          <h1 className="mt-2 font-display text-5xl text-white">{venue.name}</h1>
          <p className="mt-3 max-w-xl text-white/80">{venue.tagline} · from {formatINR(venue.priceFrom)}</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <div>
          <h2 className="font-display text-3xl text-[var(--ag-ink)]">Celebrate with CHIGURU energy</h2>
          <p className="mt-4 leading-relaxed text-[var(--ag-muted)]">{venue.description}</p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--ag-ink)]">
            <li>Up to {venue.capacity} guests</li>
            {venue.amenities.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
        <div className="border border-[var(--ag-line)] bg-white/80 p-5 md:p-8">
          <h3 className="font-display text-2xl text-[var(--ag-ink)]">Book the hall</h3>
          <div className="mt-6"><VenueBookingForm venue={venue} /></div>
        </div>
      </section>
    </div>
  );
}
