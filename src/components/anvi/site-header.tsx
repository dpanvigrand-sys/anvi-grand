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
        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 text-[11px] tracking-[0.14em] text-white/75 md:px-8">
          <span className="hidden min-w-[7rem] sm:inline">Vijayawada</span>
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            aria-label="Badizo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/badizo.jpg"
              alt="Badizo"
              className="h-7 w-auto max-w-[150px] object-contain sm:h-8 sm:max-w-[170px]"
            />
          </Link>
          <a
            href={`tel:${phone}`}
            className="ml-auto font-medium text-[var(--ag-gold-soft)] hover:text-white"
          >
            Reception {phone}
          </a>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/ag-mark.svg"
            alt=""
            className="h-11 w-11 ring-1 ring-[var(--ag-gold)]/50"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-[0.16em] text-white md:text-xl">
              ANVI GRAND
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[var(--ag-gold-soft)]">
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
