import { StockForm } from "@/components/ops/stock-form";
import { getOps } from "@/lib/store";

export default async function OutwardPage() {
  const ops = await getOps();
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-4xl text-[var(--ag-ink)]">Outward</h1>
        <p className="mt-2 text-[var(--ag-muted)]">Issue stock to kitchen and departments.</p>
        <div className="mt-6"><StockForm direction="outward" /></div>
      </div>
      <div className="space-y-3">
        {ops.outward.length === 0 ? <p className="text-[var(--ag-muted)]">No outward moves.</p> : ops.outward.map((m) => (
          <div key={m.id} className="border border-[var(--ag-line)] bg-white px-4 py-3 text-sm">
            <p className="font-medium">{m.item} · {m.quantity} {m.unit}</p>
            <p className="text-[var(--ag-muted)]">{m.vendorOrDept}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
