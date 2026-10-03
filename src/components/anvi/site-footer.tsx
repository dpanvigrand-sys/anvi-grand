"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SITE_URL = "https://www.stayanvigrand.com";

const DEFAULT_SOCIAL = {
  instagram: "https://www.instagram.com/stayanvigrand",
  facebook: "https://www.facebook.com/stayanvigrand",
  youtube: "https://www.youtube.com/@stayanvigrand",
  x: "https://x.com/stayanvigrand",
} as const;

type Props = {
  receptionPhone?: string;
  roomsPhone?: string;
  foodPhone?: string;
  email?: string;
  address?: string;
  website?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialYoutube?: string;
  socialX?: string;
};

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/85 transition hover:border-[var(--ag-gold)] hover:bg-white/10 hover:text-[var(--ag-gold-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ag-gold)]"
    >
      {children}
    </a>
  );
}

export function SiteFooter({
  receptionPhone = "7569494949",
  roomsPhone,
  foodPhone,
  email = "dpanvigrand@gmail.com",
  address = "Anvi Grand, near Benz Circle, 54-15-1A, Beside Yalamanchili complex, Dr. Ramesh Hospital Road, Ring Rd, Vijayawada, Andhra Pradesh 520008",
  website = SITE_URL,
  socialInstagram,
  socialFacebook,
  socialYoutube,
  socialX,
}: Props) {
  const pathname = usePathname();
  if (pathname.startsWith("/ops")) return null;

  const reception = receptionPhone.trim() || "7569494949";
  const rooms = (roomsPhone || reception).trim();
  const food = (foodPhone || reception).trim();
  const mail = email.trim() || "dpanvigrand@gmail.com";
  const site = (website || SITE_URL).replace(/\/$/, "");
  const siteLabel = site.replace(/^https?:\/\//, "");

  const social = [
    {
      href: (socialInstagram || DEFAULT_SOCIAL.instagram).trim(),
      label: "Instagram",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </svg>
      ),
    },
    {
      href: (socialFacebook || DEFAULT_SOCIAL.facebook).trim(),
      label: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M14.5 8.5V6.9c0-.7.5-1.1 1.2-1.1H17V3h-2.1C12.3 3 11 4.4 11 6.7v1.8H9v2.9h2V21h3.5v-9.6h2.3l.4-2.9h-2.7z" />
        </svg>
      ),
    },
    {
      href: (socialYoutube || DEFAULT_SOCIAL.youtube).trim(),
      label: "YouTube",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M22 12.2c0-2.2-.3-3.8-.5-4.6-.3-.9-1-1.6-1.9-1.9C18.2 5.3 12 5.3 12 5.3s-6.2 0-7.6.4c-.9.3-1.6 1-1.9 1.9-.3.8-.5 2.4-.5 4.6s.2 3.8.5 4.6c.3.9 1 1.6 1.9 1.9 1.4.4 7.6.4 7.6.4s6.2 0 7.6-.4c.9-.3 1.6-1 1.9-1.9.3-.8.5-2.4.5-4.6zM10.3 15.1V9.3l5.1 2.9-5.1 2.9z" />
        </svg>
      ),
    },
    {
      href: (socialX || DEFAULT_SOCIAL.x).trim(),
      label: "X",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M3.5 3h4.1l4.1 5.7L16.7 3H21l-6.6 7.5L21.5 21h-4.1l-4.5-6.3L7.3 21H3l6.9-7.9L3.5 3zm3.2 1.7 10.6 14.6h1.7L8.3 4.7H6.7z" />
        </svg>
      ),
    },
  ].filter((item) => item.href.length > 0);

  return (
    <footer className="border-t-4 border-[var(--ag-red)] bg-[linear-gradient(180deg,#3a1618_0%,#2a0e10_100%)] text-white">
      <div className="h-1.5 bg-[linear-gradient(90deg,var(--ag-red)_0%,var(--ag-gold)_50%,var(--ag-red)_100%)]" />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8 md:py-14">
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
              src="/logos/airaa.svg"
              alt="AIRAA Dine"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Hotel stays and celebrations near Benz Circle, with Andhra flavours
            from AIRAA Dine.
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
            <span className="mt-3 block text-xs uppercase tracking-[0.14em] text-[var(--ag-gold)]">
              Email
            </span>
            <a
              href={`mailto:${mail}`}
              className="inline-block break-all text-base font-semibold text-[#ffb4b4] hover:underline"
            >
              {mail}
            </a>
            <br />
            <span className="mt-3 block text-xs uppercase tracking-[0.14em] text-[var(--ag-gold)]">
              Website
            </span>
            <a
              href={site}
              className="inline-block break-all text-base font-semibold text-[#ffb4b4] hover:underline"
            >
              {siteLabel}
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
              AIRAA Dine menu
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
      <div className="border-t border-white/10 bg-black/20 px-5 py-5 md:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-center text-xs text-white/60 sm:text-left">
            © {new Date().getFullYear()} ANVI GRAND · near Benz Circle, Ring Rd,
            Vijayawada ·{" "}
            <a href={site} className="text-white/75 hover:text-white">
              {siteLabel}
            </a>
          </p>
          <nav aria-label="Social media" className="flex items-center gap-2.5">
            {social.map((item) => (
              <SocialIcon key={item.label} href={item.href} label={item.label}>
                {item.icon}
              </SocialIcon>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
