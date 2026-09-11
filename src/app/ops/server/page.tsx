"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOps } from "@/components/ops/use-ops";
import { formatINR } from "@/lib/format";
import type { DiningTable, MenuItem } from "@/lib/types";

const tableStatuses: DiningTable["status"][] = ["free", "occupied", "billing", "reserved"];

export default function ServerPage() {
  const { ops, error, loading, refresh } = useOps();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [tableId, setTableId] = useState("");
  const [menuId, setMenuId] = useState("");
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/menu");
        if (res.ok) {
          const data = await res.json();
          setMenu(data.menu || []);
          if (data.menu?.[0]) setMenuId(data.menu[0].id);
        }
      } catch {
        /* optional */
      }
    })();
  }, []);

  useEffect(() => {
    if (ops?.tables[0] && !tableId) setTableId(ops.tables[0].id);
  }, [ops, tableId]);

  async function setTableStatus(id: string, status: DiningTable["status"]) {
    await fetch(`/api/ops/tables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await refresh();
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName,
        phone,
        tableId: tableId || undefined,
        source: "server",
        items: [{ menuId, qty }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Order failed");
      return;
    }
    setMsg(`Order ${data.order.id} · ${formatINR(data.order.total)}`);
    setGuestName("");
    setPhone("");
    await refresh();
  }

  if (loading) return <p className="text-[var(--ag-muted)]">Loading server floor…</p>;
  if (error || !ops) return <p className="text-[var(--ag-red)]">{error || "No data"}</p>;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Server</p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">Floor & tables</h1>

      <section className="mt-8">
        <h2 className="font-display text-2xl text-[var(--ag-chocolate)]">Tables</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ops.tables.map((t) => (
            <li key={t.id} className="border border-[var(--ag-line)] bg-white p-4">
              <p className="font-medium text-[var(--ag-ink)]">
                {t.label} · {t.section}
              </p>
              <p className="text-sm text-[var(--ag-muted)]">
                {t.seats} seats · {t.status}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {tableStatuses.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    size="xs"
                    variant={t.status === s ? "default" : "outline"}
                    className="rounded-none"
                    onClick={() => void setTableStatus(t.id, s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 max-w-lg">
        <h2 className="font-display text-2xl text-[var(--ag-chocolate)]">New floor order</h2>
        {menu.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ag-muted)]">
            Menu API unavailable — use /food for guest orders, or open kitchen after an online order.
          </p>
        ) : (
          <form onSubmit={placeOrder} className="mt-4 space-y-3 border border-[var(--ag-line)] bg-white p-5">
            <div className="space-y-1">
              <Label>Guest</Label>
              <Input className="rounded-none" required value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input className="rounded-none" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Table</Label>
              <select
                className="h-9 w-full border border-[var(--ag-line)] bg-white px-2 text-sm"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
              >
                {ops.tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-[1fr_80px] gap-2">
              <div className="space-y-1">
                <Label>Dish</Label>
                <select
                  className="h-9 w-full border border-[var(--ag-line)] bg-white px-2 text-sm"
                  value={menuId}
                  onChange={(e) => setMenuId(e.target.value)}
                >
                  {menu.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {formatINR(m.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min={1}
                  className="rounded-none"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                />
              </div>
            </div>
            {msg && <p className="text-sm text-[var(--ag-maroon)]">{msg}</p>}
            <Button type="submit" className="h-10 w-full rounded-none bg-[var(--ag-red)] text-white">
              Send to kitchen
            </Button>
          </form>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-[var(--ag-chocolate)]">Recent orders</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {ops.foodOrders.slice(0, 8).map((o) => (
            <li key={o.id} className="border border-[var(--ag-line)] bg-white px-4 py-3">
              {o.id} · {o.guestName} · {o.status} · {formatINR(o.total)}
              {o.tableId ? ` · ${o.tableId}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
