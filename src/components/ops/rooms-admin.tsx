"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Room } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoomFormState = {
  id?: string;
  name: string;
  tagline: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  amenitiesText: string;
  image: string;
  available: boolean;
};

function blankForm(): RoomFormState {
  return {
    name: "",
    tagline: "",
    description: "",
    pricePerNight: 3000,
    capacity: 2,
    amenitiesText: "AC, Wi-Fi, TV",
    image: "",
    available: true,
  };
}

function toForm(room: Room): RoomFormState {
  return {
    id: room.id,
    name: room.name,
    tagline: room.tagline,
    description: room.description,
    pricePerNight: room.pricePerNight,
    capacity: room.capacity,
    amenitiesText: room.amenities.join(", "),
    image: room.image,
    available: room.available,
  };
}

type Props = { initialRooms: Room[] };

export function RoomsAdmin({ initialRooms }: Props) {
  const router = useRouter();
  const [rooms, setRooms] = useState(initialRooms);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialRooms.map((r) => [r.id, String(r.pricePerNight)])),
  );
  const [form, setForm] = useState<RoomFormState>(blankForm());

  async function upsert(item: RoomFormState) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/ops/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "rooms",
          action: "upsert",
          item: {
            id: item.id,
            name: item.name,
            tagline: item.tagline,
            description: item.description,
            pricePerNight: Number(item.pricePerNight) || 0,
            capacity: Number(item.capacity) || 1,
            amenitiesText: item.amenitiesText,
            image: item.image,
            available: item.available,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const saved = data.item as Room;
      setRooms((prev) => {
        const idx = prev.findIndex((r) => r.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setPriceDrafts((d) => ({ ...d, [saved.id]: String(saved.pricePerNight) }));
      setMessage(
        `Saved “${saved.name}” — public Rooms now show ${formatINR(saved.pricePerNight)}/night.`,
      );
      setEditingId(null);
      setForm(blankForm());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function savePrice(room: Room) {
    const price = Number(priceDrafts[room.id]);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price in rupees.");
      return;
    }
    await upsert({
      ...toForm(room),
      pricePerNight: Math.round(price),
    });
  }

  async function removeRoom(id: string) {
    if (!window.confirm("Delete this room from the live website catalog?")) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/ops/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "rooms", action: "delete", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setRooms((prev) => prev.filter((r) => r.id !== id));
      setMessage("Room deleted from catalog.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--ag-muted)]">
          Edit room rates in ₹. Saves to <code>data/catalog.json</code> and
          updates the public Rooms pages immediately.
        </p>
        <Button
          type="button"
          disabled={busy}
          onClick={() => {
            setEditingId("new");
            setForm(blankForm());
          }}
          className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          + Add room
        </Button>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {editingId === "new" ? (
        <RoomEditor
          busy={busy}
          form={form}
          setForm={setForm}
          onCancel={() => setEditingId(null)}
          onSave={() => upsert(form)}
        />
      ) : null}

      <div className="overflow-x-auto border border-[var(--ag-line)] bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--ag-line)] bg-[var(--ag-soft)] text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Room</th>
              <th className="px-4 py-3 font-medium">Price / night (₹)</th>
              <th className="px-4 py-3 font-medium">Capacity</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr
                key={room.id}
                className="border-b border-[var(--ag-line)] align-top"
              >
                <td className="px-4 py-4" colSpan={editingId === room.id ? 5 : 1}>
                  {editingId === room.id ? (
                    <RoomEditor
                      busy={busy}
                      form={form}
                      setForm={setForm}
                      onCancel={() => setEditingId(null)}
                      onSave={() => upsert(form)}
                    />
                  ) : (
                    <>
                      <p className="font-medium text-[var(--ag-ink)]">{room.name}</p>
                      <p className="mt-1 text-xs text-[var(--ag-muted)]">
                        {room.tagline}
                      </p>
                      <p className="mt-1 text-xs text-[var(--ag-muted)]">
                        Live: {formatINR(room.pricePerNight)}/night
                      </p>
                    </>
                  )}
                </td>
                {editingId === room.id ? null : (
                  <>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[var(--ag-muted)]">₹</span>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          className="h-9 w-28 rounded-none"
                          value={
                            priceDrafts[room.id] ?? String(room.pricePerNight)
                          }
                          onChange={(e) =>
                            setPriceDrafts((d) => ({
                              ...d,
                              [room.id]: e.target.value,
                            }))
                          }
                          aria-label={`Price for ${room.name}`}
                        />
                        <Button
                          type="button"
                          disabled={busy}
                          onClick={() => savePrice(room)}
                          className="h-9 rounded-none bg-[var(--ag-red)] px-3 text-white hover:bg-[var(--ag-maroon)]"
                        >
                          Save ₹
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-4">{room.capacity}</td>
                    <td className="px-4 py-4">
                      {room.available ? (
                        <span className="text-emerald-700">Available</span>
                      ) : (
                        <span className="text-red-700">Hidden</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busy}
                          onClick={() => {
                            setEditingId(room.id);
                            setForm(toForm(room));
                          }}
                          className="h-9 rounded-none"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busy}
                          onClick={() => removeRoom(room.id)}
                          className="h-9 rounded-none border-[var(--ag-red)] text-[var(--ag-red)] hover:bg-[var(--ag-red)] hover:text-white"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-[var(--ag-muted)]">
                  No rooms yet. Click + Add room.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoomEditor({
  form,
  setForm,
  busy,
  onSave,
  onCancel,
}: {
  form: RoomFormState;
  setForm: React.Dispatch<React.SetStateAction<RoomFormState>>;
  busy: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="grid gap-3 border border-dashed border-[var(--ag-red)]/40 bg-[#fff8f7] p-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="grid gap-1">
        <Label>Name</Label>
        <Input
          className="rounded-none"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-1">
        <Label>Tagline</Label>
        <Input
          className="rounded-none"
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
        />
      </div>
      <div className="grid gap-1 md:col-span-2">
        <Label>Description</Label>
        <textarea
          className="min-h-20 border border-input bg-white px-2 py-1 text-sm"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid gap-1">
        <Label>Price / night (₹)</Label>
        <Input
          type="number"
          min={0}
          className="rounded-none"
          value={form.pricePerNight}
          onChange={(e) =>
            setForm({ ...form, pricePerNight: Number(e.target.value) || 0 })
          }
          required
        />
      </div>
      <div className="grid gap-1">
        <Label>Capacity</Label>
        <Input
          type="number"
          min={1}
          className="rounded-none"
          value={form.capacity}
          onChange={(e) =>
            setForm({ ...form, capacity: Number(e.target.value) || 1 })
          }
        />
      </div>
      <div className="grid gap-1 md:col-span-2">
        <Label>Amenities (comma-separated)</Label>
        <Input
          className="rounded-none"
          value={form.amenitiesText}
          onChange={(e) => setForm({ ...form, amenitiesText: e.target.value })}
        />
      </div>
      <div className="grid gap-1 md:col-span-2">
        <Label>Image URL or path</Label>
        <Input
          className="rounded-none"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          placeholder="https://… or /uploads/…"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="room-available"
          type="checkbox"
          checked={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.checked })}
        />
        <Label htmlFor="room-available">Available on guest site</Label>
      </div>
      <div className="flex gap-2 md:col-span-2">
        <Button
          type="submit"
          disabled={busy}
          className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          {busy ? "Saving…" : "Save room"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onCancel}
          className="rounded-none"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
