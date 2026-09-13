"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  HousekeepingRoom,
  HousekeepingRoomStatus,
  LinenQueueItem,
  LinenQueueStatus,
} from "@/lib/types";

const roomStatuses: { value: HousekeepingRoomStatus; label: string }[] = [
  { value: "dirty", label: "Dirty" },
  { value: "cleaning", label: "Cleaning" },
  { value: "ready", label: "Ready" },
  { value: "inspected", label: "Inspected" },
  { value: "occupied", label: "Occupied" },
];

const linenStatuses: { value: LinenQueueStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "washing", label: "Dhobi / wash" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
];

type Props = {
  rooms: HousekeepingRoom[];
  linen: LinenQueueItem[];
};

export function HousekeepingBoard({ rooms: initialRooms, linen: initialLinen }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rooms, setRooms] = useState(initialRooms);
  const [linen, setLinen] = useState(initialLinen);
  const [item, setItem] = useState("");
  const [qty, setQty] = useState(10);
  const [notes, setNotes] = useState("");

  function patchRoom(id: string, status: HousekeepingRoomStatus) {
    start(async () => {
      const res = await fetch("/api/ops/housekeeping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "room", id, status }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setRooms((list) =>
        list.map((r) => (r.id === id ? (data.room as HousekeepingRoom) : r)),
      );
      router.refresh();
    });
  }

  function patchLinen(id: string, status: LinenQueueStatus) {
    start(async () => {
      const res = await fetch("/api/ops/housekeeping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "linen", id, status }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setLinen((list) =>
        list.map((r) => (r.id === id ? (data.item as LinenQueueItem) : r)),
      );
      router.refresh();
    });
  }

  function addLinen(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await fetch("/api/ops/housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, qty, notes }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setLinen((list) => [data.item as LinenQueueItem, ...list]);
      setItem("");
      setNotes("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl text-[var(--ag-ink)]">
          Room board · రూమ్ స్టేటస్
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => (
            <article
              key={r.id}
              className="border border-[var(--ag-line)] bg-white p-4"
            >
              <h3 className="font-display text-xl">{r.roomName}</h3>
              {r.floor ? (
                <p className="text-xs text-[var(--ag-muted)]">{r.floor}</p>
              ) : null}
              <p className="mt-2 text-sm uppercase tracking-wide text-[var(--ag-red)]">
                {r.status}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {roomStatuses.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    disabled={pending || r.status === s.value}
                    onClick={() => patchRoom(r.id, s.value)}
                    className={`px-2 py-1 text-xs ${
                      r.status === s.value
                        ? "bg-[var(--ag-red)] text-white"
                        : "border border-[var(--ag-line)] hover:border-[var(--ag-red)]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
          {rooms.length === 0 ? (
            <p className="border border-[var(--ag-line)] bg-white px-4 py-8 text-[var(--ag-muted)] sm:col-span-2">
              No housekeeping rooms seeded yet.
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-[var(--ag-ink)]">
          Linen / clothes / dhobi · లినెన్ / ధోబీ
        </h2>
        <form
          onSubmit={addLinen}
          className="mt-4 grid gap-3 border border-[var(--ag-line)] bg-white p-4 sm:grid-cols-4"
        >
          <div className="grid gap-2 sm:col-span-2">
            <Label>Item</Label>
            <Input
              className="rounded-none"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Bed sheets / towels / staff uniforms"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Qty</Label>
            <Input
              type="number"
              min={1}
              className="rounded-none"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 1)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Input
              className="rounded-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="sm:col-span-4">
            <Button
              type="submit"
              disabled={pending}
              className="h-10 rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
            >
              Add to queue
            </Button>
          </div>
        </form>

        <div className="mt-4 space-y-3">
          {linen.map((l) => (
            <article
              key={l.id}
              className="flex flex-wrap items-start justify-between gap-3 border border-[var(--ag-line)] bg-white p-4"
            >
              <div>
                <p className="font-medium">
                  {l.item} · {l.qty} {l.unit}
                </p>
                <p className="text-sm uppercase tracking-wide text-[var(--ag-red)]">
                  {l.status}
                </p>
                {l.notes ? (
                  <p className="text-sm text-[var(--ag-muted)]">{l.notes}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-1">
                {linenStatuses.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    disabled={pending || l.status === s.value}
                    onClick={() => patchLinen(l.id, s.value)}
                    className={`px-2 py-1 text-xs ${
                      l.status === s.value
                        ? "bg-[var(--ag-maroon)] text-white"
                        : "border border-[var(--ag-line)] hover:border-[var(--ag-red)]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
          {linen.length === 0 ? (
            <p className="border border-[var(--ag-line)] bg-white px-4 py-8 text-[var(--ag-muted)]">
              Linen queue empty.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
