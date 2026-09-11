import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--hm-line)] bg-[var(--hm-deep)] text-[var(--hm-foam)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-3xl">Havenmere</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            A lakeside boutique hotel on the north shore—quiet rooms, slow
            mornings, and dinners that linger.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">
            Visit
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            48 Shoreline Road
            <br />
            North Haven, ME 04853
            <br />
            +1 (207) 555-0148
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">
            Explore
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/80">
            <Link href="/rooms" className="hover:text-white">
              Rooms & suites
            </Link>
            <Link href="/book" className="hover:text-white">
              Make a reservation
            </Link>
            <Link href="/contact" className="hover:text-white">
              Concierge
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/45 md:px-8">
        © {new Date().getFullYear()} Havenmere Hotel. Local demo store —
        bookings saved to data/bookings.json.
      </div>
    </footer>
  );
}
