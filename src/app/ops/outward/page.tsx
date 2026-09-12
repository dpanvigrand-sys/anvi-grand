import Link from "next/link";
import { StockForm } from "@/components/ops/stock-form";
import { StockReportsAdmin } from "@/components/ops/stock-reports-admin";
import { formatINR } from "@/lib/format";
import { stockMovesToRows } from "@/lib/stock-reports";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function OutwardPage() {
  const ops = await getOps();
  const rows = stockMovesToRows([], ops.outward).filter(
    (r) => r.direction === "outward",
  );

  return (
    <div className="space-y-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl text-[var(--ag-ink)]">Outward</h1>
          <p className="mt-2 text-[var(--ag-muted)]">
            Issue stock to kitchen and departments — with amount, advance, and
            balance. Same report exports as inward.
          </p>
          <p className="mt-2 text-sm text-[var(--ag-muted)]">
            Combined register also at{" "}
            <Link
              href="/ops/admin/stock-reports"
              className="text-[var(--ag-red)] underline"
            >
              /ops/admin/stock-reports
            </Link>
            .
          </p>
          <div className="mt-6">
            <StockForm direction="outward" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--ag-ink)]">
            Recent outward
          </h2>
          {ops.outward.length === 0 ? (
            <p className="border border-[var(--ag-line)] bg-white px-4 py-8 text-[var(--ag-muted)]">
              No outward moves yet — add one on the left.
            </p>
          ) : (
            ops.outward.slice(0, 8).map((m) => (
              <div
                key={m.id}
                className="border border-[var(--ag-line)] bg-white px-4 py-3 text-sm"
              >
                <p className="font-medium text-[var(--ag-ink)]">
                  {m.item} · {m.quantity} {m.unit}
                </p>
                <p className="text-[var(--ag-muted)]">
                  {m.vendorOrDept} · {(m.date || m.createdAt).slice(0, 10)}
                </p>
                <p className="mt-1 text-[var(--ag-ink)]">
                  {formatINR(m.amount ?? 0)} · adv {formatINR(m.advance ?? 0)} ·
                  bal {formatINR(m.balance ?? 0)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <section>
        <h2 className="font-display text-3xl text-[var(--ag-ink)]">
          Outward reports
        </h2>
        <p className="mt-1 text-sm text-[var(--ag-muted)]">
          Filter by day / month / range, edit lines, then export.
        </p>
        <div className="mt-6">
          <StockReportsAdmin
            initialRows={rows}
            fixedDirection="outward"
            title="Outward stock report"
          />
        </div>
      </section>
    </div>
  );
}
