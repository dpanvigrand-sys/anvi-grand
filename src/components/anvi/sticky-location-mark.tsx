"use client";

import { MapPin } from "lucide-react";
import { usePathname } from "next/navigation";

const MAPS_URL = "https://maps.app.goo.gl/F5K19Sff5QfKbEZs5";

/** Sticky location pin — bottom-right while guest pages scroll. Hidden on /ops. */
export function StickyLocationMark({
  address = "Anvi Grand, near Benz Circle, Eluru Road, Vijayawada",
}: {
  address?: string;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/ops")) return null;

  return (
    <a
      href={MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open map — ${address}`}
      title={address}
      className="fixed bottom-5 right-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ag-red)] text-white shadow-[0_8px_24px_rgba(90,0,0,0.35)] ring-2 ring-[var(--ag-gold)]/70 transition hover:scale-105 hover:bg-[var(--ag-maroon)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ag-gold)] md:bottom-7 md:right-7 md:h-16 md:w-16"
    >
      <MapPin className="h-6 w-6 md:h-8 md:w-8" strokeWidth={2.25} aria-hidden />
      <span className="sr-only">Location — open in Google Maps</span>
    </a>
  );
}
