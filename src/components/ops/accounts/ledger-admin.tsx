"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_LEDGER_ACCOUNTS } from "@/lib/accounts";
import { formatINR } from "@/lib/format";
import type { DayBookEntry, LedgerEntry } from "@/lib/types";

type Props = {
  dayBook: DayBookEntry[];
  ledger: LedgerEntry[];
};

type LedgerLine = {
  id: string;
  date: string;
  source: "day-book" | "auto-ledger";
  particular: string;
  debit: number;
  credit: number;
  account: string;
};

export function LedgerAdmin({ dayBook, ledger }: Props) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [account, setAccount] = useState("Cash");
  const [month, setMonth] = useState(today.slice(0, 7));

  const accounts = useMemo(() => {
    const set = new Set<string>(DEFAULT_LEDGER_ACCOUNTS);
    for (const d of dayBook) set.add(d.category);
    for (const l of ledger) set.add(l.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [dayBook, ledger]);

  const lines = useMemo(() => {
    const fromDay: LedgerLine[] = dayBook.map((d) => ({
      id: d.id,
      date: d.date,
      source: "day-book",
      particular: `${d.voucherNo} · ${d.particular}`,
      debit: d.debit,
      credit: d.credit,
      account: d.category,
    }));
    const fromLed: LedgerLine[] = ledger.map((l) => ({
      id: l.id,
      date: l.createdAt.slice(0, 10),
      source: "auto-ledger",
      particular: l.description,
      debit: l.kind === "income" ? l.amount : 0,
      credit: l.kind === "expense" ? l.amount : 0,
      account: l.category,
    }));
    return [...fromDay, ...fromLed]
      .filter((l) => l.account === account && l.date.startsWith(month))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [dayBook, ledger, account, month]);

  const running = useMemo(() => {
    let bal = 0;
    return lines.map((l) => {
      bal += l.debit - l.credit;
      return { ...l, balance: bal };
    });
  }, [lines]);

  const totals = useMemo(() => {
    let debit = 0;
    let credit = 0;
    for (const l of lines) {
      debit += l.debit;
      credit += l.credit;
    }
    return { debit, credit, balance: debit - credit };
  }, [lines]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/ops/accounts" className="text-sm text-[var(--ag-red)] hover:underline">
            ← Accounts
          </Link>
          <h1 className="mt-1 font-display text-4xl text-[var(--ag-ink)]">Ledger</h1>
          <p className="text-[var(--ag-muted)]">లెడ్జర్ · account-wise transactions</p>
        </div>
        <Button type="button" variant="outline" className="rounded-none print:hidden" onClick={() => window.print()}>
          Print A4
        </Button>
      </div>

      <div className="grid gap-3 border border-[var(--ag-line)] bg-white p-5 print:hidden sm:grid-cols-2">
        <div className="grid gap-1">
          <Label>Account</Label>
          <select
            className="h-9 border border-[var(--ag-line)] bg-white px-2"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <Label>Month</Label>
          <Input type="month" className="rounded-none" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto border border-[var(--ag-line)] bg-white">
        <div className="border-b border-[var(--ag-line)] px-4 py-3">
          <p className="font-display text-xl">ANVI GRAND — Ledger · {account}</p>
          <p className="text-sm text-[var(--ag-muted)]">
            {month} · Debit {formatINR(totals.debit)} · Credit {formatINR(totals.credit)} · Closing {formatINR(totals.balance)}
          </p>
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[var(--ag-soft)] text-xs uppercase tracking-wide text-[var(--ag-muted)]">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Particular</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2 text-right">Debit</th>
              <th className="px-3 py-2 text-right">Credit</th>
              <th className="px-3 py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {running.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-[var(--ag-muted)]">
                  No ledger lines for this account / month. Add Day Book entries or booking income posts here automatically.
                </td>
              </tr>
            ) : (
              running.map((r) => (
                <tr key={`${r.source}-${r.id}`} className="border-t border-[var(--ag-line)]">
                  <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                  <td className="px-3 py-2">{r.particular}</td>
                  <td className="px-3 py-2 text-[var(--ag-muted)]">{r.source}</td>
                  <td className="px-3 py-2 text-right">{r.debit ? formatINR(r.debit) : "—"}</td>
                  <td className="px-3 py-2 text-right">{r.credit ? formatINR(r.credit) : "—"}</td>
                  <td className="px-3 py-2 text-right">{formatINR(r.balance)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
