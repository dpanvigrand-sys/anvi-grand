"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/food", label: "Dining" },
  { href: "/banquet", label: "Banquet" },
  { href: "/party-hall", label: "Party Hall" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

type Props = { receptionPhone?: string };

export function SiteHeader({ receptionPhone = "7569494949" }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isOps = pathname.startsWith("/ops");
  const phone = receptionPhone.trim() || "7569494949";

  if (isOps) return null;

  return (
    <header className="sticky top-0 z-50 bg-[var(--ag-red)] text-white shadow-[0_2px_24px_rgba(60,0,0,0.35)]">
      <div className="h-[2px] bg-[linear-gradient(90deg,#6b0000,#d4af37,#6b0000)]" />
      <div className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-5 py-1.5 text-[10px] tracking-[0.12em] text-white/75 sm:gap-3 sm:py-2 sm:text-[11px] sm:tracking-[0.14em] md:px-8">
          <span className="hidden min-w-[7rem] shrink-0 sm:inline">Vijayawada</span>
          <a
            href={`tel:${phone}`}
            className="ml-auto shrink-0 font-medium text-[var(--ag-gold-soft)] hover:text-white"
          >
            <span className="sm:hidden">{phone}</span>
            <span className="hidden sm:inline">Reception {phone}</span>
          </a>
          {/* Tiny Badizo — top-right only; chala chinnaga, white border, no brand dominate */}
          <Link
            href="/"
            aria-label="Badizo"
            className="shrink-0 rounded-[1px] border border-white/95 bg-transparent p-px leading-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/badizo.png"
              alt="Badizo"
              className="h-3 w-auto max-w-[40px] object-contain sm:h-3.5 sm:max-w-[48px]"
            />
          </Link>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3 md:gap-4 md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/ag-mark.svg"
            alt=""
            className="h-10 w-10 shrink-0 ring-1 ring-[var(--ag-gold)]/50 sm:h-11 sm:w-11"
          />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-display text-base tracking-[0.14em] text-white sm:text-lg md:text-xl">
              ANVI GRAND
            </span>
            <span className="mt-1 truncate text-[9px] uppercase tracking-[0.2em] text-[var(--ag-gold-soft)] sm:text-[10px] sm:tracking-[0.22em]">
              Hotel & Celebrations
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-[13px] font-medium uppercase tracking-[0.12em] text-white/85 transition hover:text-[var(--ag-gold-soft)]",
                pathname === l.href &&
                  "text-[var(--ag-gold-soft)] underline decoration-[var(--ag-gold)] underline-offset-[10px]",
              )}
            >
              {l.label}
            </Link>
          ))}
          <Button
            render={<Link href="/book" />}
            className="h-9 rounded-none border border-[var(--ag-gold)] bg-[var(--ag-gold)] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ag-red-deep)] hover:bg-[var(--ag-gold-soft)]"
          >
            Book Now
          </Button>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            render={<Link href="/book" />}
            size="sm"
            className="h-8 rounded-none border border-[var(--ag-gold)] bg-[var(--ag-gold)] px-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--ag-red-deep)]"
          >
            Book
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/15 hover:text-white"
                  aria-label="Open menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="bg-white">
              <SheetHeader>
                <SheetTitle className="font-display text-xl tracking-[0.1em] text-[var(--ag-red)]">
                  ANVI GRAND
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-6">
                <a href={`tel:${phone}`} className="py-3 font-medium text-[var(--ag-red)]">
                  Call {phone}
                </a>
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-[var(--ag-line)] py-3 text-base uppercase tracking-[0.08em] text-[var(--ag-ink)]"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/book"
                  onClick={() => setOpen(false)}
                  className="mt-4 bg-[var(--ag-red)] py-3 text-center font-semibold uppercase tracking-wide text-white"
                >
                  Book Now
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
