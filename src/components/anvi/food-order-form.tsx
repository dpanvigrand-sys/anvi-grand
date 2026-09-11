"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

type Props = {
  menu: MenuItem[];
};

export function FoodOrderForm({ menu }: Props) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  const items = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([menuId, qty]) => ({ menuId, qty })),
    [cart],
  );

  const total = useMemo(() => {
    return items.reduce((sum, line) => {
      const dish = menu.find((m) => m.id === line.menuId);
      return sum + (dish ? dish.price * line.qty : 0);
    }, 0);
  }, [items, menu]);

  function bump(id: string, delta: number) {
    setCart((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: next };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          phone,
          roomNumber: roomNumber || undefined,
          items,
          source: "online",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not place order.");
        return;
      }
      setSuccess(`Order ${data.order.id} placed · ${formatINR(data.order.total)}. CHIGURU kitchen is on it.`);
      setCart({});
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const categories = [...new Set(menu.map((m) => m.category))];

  if (!menu.length) {
    return (
      <p className="border border-[var(--ag-line)] bg-white px-5 py-8 text-[var(--ag-muted)]">
        Menu is being updated. Call 7569494949 for today’s specials.
      </p>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-10">
        {categories.map((cat) => (
          <div key={cat}>
            <h3 className="font-display text-2xl capitalize text-[var(--ag-chocolate)]">{cat}</h3>
            <ul className="mt-4 divide-y divide-[var(--ag-line)] border-y border-[var(--ag-line)]">
              {menu
                .filter((m) => m.category === cat)
                .map((m) => (
                  <li key={m.id} className="flex items-start justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium text-[var(--ag-chocolate)]">
                        {m.name}
                        {m.veg ? (
                          <span className="ml-2 text-xs text-emerald-700">veg</span>
                        ) : (
                          <span className="ml-2 text-xs text-[var(--ag-red)]">non-veg</span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-[var(--ag-muted)]">{m.description}</p>
                      <p className="mt-2 text-sm font-medium">{formatINR(m.price)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="rounded-none"
                        onClick={() => bump(m.id, -1)}
                      >
                        −
                      </Button>
                      <span className="w-6 text-center text-sm">{cart[m.id] || 0}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="rounded-none"
                        onClick={() => bump(m.id, 1)}
                      >
                        +
                      </Button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="h-fit space-y-4 border border-[var(--ag-line)] bg-white p-6 lg:sticky lg:top-24"
      >
        <p className="font-display text-2xl text-[var(--ag-chocolate)]">Your order</p>
        {items.length === 0 ? (
          <p className="text-sm text-[var(--ag-muted)]">Add dishes from the menu.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {items.map((line) => {
              const dish = menu.find((m) => m.id === line.menuId)!;
              return (
                <li key={line.menuId} className="flex justify-between gap-2">
                  <span>
                    {dish.name} × {line.qty}
                  </span>
                  <span>{formatINR(dish.price * line.qty)}</span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="border-t border-[var(--ag-line)] pt-3 text-sm font-medium">
          Total {formatINR(total)}
        </p>
        <div className="space-y-2">
          <Label htmlFor="guestName">Name</Label>
          <Input
            id="guestName"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="roomNumber">Room number (optional)</Label>
          <Input
            id="roomNumber"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="rounded-none"
            placeholder="e.g. 204"
          />
        </div>
        {error && <p className="text-sm text-[var(--ag-red)]">{error}</p>}
        {success && <p className="text-sm text-[var(--ag-maroon)]">{success}</p>}
        <Button
          type="submit"
          disabled={pending || items.length === 0}
          className="h-11 w-full rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          {pending ? "Placing…" : "Place CHIGURU order"}
        </Button>
      </form>
    </div>
  );
}
