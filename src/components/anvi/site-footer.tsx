"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  receptionPhone?: string;
  roomsPhone?: string;
  foodPhone?: string;
  email?: string;
  address?: string;
};

export function SiteFooter({
  receptionPhone = "7569494949",
  roomsPhone,
  foodPhone,
  email = "stay@anvigrand.in",
  address = "Anvi Grand, near Benz Circle, Eluru Road, Vijayawada",
}: Props) {
  const pathname = usePathname();
  if (pathname.startsWith("/ops")) return null;

  const reception = receptionPhone.trim() || "7569494949";
  const rooms = (roomsPhone || reception).trim();
  const food = (foodPhone || reception).trim();

  return (
    <footer className="border-t-4 border-[var(--ag-red)] bg-[linear-gradient(180deg,#3a1618_0%,#2a0e10_100%)] text-white">
      <div className="h-1.5 bg-[linear-gradient(90deg,var(--ag-red)_0%,var(--ag-gold)_50%,var(--ag-red)_100%)]" />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logos/ag-mark.svg"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-sm ring-1 ring-[var(--ag-gold)]/50"
            />
            <p className="font-display text-xl tracking-[0.12em] text-[var(--ag-gold-soft)]">
              ANVI GRAND
            </p>
          </div>
          <div className="mt-4">
            <Image
              src="/logos/iraa.svg"
              alt="IRAA"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Hotel stays and celebrations near Benz Circle, with Andhra flavours
            from our IRAA kitchen.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ag-gold)]">
            Visit & call
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            {address}
            <br />
            <span className="mt-3 block text-xs uppercase tracking-[0.14em] text-[var(--ag-gold)]">
              Reception
            </span>
            <a
              href={`tel:${reception}`}
              className="inline-block text-base font-semibold text-[#ffb4b4] hover:underline"
            >
              {reception}
            </a>
            <br />
            <span className="mt-2 block text-xs uppercase tracking-[0.14em] text-[var(--ag-gold)]">
              Rooms booking
            </span>
            <a
              href={`tel:${rooms}`}
              className="inline-block text-base font-semibold text-[#ffb4b4] hover:underline"
            >
              {rooms}
            </a>
            <br />
            <span className="mt-2 block text-xs uppercase tracking-[0.14em] text-[var(--ag-gold)]">
              Food booking
            </span>
            <a
              href={`tel:${food}`}
              className="inline-block text-base font-semibold text-[#ffb4b4] hover:underline"
            >
              {food}
            </a>
            <br />
            <a href={`mailto:${email}`} className="mt-2 inline-block hover:text-white">
              {email}
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
              Banquet halls
            </Link>
            <Link href="/party-hall" className="hover:text-[#ffb4b4]">
              Party hall
            </Link>
            <Link href="/food" className="hover:text-[#ffb4b4]">
              IRAA menu
            </Link>
            <Link href="/buffet" className="hover:text-[#ffb4b4]">
              Buffet booking
            </Link>
            <Link href="/gallery" className="hover:text-[#ffb4b4]">
              Gallery
            </Link>
            <Link href="/contact" className="hover:text-[#ffb4b4]">
              Contact & map
            </Link>
            <Link href="/facilities" className="hover:text-[#ffb4b4]">
              Facilities
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-black/20 px-5 py-5 text-center text-xs text-white/60 md:px-8">
        © {new Date().getFullYear()} ANVI GRAND · Benz Circle, Eluru Road, Vijayawada
      </div>
    </footer>
  );
}
