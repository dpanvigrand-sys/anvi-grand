"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";
import { isUploadSrc } from "@/lib/media-place";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  menu: MenuItem[];
  variant?: "home" | "page";
  contactPhone?: string;
};

export function FoodOrderForm({
  menu,
  variant = "page",
  contactPhone = "7569494949",
}: Props) {
  const desk = contactPhone.trim() || "7569494949";
  const [cart, setCart] = useState<Record<string, number>>({});
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [advance, setAdvance] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  const featured = variant === "home" ? menu.slice(0, 3) : menu;

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

  function addOne(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

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
          address: address || undefined,
          roomNumber: roomNumber || undefined,
          advance,
          items,
          source: "online",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not place order.");
        return;
      }
      setSuccess(
        `Order ${data.order.id} paid · ${formatINR(data.order.total)}. IRAA Dine kitchen is on it.`,
      );
      setCart({});
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (!menu.length) {
    return (
      <p className="rounded-lg border border-[var(--ag-line)] bg-white px-5 py-8 text-[var(--ag-muted)]">
        Menu is being updated. Call {desk} for today’s specials.
      </p>
    );
  }

  const categories = [...new Set(featured.map((m) => m.category))];

  return (
    <div
      className={cn(
        "grid gap-8",
        variant === "home"
          ? "lg:grid-cols-[1fr_280px]"
          : "lg:grid-cols-[1.35fr_320px]",
      )}
    >
      <div className="space-y-8">
        {variant === "home" ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((m) => (
              <article
                key={m.id}
                className="overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={m.image}
                    alt={m.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 280px"
                    unoptimized={isUploadSrc(m.image)}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--ag-ink)]">{m.name}</h3>
                  <p className="mt-1 text-sm font-medium text-[var(--ag-red)]">
                    {formatINR(m.price)}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-[var(--ag-muted)]">
                    {m.category.replace("-", " ")}
                  </p>
                  <Button
                    type="button"
                    onClick={() => addOne(m.id)}
                    className="mt-4 h-10 w-full rounded-md bg-[var(--ag-charcoal)] text-sm font-semibold text-white hover:bg-[#222]"
                  >
                    Add to Order
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-lg font-semibold capitalize text-[var(--ag-ink)]">
                {cat.replace("-", " ")}
              </h3>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {featured
                  .filter((m) => m.category === cat)
                  .map((m) => (
                    <article
                      key={m.id}
                      className="overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5"
                    >
                      <div className="relative aspect-[16/10]">
                        <Image
                          src={m.image}
                          alt={m.name}
                          fill
                          className="object-cover"
                          sizes="(max-width:768px) 100vw, 40vw"
                          unoptimized={isUploadSrc(m.image)}
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-[var(--ag-ink)]">{m.name}</h4>
                            <p className="mt-1 text-sm text-[var(--ag-muted)]">
                              {m.description}
                            </p>
                          </div>
                          <p className="shrink-0 font-semibold text-[var(--ag-red)]">
                            {formatINR(m.price)}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="rounded-md"
                            onClick={() => bump(m.id, -1)}
                          >
                            −
                          </Button>
                          <span className="w-6 text-center text-sm">
                            {cart[m.id] || 0}
                          </span>
                          <Button
                            type="button"
                            className="h-9 flex-1 rounded-md bg-[var(--ag-charcoal)] text-sm font-semibold text-white hover:bg-[#222]"
                            onClick={() => addOne(m.id)}
                          >
                            Add to Order
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="h-fit overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 lg:sticky lg:top-24"
      >
        <div className="bg-[var(--ag-cart-pink)] px-4 py-3">
          <p className="text-sm font-bold text-[var(--ag-red)]">IRAA Dine Order Cart</p>
        </div>
        <div className="space-y-3 bg-white p-4">
          {items.length === 0 ? (
            <p className="text-sm text-[var(--ag-muted)]">Add dishes to begin checkout.</p>
          ) : (
            <ul className="space-y-2 text-sm text-[var(--ag-ink)]">
              {items.map((line) => {
                const dish = menu.find((m) => m.id === line.menuId)!;
                return (
                  <li key={line.menuId} className="flex justify-between gap-2">
                    <span>
                      {line.qty}x {dish.name}
                    </span>
                    <span className="font-medium">
                      {formatINR(dish.price * line.qty)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="border-t border-[var(--ag-line)] pt-3 text-sm font-semibold text-[var(--ag-ink)]">
            Total Payable: {formatINR(total)}
          </p>
          <div className="space-y-2">
            <Label htmlFor="guestName">Name</Label>
            <Input
              id="guestName"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="rounded-md"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-md"
              placeholder={desk}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-md"
              placeholder="Delivery / billing address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room (optional)</Label>
            <Input
              id="roomNumber"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="rounded-md"
              placeholder="e.g. 204"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="advance">Advance (₹)</Label>
              <Input
                id="advance"
                type="number"
                min={0}
                step={50}
                value={advance}
                onChange={(e) => setAdvance(Number(e.target.value) || 0)}
                className="rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label>Balance</Label>
              <p className="flex h-9 items-center rounded-md border border-[var(--ag-line)] px-3 text-sm">
                {formatINR(Math.max(0, total - advance))}
              </p>
            </div>
          </div>
          {error && <p className="text-sm text-[var(--ag-red)]">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}
          <Button
            type="submit"
            disabled={pending || items.length === 0}
            className="h-11 w-full rounded-md bg-[var(--ag-red)] text-sm font-semibold text-white hover:bg-[var(--ag-red-deep)]"
          >
            {pending ? "Processing…" : "Pay Now (Anvi Grand Checkout)"}
          </Button>
        </div>
      </form>
    </div>
  );
}
