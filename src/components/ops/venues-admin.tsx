"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Venue } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VenueFormState = {
  id?: string;
  type: "banquet" | "party-hall";
  name: string;
  tagline: string;
  description: string;
  capacity: number;
  priceFrom: number;
  amenitiesText: string;
  image: string;
};

function blankForm(): VenueFormState {
  return {
    type: "banquet",
    name: "",
    tagline: "",
    description: "",
    capacity: 200,
    priceFrom: 25000,
    amenitiesText: "AC, Stage, Sound, Catering support",
    image: "",
  };
}

function toForm(venue: Venue): VenueFormState {
  return {
    id: venue.id,
    type: venue.type,
    name: venue.name,
    tagline: venue.tagline,
    description: venue.description,
    capacity: venue.capacity,
    priceFrom: venue.priceFrom,
    amenitiesText: venue.amenities.join(", "),
    image: venue.image,
  };
}

type Props = { initialVenues: Venue[] };

export function VenuesAdmin({ initialVenues }: Props) {
  const router = useRouter();
  const [venues, setVenues] = useState(initialVenues);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialVenues.map((v) => [v.id, String(v.priceFrom)])),
  );
  const [capacityDrafts, setCapacityDrafts] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        initialVenues.map((v) => [v.id, String(v.capacity)]),
      ),
  );
  const [form, setForm] = useState<VenueFormState>(blankForm());

  async function upsert(item: VenueFormState) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/ops/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "venues",
          action: "upsert",
          item: {
            id: item.id,
            type: item.type,
            name: item.name,
            tagline: item.tagline,
            description: item.description,
            capacity: Number(item.capacity) || 1,
            priceFrom: Number(item.priceFrom) || 0,
            amenitiesText: item.amenitiesText,
            image: item.image,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const saved = data.item as Venue;
      setVenues((prev) => {
        const idx = prev.findIndex((v) => v.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setPriceDrafts((d) => ({ ...d, [saved.id]: String(saved.priceFrom) }));
      setCapacityDrafts((d) => ({
        ...d,
        [saved.id]: String(saved.capacity),
      }));
      const publicPath =
        saved.type === "party-hall" ? "/party-hall" : "/banquet";
      setMessage(
        `Saved “${saved.name}” — ${formatINR(saved.priceFrom)}/day · ${saved.capacity} guests · live on ${publicPath}.`,
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

  async function savePriceCapacity(venue: Venue) {
    const price = Number(priceDrafts[venue.id]);
    const capacity = Number(capacityDrafts[venue.id]);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid day rate in rupees.");
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 1) {
      setError("Enter a valid guest capacity.");
      return;
    }
    await upsert({
      ...toForm(venue),
      priceFrom: Math.round(price),
      capacity: Math.round(capacity),
    });
  }

  async function removeVenue(id: string) {
    if (!window.confirm("Delete this venue from the live website catalog?"))
      return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/ops/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "venues", action: "delete", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setVenues((prev) => prev.filter((v) => v.id !== id));
      setMessage("Venue deleted from catalog.");
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
          Edit banquet / party-hall day rates (₹) and guest capacity. Saves to{" "}
          <code>data/catalog.json</code> → public{" "}
          <code>/banquet</code> and <code>/party-hall</code>.
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
          + Add venue
        </Button>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {editingId === "new" ? (
        <VenueEditor
          busy={busy}
          form={form}
          setForm={setForm}
          onCancel={() => setEditingId(null)}
          onSave={() => void upsert(form)}
        />
      ) : null}

      <div className="overflow-x-auto border border-[var(--ag-line)] bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-[var(--ag-line)] bg-[var(--ag-soft)] text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Venue</th>
              <th className="px-4 py-3 font-medium">₹ / day</th>
              <th className="px-4 py-3 font-medium">Capacity</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((venue) => (
              <tr
                key={venue.id}
                id={`venue-${venue.id}`}
                className="border-b border-[var(--ag-line)] align-top"
              >
                <td
                  className="px-4 py-4"
                  colSpan={editingId === venue.id ? 5 : 1}
                >
                  {editingId === venue.id ? (
                    <VenueEditor
                      busy={busy}
                      form={form}
                      setForm={setForm}
                      onCancel={() => setEditingId(null)}
                      onSave={() => void upsert(form)}
                    />
                  ) : (
                    <>
                      <p className="font-medium text-[var(--ag-ink)]">
                        {venue.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--ag-muted)]">
                        {venue.tagline}
                      </p>
                      <p className="mt-1 text-xs text-[var(--ag-muted)]">
                        Live: {formatINR(venue.priceFrom)}/day · up to{" "}
                        {venue.capacity} guests ·{" "}
                        {venue.type === "party-hall"
                          ? "/party-hall"
                          : "/banquet"}
                      </p>
                    </>
                  )}
                </td>
                {editingId === venue.id ? null : (
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
                            priceDrafts[venue.id] ?? String(venue.priceFrom)
                          }
                          onChange={(e) =>
                            setPriceDrafts((d) => ({
                              ...d,
                              [venue.id]: e.target.value,
                            }))
                          }
                          aria-label={`Day rate for ${venue.name}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        className="h-9 w-24 rounded-none"
                        value={
                          capacityDrafts[venue.id] ?? String(venue.capacity)
                        }
                        onChange={(e) =>
                          setCapacityDrafts((d) => ({
                            ...d,
                            [venue.id]: e.target.value,
                          }))
                        }
                        aria-label={`Capacity for ${venue.name}`}
                      />
                    </td>
                    <td className="px-4 py-4">
                      {venue.type === "party-hall"
                        ? "Mini / party hall"
                        : "Banquet hall"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          disabled={busy}
                          onClick={() => void savePriceCapacity(venue)}
                          className="h-9 rounded-none bg-[var(--ag-red)] px-3 text-white hover:bg-[var(--ag-maroon)]"
                        >
                          Save ₹ + capacity
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busy}
                          onClick={() => {
                            setEditingId(venue.id);
                            setForm(toForm(venue));
                          }}
                          className="h-9 rounded-none"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busy}
                          onClick={() => void removeVenue(venue.id)}
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
            {venues.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-[var(--ag-muted)]">
                  No venues yet. Click + Add venue.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VenueEditor({
  form,
  setForm,
  busy,
  onSave,
  onCancel,
}: {
  form: VenueFormState;
  setForm: React.Dispatch<React.SetStateAction<VenueFormState>>;
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
        <Label>Type</Label>
        <select
          className="h-9 border border-input bg-white px-2 text-sm"
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type: e.target.value === "party-hall" ? "party-hall" : "banquet",
            })
          }
        >
          <option value="banquet">Banquet (public /banquet)</option>
          <option value="party-hall">Party hall (public /party-hall)</option>
        </select>
      </div>
      <div className="grid gap-1 md:col-span-2">
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
        <Label>Price / day (₹)</Label>
        <Input
          type="number"
          min={0}
          className="rounded-none"
          value={form.priceFrom}
          onChange={(e) =>
            setForm({ ...form, priceFrom: Number(e.target.value) || 0 })
          }
          required
        />
      </div>
      <div className="grid gap-1">
        <Label>Capacity (guests)</Label>
        <Input
          type="number"
          min={1}
          className="rounded-none"
          value={form.capacity}
          onChange={(e) =>
            setForm({ ...form, capacity: Number(e.target.value) || 1 })
          }
          required
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
      <div className="flex gap-2 md:col-span-2">
        <Button
          type="submit"
          disabled={busy}
          className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          {busy ? "Saving…" : "Save venue"}
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
