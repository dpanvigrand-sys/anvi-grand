import { StatusActions } from "@/components/ops/status-actions";
import { getOps } from "@/lib/store";

export default async function ServerPage() {
  const ops = await getOps();
  return (
    <div>
      <h1 className="font-display text-4xl text-[var(--ag-ink)]">Server / floor</h1>
      <p className="mt-2 text-[var(--ag-muted)]">Table status for CHIGURU dining.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ops.tables.map((t) => (
          <article key={t.id} className="border border-[var(--ag-line)] bg-white p-5">
            <h2 className="font-display text-2xl">{t.label}</h2>
            <p className="text-sm text-[var(--ag-muted)]">{t.section} · {t.seats} seats</p>
            <p className="mt-2 text-sm uppercase tracking-wide text-[var(--ag-red)]">{t.status}</p>
            <div className="mt-4">
              <StatusActions
                endpoint={`/api/ops/tables/${t.id}`}
                statuses={[
                  { value: "free", label: "Free" },
                  { value: "occupied", label: "Seat" },
                  { value: "billing", label: "Bill" },
                  { value: "reserved", label: "Hold" },
                ]}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
