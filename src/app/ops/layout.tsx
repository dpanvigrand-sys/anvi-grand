import Link from "next/link";
import { OpsGate } from "@/components/ops/ops-gate";

const links = [
  { href: "/ops", label: "Hub" },
  { href: "/ops/reception", label: "Reception" },
  { href: "/ops/server", label: "Server" },
  { href: "/ops/kitchen", label: "KT Kitchen" },
  { href: "/ops/admin", label: "Admin" },
  { href: "/ops/accounts", label: "Accounts" },
  { href: "/ops/inward", label: "Inward" },
  { href: "/ops/outward", label: "Outward" },
];

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fff5f4]">
      <OpsGate>
        <header className="border-b-4 border-[var(--ag-red)] bg-[linear-gradient(90deg,#b3141a_0%,#e31b23_55%,#8a1218_100%)] text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
            <div>
              <Link href="/ops" className="font-display text-2xl tracking-[0.04em]">
                ANVI OPS
              </Link>
              <p className="text-xs text-white/80">
                One desk · reception · server · kitchen · admin · accounts · stock
              </p>
            </div>
            <Link href="/" className="rounded-none bg-white px-3 py-1.5 text-sm font-semibold text-[var(--ag-red)] hover:bg-white/90">
              ← Guest site
            </Link>
          </div>
          <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3 md:px-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="whitespace-nowrap bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white hover:text-[var(--ag-red)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</div>
      </OpsGate>
    </div>
  );
}
