"use client";

import Link from "next/link";

const sections = [
  {
    href: "/ops/accounts/day-book",
    title: "Day Book",
    te: "డే బుక్",
    desc: "Daily cash / bank vouchers — date, voucher no, particular, debit, credit, balance, category",
  },
  {
    href: "/ops/accounts/ledger",
    title: "Ledger",
    te: "లెడ్జర్",
    desc: "Account-wise ledger — pick an account and review every transaction",
  },
  {
    href: "/ops/accounts/muster",
    title: "Daily Muster",
    te: "డైలీ మస్టర్",
    desc: "Staff attendance — present / absent / half day with notes",
  },
  {
    href: "/ops/accounts/salaries",
    title: "Salaries",
    te: "జీతాలు",
    desc: "Salary register — month, basic, deductions, net, paid / pending",
  },
  {
    href: "/ops/accounts/purchases",
    title: "Purchases",
    te: "కొనుగోళ్లు",
    desc: "Groceries, ingredients, dhobi, clothes, housekeeping సామాను & other",
  },
];

type Props = {
  counts: {
    dayBook: number;
    ledger: number;
    muster: number;
    salaries: number;
    purchases: number;
  };
};

export function AccountsHub({ counts }: Props) {
  const countMap: Record<string, number> = {
    "/ops/accounts/day-book": counts.dayBook,
    "/ops/accounts/ledger": counts.ledger,
    "/ops/accounts/muster": counts.muster,
    "/ops/accounts/salaries": counts.salaries,
    "/ops/accounts/purchases": counts.purchases,
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--ag-red)]">
        Accountancy · అకౌంట్స్
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">Accounts</h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Hotel day book, ledger, muster, salaries and purchase books. Stock inward /
        outward stay under Stock reports.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group overflow-hidden border border-[var(--ag-line)] bg-white transition hover:border-[var(--ag-red)]"
          >
            <div className="h-1.5 w-full bg-[var(--ag-red-deep)]" />
            <div className="flex items-start justify-between gap-3 p-5">
              <div>
                <h2 className="font-display text-2xl text-[var(--ag-ink)] group-hover:text-[var(--ag-red)]">
                  {s.title}
                </h2>
                <p className="mt-0.5 text-sm text-[var(--ag-red)]">{s.te}</p>
                <p className="mt-2 text-sm text-[var(--ag-muted)]">{s.desc}</p>
              </div>
              <p className="font-display text-2xl text-[var(--ag-maroon)]">
                {countMap[s.href] ?? 0}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 border border-[var(--ag-line)] bg-white p-5">
        <h3 className="font-display text-xl text-[var(--ag-ink)]">Related stock books</h3>
        <p className="mt-1 text-sm text-[var(--ag-muted)]">
          Inward receipts and outward issues are tracked separately from purchases.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/ops/inward"
            className="border border-[var(--ag-line)] px-3 py-2 text-sm hover:border-[var(--ag-red)] hover:text-[var(--ag-red)]"
          >
            Inward stock →
          </Link>
          <Link
            href="/ops/outward"
            className="border border-[var(--ag-line)] px-3 py-2 text-sm hover:border-[var(--ag-red)] hover:text-[var(--ag-red)]"
          >
            Outward stock →
          </Link>
          <Link
            href="/ops/admin/stock-reports"
            className="border border-[var(--ag-line)] px-3 py-2 text-sm hover:border-[var(--ag-red)] hover:text-[var(--ag-red)]"
          >
            Stock reports →
          </Link>
        </div>
      </div>
    </div>
  );
}
