import Link from "next/link";
import { StockReportsAdmin } from "@/components/ops/stock-reports-admin";
import { stockMovesToRows } from "@/lib/stock-reports";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminStockReportsPage() {
  const ops = await getOps();
  const rows = stockMovesToRows(ops.inward, ops.outward);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
        Admin · Stock reports
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">
        Inward & outward reports
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Daily / monthly / date-range register for stock moves — item, supplier
        or department, qty, amount, advance, balance. Create entries on{" "}
        <Link href="/ops/inward" className="text-[var(--ag-red)] underline">
          /ops/inward
        </Link>{" "}
        and{" "}
        <Link href="/ops/outward" className="text-[var(--ag-red)] underline">
          /ops/outward
        </Link>
        . Password <code>anviops2026</code>.
      </p>
      <div className="mt-8">
        <StockReportsAdmin initialRows={rows} />
      </div>
    </div>
  );
}
