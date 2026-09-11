"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/ops")) return null;

  return (
    <footer className="border-t-4 border-[var(--ag-red)] bg-[linear-gradient(180deg,#3a1618_0%,#2a0e10_100%)] text-white">
      <div className="h-1.5 bg-[var(--ag-red)]" />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-xl tracking-[0.12em]">ANVI GRAND</p>
          <div className="mt-4">
            <Image
              src="/logos/chiguru.svg"
              alt="CHIGURU"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Hotel stays and celebrations near Benz Circle, with Andhra flavours
            from our CHIGURU kitchen.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb4b4]">
            Visit
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            Anvi Grand, near Benz Circle
            <br />
            Eluru Road, Vijayawada
            <br />
            <a
              href="tel:7569494949"
              className="mt-2 inline-block text-base font-semibold text-[#ffb4b4] hover:underline"
            >
              7569494949
            </a>
            <br />
            <a href="mailto:stay@anvigrand.in" className="hover:text-white">
              stay@anvigrand.in
            </a>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb4b4]">
            Explore
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/80">
            <Link href="/rooms" className="hover:text-[#ffb4b4]">
              Rooms & rates
            </Link>
            <Link href="/banquet" className="hover:text-[#ffb4b4]">
              Banquet Halls
            </Link>
            <Link href="/food" className="hover:text-[#ffb4b4]">
              CHIGURU menu
            </Link>
            <Link href="/gallery" className="hover:text-[#ffb4b4]">
              Gallery
            </Link>
            <Link href="/contact" className="hover:text-[#ffb4b4]">
              Contact & map
            </Link>
            <Link href="/ops" className="hover:text-[#ffb4b4]">
              Staff ops
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-black/20 px-5 py-5 text-center text-xs text-white/60 md:px-8">
        © {new Date().getFullYear()} ANVI GRAND · Vijayawada · Demo password for
        ops in README
      </div>
    </footer>
  );
}
