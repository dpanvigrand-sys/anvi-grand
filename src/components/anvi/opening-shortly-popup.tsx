"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

type Props = {
  enabled?: boolean;
  title?: string;
  message?: string;
  phone?: string;
  hotelName?: string;
};

/**
 * Small guest notice: appears automatically when the site opens,
 * then fades away after a few seconds. Turn off in Admin → Settings
 * when the hotel is fully open (delete / disable).
 */
export function OpeningShortlyPopup({
  enabled = false,
  title = "Opening Shortly",
  message = "Rooms, banquet & IRAA Dine near Benz Circle — call to reserve.",
  phone = "7569494949",
  hotelName = "ANVI GRAND",
}: Props) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const headline = title.trim() || "Opening Shortly";
  const body =
    message.trim() ||
    "Rooms, banquet & IRAA Dine near Benz Circle — call to reserve.";
  const desk = phone.trim() || "7569494949";
  const onGuest = enabled && !pathname.startsWith("/ops");

  useEffect(() => {
    if (!onGuest) {
      setVisible(false);
      setLeaving(false);
      return;
    }

    setLeaving(false);
    const show = window.setTimeout(() => setVisible(true), 120);
    const hide = window.setTimeout(() => {
      setLeaving(true);
      window.setTimeout(() => setVisible(false), 380);
    }, 4200);

    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [onGuest, pathname, headline, body]);

  function dismiss() {
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 280);
  }

  if (!onGuest || !visible) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center p-4 sm:inset-0 sm:items-start sm:pt-[18vh] ${
        leaving ? "animate-opening-out" : "animate-opening-pop"
      }`}
      role="status"
      aria-live="polite"
      aria-label={headline}
    >
      <div className="pointer-events-auto w-full max-w-[20.5rem] overflow-hidden rounded-sm shadow-[0_16px_48px_rgba(0,0,0,0.4)] sm:max-w-sm">
        <div className="h-[2px] bg-[linear-gradient(90deg,#6b0000_0%,#d4af37_50%,#6b0000_100%)]" />
        <div className="relative bg-[linear-gradient(165deg,#5a0000_0%,#8b0000_48%,#4a0000_100%)] px-4 pb-4 pt-3.5 text-white">
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center text-white/65 transition hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>

          <p className="pr-8 text-[9px] font-semibold uppercase tracking-[0.3em] text-[var(--ag-gold-soft)]">
            {hotelName}
          </p>
          <p
            id="ag-opening-title"
            className="mt-1.5 font-display text-[1.55rem] leading-none tracking-[0.03em] text-white"
          >
            {headline}
          </p>
          <p
            id="ag-opening-desc"
            className="mt-2 text-[12px] leading-snug text-white/80"
          >
            {body}
          </p>
          <a
            href={`tel:${desk}`}
            className="mt-3 inline-flex h-9 items-center justify-center bg-[linear-gradient(180deg,#e8c76a_0%,#d4af37_55%,#c49a2a_100%)] px-4 text-[11px] font-semibold tracking-wide text-[var(--ag-red-deep)] transition hover:brightness-105"
          >
            Call {desk}
          </a>
        </div>
      </div>
    </div>
  );
}
