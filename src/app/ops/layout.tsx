import Link from "next/link";

const links = [
  { href: "/ops", label: "Overview" },
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
    <div className="min-h-screen bg-[#f7efe9]">
      <header className="border-b border-[var(--ag-line)] bg-[var(--ag-chocolate)] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div>
            <Link href="/ops" className="font-display text-2xl tracking-[0.04em]">ANVI OPS</Link>
            <p className="text-xs text-white/60">Staff systems · shared JSON store</p>
          </div>
          <Link href="/" className="text-sm text-white/80 hover:text-white">← Guest site</Link>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3 md:px-8">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap px-3 py-1.5 text-sm text-white/75 hover:bg-white/10 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</div>
    </div>
  );
}
