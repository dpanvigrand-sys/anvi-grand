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
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onHero = pathname === "/";

  return (
    <header
      className={cn(
        "z-40 w-full",
        onHero
          ? "absolute inset-x-0 top-0"
          : "sticky top-0 border-b border-[var(--hm-line)] bg-[var(--hm-foam)]/90 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <Link
          href="/"
          className={cn(
            "font-display text-2xl tracking-[0.02em] md:text-[1.7rem]",
            onHero ? "text-white drop-shadow-sm" : "text-[var(--hm-ink)]",
          )}
        >
          Havenmere
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm tracking-wide transition",
                onHero
                  ? "text-white/85 hover:text-white"
                  : "text-[var(--hm-muted)] hover:text-[var(--hm-ink)]",
                pathname === link.href &&
                  (onHero ? "text-white" : "text-[var(--hm-ink)]"),
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button
            render={<Link href="/book" />}
            className={cn(
              "rounded-none px-5",
              onHero
                ? "bg-white text-[var(--hm-ink)] hover:bg-white/90"
                : "bg-[var(--hm-sea)] text-white hover:bg-[var(--hm-sea)]/90",
            )}
          >
            Reserve
          </Button>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "md:hidden",
                  onHero
                    ? "text-white hover:bg-white/10"
                    : "text-[var(--hm-ink)] hover:bg-[var(--hm-mist)]",
                )}
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-[var(--hm-foam)]">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl text-[var(--hm-ink)]">
                Havenmere
              </SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-4 px-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-2xl text-[var(--hm-ink)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
