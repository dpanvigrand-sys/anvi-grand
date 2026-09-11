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
  { href: "/banquet", label: "Banquet Halls" },
  { href: "/gallery", label: "Gallery" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isOps = pathname.startsWith("/ops");

  if (isOps) return null;

  return (
    <header className="sticky top-0 z-50 bg-[var(--ag-red)] text-white shadow-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3.5 md:px-8">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-[0.12em] text-white md:text-xl"
        >
          ANVI GRAND
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium text-white/90 transition hover:text-white",
                pathname === l.href && "text-white underline underline-offset-8",
              )}
            >
              {l.label}
            </Link>
          ))}
          <Button
            render={<Link href="/book" />}
            className="h-9 rounded-md bg-white px-4 text-sm font-semibold text-[var(--ag-red)] hover:bg-white/95"
          >
            Book Now
          </Button>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            render={<Link href="/book" />}
            size="sm"
            className="h-8 rounded-md bg-white px-3 text-xs font-semibold text-[var(--ag-red)] hover:bg-white/95"
          >
            Book Now
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
                <SheetTitle className="font-display text-xl tracking-[0.08em] text-[var(--ag-red)]">
                  ANVI GRAND
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-6">
                <a
                  href="tel:7569494949"
                  className="py-3 font-medium text-[var(--ag-red)]"
                >
                  Call 7569494949
                </a>
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-[var(--ag-line)] py-3 text-base text-[var(--ag-ink)]"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/book"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-md bg-[var(--ag-red)] py-3 text-center font-semibold text-white"
                >
                  Book Now
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
  );
}
