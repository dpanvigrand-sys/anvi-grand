"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Phone } from "lucide-react";
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
  { href: "/rooms", label: "Rooms" },
  { href: "/banquet", label: "Banquet" },
  { href: "/party-hall", label: "Party Hall" },
  { href: "/food", label: "CHIGURU" },
  { href: "/buffet", label: "Buffet" },
  { href: "/facilities", label: "Facilities" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onHero = pathname === "/";
  const isOps = pathname.startsWith("/ops");

  if (isOps) return null;

  return (
    <>
      <div className="relative z-50 bg-[var(--ag-red)] text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-xs md:px-8 md:text-sm">
          <p className="font-medium text-white">
            Anvi Grand · near Benz Circle, Eluru Road, Vijayawada
          </p>
          <a
            href="tel:7569494949"
            className="inline-flex items-center gap-2 rounded-none bg-white px-3 py-1 font-semibold tracking-wide text-[var(--ag-red)] hover:bg-white/90"
          >
            <Phone className="size-3.5" />
            7569494949
          </a>
        </div>
      </div>
      <header
        className={cn(
          "z-40 w-full",
          onHero
            ? "absolute inset-x-0 top-[2.35rem]"
            : "sticky top-0 border-b-2 border-[var(--ag-red)] bg-[var(--ag-cream-white)]/95 backdrop-blur-sm",
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logos/anvi-grand.svg"
              alt="ANVI GRAND"
              width={148}
              height={40}
              className={cn(
                "h-9 w-auto",
                onHero ? "brightness-110" : "",
              )}
              priority
            />
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm transition",
                  onHero
                    ? "text-white/85 hover:text-white"
                    : "text-[var(--ag-chocolate)] hover:text-[var(--ag-red)]",
                  pathname === l.href && (onHero ? "text-white" : "text-[var(--ag-red)]"),
                )}
              >
                {l.label}
              </Link>
            ))}
            <Button
              render={<Link href="/book" />}
              className="h-9 rounded-none bg-[var(--ag-red)] px-4 text-white hover:bg-[var(--ag-maroon)]"
            >
              Book
            </Button>
            <Link
              href="/ops"
              className={cn(
                "text-xs uppercase tracking-wider",
                onHero
                  ? "text-white/60 hover:text-white"
                  : "text-[var(--ag-muted)] hover:text-[var(--ag-chocolate)]",
              )}
            >
              Ops
            </Link>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <Button
              render={<Link href="/book" />}
              size="sm"
              className="h-8 rounded-none bg-[var(--ag-red)] px-3 text-white hover:bg-[var(--ag-maroon)]"
            >
              Book
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      onHero
                        ? "text-white hover:bg-white/15 hover:text-white"
                        : "text-[var(--ag-chocolate)] hover:bg-[var(--ag-line)]",
                    )}
                    aria-label="Open menu"
                  />
                }
              >
                <Menu />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="border-[var(--ag-line)] bg-[var(--ag-cream-white)]"
              >
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl text-[var(--ag-chocolate)]">
                    ANVI GRAND
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4 pb-6">
                  <a href="tel:7569494949" className="py-3 text-[var(--ag-red)]">
                    Call 7569494949
                  </a>
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="border-b border-[var(--ag-line)] py-3 text-base text-[var(--ag-chocolate)]"
                    >
                      {l.label}
                    </Link>
                  ))}
                  <Link
                    href="/book"
                    onClick={() => setOpen(false)}
                    className="mt-4 bg-[var(--ag-red)] py-3 text-center text-white"
                  >
                    Book a room
                  </Link>
                  <Link
                    href="/ops"
                    onClick={() => setOpen(false)}
                    className="mt-2 py-2 text-center text-sm text-[var(--ag-muted)]"
                  >
                    Staff Ops
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
