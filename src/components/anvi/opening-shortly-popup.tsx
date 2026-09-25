"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const DISMISS_KEY = "ag-opening-shortly";

type Props = {
  enabled?: boolean;
  title?: string;
  message?: string;
  phone?: string;
  hotelName?: string;
};

export function OpeningShortlyPopup({
  enabled = false,
  title = "Opening Shortly",
  message = "ANVI GRAND near Benz Circle is getting ready for you — rooms, banquet celebrations, and IRAA Dine. Call reception to reserve your stay.",
  phone = "7569494949",
  hotelName = "ANVI GRAND",
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headline = title.trim() || "Opening Shortly";
  const body =
    message.trim() ||
    "ANVI GRAND near Benz Circle is getting ready for you — rooms, banquet celebrations, and IRAA Dine. Call reception to reserve your stay.";
  const desk = phone.trim() || "7569494949";

  useEffect(() => {
    if (!enabled || pathname.startsWith("/ops")) {
      setOpen(false);
      return;
    }
    const stamp = `${headline}|${body}`;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === stamp) {
        setOpen(false);
        return;
      }
    } catch {
      /* private mode */
    }
    const t = window.setTimeout(() => setOpen(true), 280);
    return () => window.clearTimeout(t);
  }, [enabled, pathname, headline, body]);

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, `${headline}|${body}`);
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!enabled || pathname.startsWith("/ops") || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ag-opening-title"
      aria-describedby="ag-opening-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(12,4,4,0.72)] backdrop-blur-[3px] transition"
        aria-label="Dismiss opening notice"
        onClick={dismiss}
      />

      <div className="animate-opening-pop relative z-10 w-full max-w-[26rem] overflow-hidden rounded-sm shadow-[0_28px_80px_rgba(0,0,0,0.45)] sm:max-w-md">
        <div className="h-[3px] bg-[linear-gradient(90deg,#6b0000_0%,#d4af37_50%,#6b0000_100%)]" />
        <div className="relative bg-[linear-gradient(165deg,#5a0000_0%,#8b0000_42%,#4a0000_100%)] px-6 pb-6 pt-5 text-white sm:px-8 sm:pb-8 sm:pt-7">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 20% 0%, rgba(212,175,55,0.28), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(0,0,0,0.35), transparent 50%)",
            }}
            aria-hidden
          />

          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>

          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--ag-gold-soft)]">
              {hotelName}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">
              Vijayawada · Benz Circle
            </p>
            <h2
              id="ag-opening-title"
              className="mt-4 font-display text-[2.15rem] leading-[1.05] tracking-[0.04em] text-white sm:text-[2.45rem]"
            >
              {headline}
            </h2>
            <div className="mt-4 h-px w-16 bg-[var(--ag-gold)]/70" />
            <p
              id="ag-opening-desc"
              className="mt-4 text-[14px] leading-relaxed text-white/80 sm:text-[15px]"
            >
              {body}
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <a
                href={`tel:${desk}`}
                className="inline-flex h-12 flex-1 items-center justify-center bg-[linear-gradient(180deg,#e8c76a_0%,#d4af37_55%,#c49a2a_100%)] px-5 text-sm font-semibold tracking-wide text-[var(--ag-red-deep)] shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition hover:brightness-105"
              >
                Call {desk}
              </a>
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex h-12 flex-1 items-center justify-center border border-[var(--ag-gold)]/65 bg-white/5 px-5 text-sm font-semibold tracking-wide text-white backdrop-blur-[2px] transition hover:bg-white/10"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
