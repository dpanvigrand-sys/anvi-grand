import { StatusActions } from "@/components/ops/status-actions";
import { getOps } from "@/lib/store";

export default async function KitchenPage() {
  const ops = await getOps();
  const open = ops.kitchenTickets.filter((t) => t.status !== "bumped");
  return (
    <div>
      <h1 className="font-display text-4xl text-[var(--ag-ink)]">KT — Kitchen</h1>
      <p className="mt-2 text-[var(--ag-muted)]">Live tickets from CHIGURU orders.</p>
      <div className="mt-8 space-y-4">
        {open.length === 0 ? (
          <p className="border border-[var(--ag-line)] bg-white px-5 py-10 text-[var(--ag-muted)]">Kitchen is clear.</p>
        ) : open.map((t) => (
          <article key={t.id} className="border border-[var(--ag-line)] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">{t.status} · {t.id}</p>
                <ul className="mt-2 text-sm text-[var(--ag-ink)]">
                  {t.items.map((i) => (
                    <li key={i.menuId}>{i.qty}× {i.name}</li>
                  ))}
                </ul>
                {t.tableId ? <p className="mt-2 text-sm text-[var(--ag-muted)]">Table {t.tableId}</p> : null}
              </div>
              <StatusActions
                endpoint={`/api/ops/kitchen/${t.id}`}
                statuses={[
                  { value: "queued", label: "Queue" },
                  { value: "cooking", label: "Cook" },
                  { value: "ready", label: "Ready" },
                  { value: "bumped", label: "Bump" },
                ]}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
