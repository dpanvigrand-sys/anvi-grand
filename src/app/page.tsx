import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/anvi/hero";
import { formatINR } from "@/lib/format";
import { getBuffets, getCatalog, getFacilities, getRooms, getVenues } from "@/lib/store";

export default async function HomePage() {
  const catalog = await getCatalog();
  const hotel = catalog.hotel;
  const rooms = await getRooms();
  const venues = await getVenues();
  const buffets = await getBuffets();
  const facilities = await getFacilities();
  const featured = rooms.slice(0, 3);
  const banquet = venues.find((v) => v.type === "banquet");
  const party = venues.find((v) => v.type === "party-hall");

  return (
    <>
      <Hero />
      <section className="mx-auto w-full max-w-6xl border-l-4 border-[var(--ag-red)] px-5 py-20 md:px-8 md:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ag-red)]">Welcome</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl text-[var(--ag-ink)] md:text-5xl">
          A Vijayawada landmark for stays and celebrations.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--ag-muted)]">
          {hotel.tagline}. Book rooms, reserve banquet or party hall, and order from{" "}
          {hotel.foodBrand}—all flowing into the same ops desk.
        </p>
      </section>

      <section className="border-y-2 border-[var(--ag-red)]/25 bg-[var(--ag-red)]/[0.04]">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ag-red)]">Rooms</p>
              <h2 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">Rest well on Eluru Road</h2>
            </div>
            <Link href="/rooms" className="inline-flex h-9 items-center bg-[var(--ag-red)] px-4 text-sm font-medium text-white hover:bg-[var(--ag-red-deep)]">All rooms</Link>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {featured.map((room) => (
              <article key={room.id} className="group">
                <Link href={`/rooms/${room.id}`} className="relative block aspect-[4/3] overflow-hidden ring-1 ring-[var(--ag-red)]/20 transition group-hover:ring-[var(--ag-red)]">
                  <Image src={room.image} alt={room.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
                  <span className="absolute left-0 top-0 h-1 w-full bg-[var(--ag-red)]" />
                </Link>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl text-[var(--ag-ink)]"><Link href={`/rooms/${room.id}`}>{room.name}</Link></h3>
                  <p className="text-sm font-semibold text-[var(--ag-red)]">
                    {formatINR(room.pricePerNight)}
                    <span className="font-normal text-[var(--ag-muted)]"> / night</span>
                  </p>
                </div>
                <p className="mt-1 text-sm text-[var(--ag-muted)]">{room.tagline}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:px-8">
        {[banquet, party].filter(Boolean).map((venue) => (
          <article key={venue!.id} className="relative min-h-[360px] overflow-hidden ring-2 ring-[var(--ag-red)]/40">
            <Image src={venue!.image} alt={venue!.name} fill className="object-cover" sizes="50vw" />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(227,27,35,0.75)_0%,rgba(74,28,22,0.7)_100%)]" />
            <div className="relative flex h-full min-h-[360px] flex-col justify-end p-8 text-white">
              <p className="inline-flex w-fit bg-[var(--ag-red)] px-2 py-0.5 text-xs uppercase tracking-[0.18em] text-white">{venue!.type === "banquet" ? "Banquet" : "Party hall"}</p>
              <h3 className="mt-2 font-display text-3xl">{venue!.name}</h3>
              <p className="mt-2 max-w-md text-sm text-white/80">{venue!.tagline}</p>
              <Link href={venue!.type === "banquet" ? "/banquet" : "/party-hall"} className="mt-6 inline-flex h-10 w-fit items-center bg-[var(--ag-red)] px-5 text-sm font-medium text-white hover:bg-[var(--ag-red-deep)]">
                Enquire · from {formatINR(venue!.priceFrom)}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="bg-[var(--ag-red)] text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center md:px-8">
          <div>
            <Image src="/logos/chiguru.svg" alt="CHIGURU" width={160} height={44} className="h-10 w-auto brightness-110" />
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Andhra flavours, hotel kitchen pace.</h2>
            <p className="mt-4 max-w-md text-white/85">Order to your room or book the weekend buffet. Tickets land on the KT board instantly.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/food" className="inline-flex h-11 items-center bg-white px-6 text-sm font-semibold text-[var(--ag-red)]">Order online</Link>
              <Link href="/buffet" className="inline-flex h-11 items-center border-2 border-white px-6 text-sm font-medium">Buffet booking</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden ring-4 ring-white/30">
            <Image src={buffets[0]?.image || facilities[0]?.image || rooms[0].image} alt="CHIGURU dining" fill className="object-cover" sizes="40vw" />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl border-l-4 border-[var(--ag-red)] px-5 py-20 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ag-red)]">Location</p>
        <h2 className="mt-3 font-display text-4xl text-[var(--ag-ink)]">Near Benz Circle</h2>
        <p className="mt-3 max-w-xl text-[var(--ag-muted)]">
          {hotel.address}. Phone <a href={`tel:${hotel.phone}`} className="font-semibold text-[var(--ag-red)]">{hotel.phone}</a>.
        </p>
        <div className="mt-8 overflow-hidden border-2 border-[var(--ag-red)]/30 bg-white">
          <iframe title="ANVI GRAND map" src="https://maps.google.com/maps?q=Benz%20Circle%20Vijayawada&t=&z=15&ie=UTF8&iwloc=&output=embed" className="h-[360px] w-full border-0" loading="lazy" />
        </div>
      </section>
    </>
  );
}
