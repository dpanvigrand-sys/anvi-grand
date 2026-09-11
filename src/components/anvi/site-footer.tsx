"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/ops")) return null;

  return (
    <footer className="border-t border-[var(--ag-line)] bg-[var(--ag-chocolate)] text-[var(--ag-cream-white)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-3xl text-white">ANVI GRAND</p>
          <p className="mt-2 text-sm uppercase tracking-[0.16em] text-white/55">
            CHIGURU
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Hotel stays and celebrations near Benz Circle, with Andhra flavours
            from our CHIGURU kitchen.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Visit</p>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            Anvi Grand, near Benz Circle
            <br />
            Eluru Road, Vijayawada
            <br />
            <a href="tel:7569494949" className="hover:text-white">
              7569494949
            </a>
            <br />
            <a href="mailto:stay@anvigrand.in" className="hover:text-white">
              stay@anvigrand.in
            </a>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/80">
            <Link href="/rooms" className="hover:text-white">
              Rooms
            </Link>
            <Link href="/banquet" className="hover:text-white">
              Banquet
            </Link>
            <Link href="/food" className="hover:text-white">
              CHIGURU food
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
            <Link href="/ops" className="hover:text-white">
              Staff ops
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/45 md:px-8">
        © {new Date().getFullYear()} ANVI GRAND · Vijayawada. Demo store in data/ops.json.
      </div>
    </footer>
  );
}
