"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/ops", label: "Roles", exact: true },
  { href: "/ops/reception", label: "Reception" },
  { href: "/ops/server", label: "Server" },
  { href: "/ops/kitchen", label: "Kitchen (KT)" },
  { href: "/ops/admin", label: "Admin" },
  { href: "/ops/accounts", label: "Accounts" },
  { href: "/ops/inward", label: "Inward" },
  { href: "/ops/outward", label: "Outward" },
];

export function OpsNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--ag-line)] bg-[var(--ag-chocolate)] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/ops" className="font-display text-xl tracking-tight">
            ANVI OPS
          </Link>
          <Link href="/" className="text-xs text-white/55 hover:text-white">
            ← Site
          </Link>
        </div>
        <nav className="flex flex-wrap gap-1">
          {links.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-2.5 py-1.5 text-xs uppercase tracking-wider",
                  active ? "bg-white text-[var(--ag-chocolate)]" : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
