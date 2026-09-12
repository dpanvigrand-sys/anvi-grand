"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Facility, HotelInfo, MenuItem, Room, Venue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Section = "rooms" | "menu" | "venues" | "facilities" | "hotel";

type Props =
  | { section: "rooms"; initialItems: Room[] }
  | { section: "menu"; initialItems: MenuItem[] }
  | { section: "venues"; initialItems: Venue[] }
  | { section: "facilities"; initialItems: Facility[] }
  | { section: "hotel"; initialHotel: HotelInfo };

export function CatalogManager(props: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  async function save(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/ops/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage("Saved. Guest site will show the update after refresh.");
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(section: Section, id: string) {
    if (!window.confirm("Delete this item from the live website catalog?")) return;
    await save({ section, action: "delete", id });
  }

  if (props.section === "hotel") {
    return (
      <HotelEditor
        hotel={props.initialHotel}
        busy={busy}
        message={message}
        error={error}
        onSave={(item) => save({ section: "hotel", item })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--ag-muted)]">
          Changes write to <code>data/catalog.json</code> and appear on the guest site.
        </p>
        <Button
          type="button"
          className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
          onClick={() => setEditingId("new")}
          disabled={busy}
        >
          + Add new
        </Button>
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {editingId === "new" ? (
        <ItemForm
          section={props.section}
          busy={busy}
          onCancel={() => setEditingId(null)}
          onSave={(item) => save({ section: props.section, action: "upsert", item })}
        />
      ) : null}

      <div className="space-y-3">
        {props.initialItems.map((item) => (
          <div
            key={item.id}
            className="border border-[var(--ag-line)] bg-white p-4"
          >
            {editingId === item.id ? (
              <ItemForm
                section={props.section}
                busy={busy}
                initial={item}
                onCancel={() => setEditingId(null)}
                onSave={(next) =>
                  save({ section: props.section, action: "upsert", item: next })
                }
              />
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[var(--ag-ink)]">
                    {"name" in item ? (item as { name: string }).name : (item as { id: string }).id}
                  </p>
                  <p className="mt-1 text-sm text-[var(--ag-muted)]">
                    {props.section === "rooms" &&
                      `${(item as Room).pricePerNight} ₹/night · cap ${(item as Room).capacity}`}
                    {props.section === "menu" &&
                      `${(item as MenuItem).price} ₹ · ${(item as MenuItem).category}`}
                    {props.section === "venues" &&
                      `from ${(item as Venue).priceFrom} ₹ · ${(item as Venue).type}`}
                    {props.section === "facilities" &&
                      (item as Facility).description.slice(0, 80)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-none"
                    disabled={busy}
                    onClick={() => setEditingId(item.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-none border-[var(--ag-red)] text-[var(--ag-red)]"
                    disabled={busy}
                    onClick={() => remove(props.section, item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HotelEditor({
  hotel,
  busy,
  message,
  error,
  onSave,
}: {
  hotel: HotelInfo;
  busy: boolean;
  message: string;
  error: string;
  onSave: (item: Partial<HotelInfo>) => void;
}) {
  const [form, setForm] = useState({ ...hotel });
  return (
    <form
      className="grid gap-3 border border-[var(--ag-line)] bg-white p-5 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      {(
        [
          ["name", "Hotel name"],
          ["tagline", "Tagline"],
          ["address", "Address"],
          ["phone", "Phone"],
          ["email", "Email"],
          ["foodBrand", "Food brand"],
          ["heroImage", "Hero image URL/path"],
          ["logo", "Logo path"],
          ["foodLogo", "Food logo path"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="grid gap-1">
          <Label>{label}</Label>
          <Input
            className="rounded-none"
            value={String(form[key] || "")}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}
      <div className="md:col-span-2 flex gap-2">
        <Button
          type="submit"
          disabled={busy}
          className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          {busy ? "Saving…" : "Save hotel details"}
        </Button>
      </div>
      {message ? <p className="md:col-span-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? (
        <p role="alert" className="md:col-span-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function ItemForm({
  section,
  initial,
  busy,
  onSave,
  onCancel,
}: {
  section: Exclude<Section, "hotel">;
  initial?: Room | MenuItem | Venue | Facility;
  busy: boolean;
  onSave: (item: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const defaults = useMemo(() => {
    if (initial) return initial as Record<string, unknown>;
    if (section === "rooms")
      return {
        id: "",
        name: "",
        tagline: "",
        description: "",
        pricePerNight: 3000,
        capacity: 2,
        amenitiesText: "AC, Wi-Fi",
        image: "",
        available: true,
      };
    if (section === "menu")
      return {
        id: "",
        name: "",
        category: "Main",
        description: "",
        price: 199,
        veg: true,
        image: "",
      };
    if (section === "venues")
      return {
        id: "",
        type: "banquet",
        name: "",
        tagline: "",
        description: "",
        capacity: 200,
        priceFrom: 25000,
        amenitiesText: "AC, Stage",
        image: "",
      };
    return { id: "", name: "", description: "", image: "" };
  }, [initial, section]);

  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const base = { ...defaults };
    if (initial && "amenities" in initial && Array.isArray(initial.amenities)) {
      base.amenitiesText = initial.amenities.join(", ");
    }
    return base;
  });

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form
      className="grid gap-3 border border-dashed border-[var(--ag-red)]/40 bg-[#fff8f7] p-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <Field label="Name" value={String(form.name || "")} onChange={(v) => set("name", v)} />
      {section !== "facilities" && section !== "menu" ? (
        <Field
          label="Tagline"
          value={String(form.tagline || "")}
          onChange={(v) => set("tagline", v)}
        />
      ) : null}
      {section === "menu" ? (
        <Field
          label="Category"
          value={String(form.category || "")}
          onChange={(v) => set("category", v)}
        />
      ) : null}
      {section === "venues" ? (
        <div className="grid gap-1">
          <Label>Type</Label>
          <select
            className="h-9 border border-input bg-white px-2 text-sm"
            value={String(form.type || "banquet")}
            onChange={(e) => set("type", e.target.value)}
          >
            <option value="banquet">Banquet</option>
            <option value="party-hall">Party hall</option>
          </select>
        </div>
      ) : null}
      <div className="md:col-span-2 grid gap-1">
        <Label>Description</Label>
        <textarea
          className="min-h-20 border border-input bg-white px-2 py-1 text-sm"
          value={String(form.description || "")}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      {section === "rooms" ? (
        <>
          <Field
            label="Price / night (₹)"
            type="number"
            value={String(form.pricePerNight ?? "")}
            onChange={(v) => set("pricePerNight", Number(v))}
          />
          <Field
            label="Capacity"
            type="number"
            value={String(form.capacity ?? "")}
            onChange={(v) => set("capacity", Number(v))}
          />
        </>
      ) : null}
      {section === "menu" ? (
        <>
          <Field
            label="Price (₹)"
            type="number"
            value={String(form.price ?? "")}
            onChange={(v) => set("price", Number(v))}
          />
          <div className="flex items-end gap-2 pb-1">
            <input
              id="veg"
              type="checkbox"
              checked={Boolean(form.veg)}
              onChange={(e) => set("veg", e.target.checked)}
            />
            <Label htmlFor="veg">Vegetarian</Label>
          </div>
        </>
      ) : null}
      {section === "venues" ? (
        <>
          <Field
            label="Price from (₹)"
            type="number"
            value={String(form.priceFrom ?? "")}
            onChange={(v) => set("priceFrom", Number(v))}
          />
          <Field
            label="Capacity"
            type="number"
            value={String(form.capacity ?? "")}
            onChange={(v) => set("capacity", Number(v))}
          />
        </>
      ) : null}
      {(section === "rooms" || section === "venues") && (
        <Field
          label="Amenities (comma separated)"
          value={String(form.amenitiesText || "")}
          onChange={(v) => set("amenitiesText", v)}
        />
      )}
      <Field
        label="Image URL or /uploads/… path"
        value={String(form.image || "")}
        onChange={(v) => set("image", v)}
      />
      {section === "rooms" ? (
        <div className="flex items-end gap-2 pb-1">
          <input
            id="available"
            type="checkbox"
            checked={form.available !== false}
            onChange={(e) => set("available", e.target.checked)}
          />
          <Label htmlFor="available">Available for booking</Label>
        </div>
      ) : null}
      <div className="md:col-span-2 flex gap-2">
        <Button
          type="submit"
          disabled={busy}
          className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          {busy ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-none"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="grid gap-1">
      <Label>{label}</Label>
      <Input
        type={type}
        className="rounded-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
