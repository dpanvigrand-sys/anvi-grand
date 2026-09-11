"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { KitchenTicket } from "@/lib/types";

export default function KitchenPage() {
  const [tickets, setTickets] = useState<KitchenTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ops = await (await fetch("/api/ops")).json();
      setTickets(ops.kitchenTickets || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: KitchenTicket["status"]) {
    await fetch(`/api/ops/kitchen/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  const active = tickets.filter((t) => t.status !== "bumped");

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--ag-chocolate)]">Kitchen (KT)</h1>
      <p className="mt-1 text-sm text-[var(--ag-muted)]">Queue · cook · ready · bump</p>

      {loading && <p className="mt-8 text-[var(--ag-muted)]">Loading…</p>}
      {!loading && active.length === 0 && (
        <p className="mt-8 border border-[var(--ag-line)] bg-white px-5 py-8 text-[var(--ag-muted)]">
          No open tickets. Quiet service.
        </p>
      )}

      <ul className="mt-8 space-y-4">
        {active.map((t) => (
          <li key={t.id} className="border border-[var(--ag-line)] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[var(--ag-chocolate)]">
                  {t.id} · {t.status}
                  {t.tableId ? ` · ${t.tableId}` : ""}
                </p>
                <ul className="mt-2 text-sm text-[var(--ag-muted)]">
                  {t.items.map((i) => (
                    <li key={`${t.id}-${i.menuId}`}>
                      {i.qty}× {i.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none"
                  onClick={() => setStatus(t.id, "cooking")}
                >
                  Cook
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none"
                  onClick={() => setStatus(t.id, "ready")}
                >
                  Ready
                </Button>
                <Button
                  size="sm"
                  className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
                  onClick={() => setStatus(t.id, "bumped")}
                >
                  Bump
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
