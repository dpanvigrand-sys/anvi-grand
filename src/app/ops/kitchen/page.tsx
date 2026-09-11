"use client";

import { Button } from "@/components/ui/button";
import { useOps } from "@/components/ops/use-ops";
import { formatINR } from "@/lib/format";
import type { KitchenTicket } from "@/lib/types";

const flow: KitchenTicket["status"][] = ["queued", "cooking", "ready", "bumped"];

export default function KitchenPage() {
  const { ops, error, loading, refresh } = useOps();

  async function setStatus(id: string, status: KitchenTicket["status"]) {
    await fetch(`/api/ops/kitchen/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await refresh();
  }

  if (loading) return <p className="text-[var(--ag-muted)]">Loading KT board…</p>;
  if (error || !ops) return <p className="text-[var(--ag-red)]">{error || "No data"}</p>;

  const open = ops.kitchenTickets.filter((t) => t.status !== "bumped");
  const done = ops.kitchenTickets.filter((t) => t.status === "bumped").slice(0, 10);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">CHIGURU</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">Kitchen tickets</h1>
        </div>
        <Button type="button" variant="outline" className="rounded-none" onClick={() => void refresh()}>
          Refresh
        </Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {flow.map((col) => (
          <div key={col}>
            <h2 className="text-xs uppercase tracking-[0.16em] text-[var(--ag-muted)]">{col}</h2>
            <ul className="mt-3 space-y-3">
              {ops.kitchenTickets
                .filter((t) => t.status === col)
                .map((t) => (
                  <li key={t.id} className="border border-[var(--ag-line)] bg-white p-3">
                    <p className="text-xs text-[var(--ag-muted)]">
                      {t.id}
                      {t.tableId ? ` · ${t.tableId}` : ""}
                    </p>
                    <ul className="mt-2 text-sm text-[var(--ag-ink)]">
                      {t.items.map((i) => (
                        <li key={`${t.id}-${i.menuId}`}>
                          {i.qty}× {i.name}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {flow.map((s) => (
                        <Button
                          key={s}
                          type="button"
                          size="xs"
                          variant={t.status === s ? "default" : "outline"}
                          className="rounded-none"
                          onClick={() => void setStatus(t.id, s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      {open.length === 0 && (
        <p className="mt-6 text-sm text-[var(--ag-muted)]">No open tickets. Place a CHIGURU order to see KT flow.</p>
      )}

      {done.length > 0 && (
        <p className="mt-8 text-sm text-[var(--ag-muted)]">
          Recently bumped: {done.map((t) => t.id).join(", ")} · ticket totals mirror order{" "}
          {formatINR(
            done.reduce((s, t) => s + t.items.reduce((a, i) => a + i.price * i.qty, 0), 0),
          )}{" "}
          across board.
        </p>
      )}
    </div>
  );
}
