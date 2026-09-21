"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Buffet, MenuItem } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  initialMenu: MenuItem[];
  initialBuffets: Buffet[];
};

type MenuForm = {
  id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  veg: boolean;
  image: string;
};

type BuffetForm = {
  id?: string;
  name: string;
  description: string;
  meal: string;
  pricePerPerson: number;
  image: string;
};

const MENU_CATEGORIES = [
  "main-course",
  "veg",
  "non-veg",
  "breakfast",
  "dessert",
  "beverage",
  "starters",
  "biryani",
  "breads",
];

const MEALS = ["breakfast", "lunch", "dinner"];

function blankMenu(): MenuForm {
  return {
    name: "",
    description: "",
    category: "main-course",
    price: 299,
    veg: true,
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80",
  };
}

function blankBuffet(): BuffetForm {
  return {
    name: "",
    description: "",
    meal: "lunch",
    pricePerPerson: 699,
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
  };
}

function toMenuForm(item: MenuItem): MenuForm {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    price: item.price,
    veg: item.veg,
    image: item.image,
  };
}

function toBuffetForm(item: Buffet): BuffetForm {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    meal: item.meal,
    pricePerPerson: item.pricePerPerson,
    image: item.image,
  };
}

export function FoodAdmin({ initialMenu, initialBuffets }: Props) {
  const router = useRouter();
  const [menu, setMenu] = useState(initialMenu);
  const [buffets, setBuffets] = useState(initialBuffets);
  const [menuPrices, setMenuPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialMenu.map((m) => [m.id, String(m.price)])),
  );
  const [buffetPrices, setBuffetPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialBuffets.map((b) => [b.id, String(b.pricePerPerson)])),
  );
  const [menuForm, setMenuForm] = useState<MenuForm | null>(null);
  const [buffetForm, setBuffetForm] = useState<BuffetForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sortedMenu = useMemo(
    () =>
      [...menu].sort((a, b) =>
        a.category === b.category
          ? a.name.localeCompare(b.name)
          : a.category.localeCompare(b.category),
      ),
    [menu],
  );

  async function postCatalog(body: Record<string, unknown>) {
    const res = await fetch("/api/ops/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Save failed");
    return data;
  }

  async function upsertMenu(item: MenuForm) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await postCatalog({
        section: "menu",
        action: "upsert",
        item: {
          id: item.id,
          name: item.name,
          category: item.category,
          description: item.description,
          price: Number(item.price) || 0,
          veg: item.veg,
          image: item.image,
        },
      });
      const saved = data.item as MenuItem;
      setMenu((prev) => {
        const idx = prev.findIndex((m) => m.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setMenuPrices((d) => ({ ...d, [saved.id]: String(saved.price) }));
      setMessage(
        `Saved full menu item “${saved.name}” — live on /food (${formatINR(saved.price)}).`,
      );
      setMenuForm(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function upsertBuffet(item: BuffetForm) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await postCatalog({
        section: "buffets",
        action: "upsert",
        item: {
          id: item.id,
          name: item.name,
          description: item.description,
          pricePerPerson: Number(item.pricePerPerson) || 0,
          meal: item.meal,
          image: item.image,
        },
      });
      const saved = data.item as Buffet;
      setBuffets((prev) => {
        const idx = prev.findIndex((b) => b.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setBuffetPrices((d) => ({
        ...d,
        [saved.id]: String(saved.pricePerPerson),
      }));
      setMessage(
        `Saved full buffet “${saved.name}” — live on /buffet (${formatINR(saved.pricePerPerson)}/person).`,
      );
      setBuffetForm(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveMenuPrice(item: MenuItem) {
    const price = Number(menuPrices[item.id]);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid menu price in rupees.");
      return;
    }
    await upsertMenu({ ...toMenuForm(item), price: Math.round(price) });
  }

  async function saveBuffetPrice(item: Buffet) {
    const price = Number(buffetPrices[item.id]);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid buffet price in rupees.");
      return;
    }
    await upsertBuffet({
      ...toBuffetForm(item),
      pricePerPerson: Math.round(price),
    });
  }

  async function removeItem(section: "menu" | "buffets", id: string) {
    const label = section === "menu" ? "menu dish" : "buffet";
    if (!window.confirm(`Delete this ${label} from the live catalog?`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await postCatalog({ section, action: "delete", id });
      if (section === "menu") {
        setMenu((prev) => prev.filter((m) => m.id !== id));
        if (menuForm?.id === id) setMenuForm(null);
        setMessage("Menu item deleted. Public /food updated.");
      } else {
        setBuffets((prev) => prev.filter((b) => b.id !== id));
        if (buffetForm?.id === id) setBuffetForm(null);
        setMessage("Buffet deleted. Public /buffet updated.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  function submitMenu() {
    if (!menuForm) return;
    if (!menuForm.name.trim() || !menuForm.description.trim() || !menuForm.image.trim()) {
      setError("Name, description, and image URL are required.");
      return;
    }
    if (!Number.isFinite(menuForm.price) || menuForm.price <= 0) {
      setError("Enter a valid price.");
      return;
    }
    void upsertMenu({
      ...menuForm,
      name: menuForm.name.trim(),
      description: menuForm.description.trim(),
      category: menuForm.category.trim() || "main-course",
      image: menuForm.image.trim(),
      price: Math.round(menuForm.price),
    });
  }

  function submitBuffet() {
    if (!buffetForm) return;
    if (
      !buffetForm.name.trim() ||
      !buffetForm.description.trim() ||
      !buffetForm.image.trim()
    ) {
      setError("Name, description, and image URL are required.");
      return;
    }
    if (!Number.isFinite(buffetForm.pricePerPerson) || buffetForm.pricePerPerson <= 0) {
      setError("Enter a valid price per person.");
      return;
    }
    void upsertBuffet({
      ...buffetForm,
      name: buffetForm.name.trim(),
      description: buffetForm.description.trim(),
      meal: buffetForm.meal.trim() || "lunch",
      image: buffetForm.image.trim(),
      pricePerPerson: Math.round(buffetForm.pricePerPerson),
    });
  }

  return (
    <div className="space-y-10">
      {message ? <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p> : null}
      {error ? (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-[var(--ag-ink)]">IRAA Dine menu</h2>
            <p className="mt-1 text-sm text-[var(--ag-muted)]">
              <strong>Edit item</strong> opens the full form (name, description, category, veg/non-veg,
              price, image URL). Keep <strong>Save ₹</strong> for rate-only updates. Add / Delete stay
              available.
            </p>
          </div>
          <Button
            type="button"
            disabled={busy}
            onClick={() => {
              setBuffetForm(null);
              setMenuForm(blankMenu());
            }}
            className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
          >
            + Add menu item
          </Button>
        </div>

        {menuForm ? (
          <MenuFullForm
            form={menuForm}
            busy={busy}
            onChange={setMenuForm}
            onCancel={() => setMenuForm(null)}
            onSubmit={submitMenu}
          />
        ) : null}

        <div className="divide-y divide-[var(--ag-line)] overflow-hidden rounded-2xl border border-[var(--ag-line)] bg-white">
          {sortedMenu.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 p-4 sm:grid-cols-[72px_1fr_auto] sm:items-center"
            >
              <div className="relative h-16 w-[72px] overflow-hidden rounded-lg bg-[var(--ag-cream)]">
                <Image src={item.image} alt="" fill className="object-cover" sizes="72px" unoptimized />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[var(--ag-ink)]">
                  {item.name}{" "}
                  <span className="text-xs font-normal text-[var(--ag-muted)]">
                    · {item.category} · {item.veg ? "Veg" : "Non-veg"}
                  </span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-[var(--ag-muted)]">{item.description}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ag-maroon)]">
                  {formatINR(item.price)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Label className="flex items-center gap-1 text-sm font-normal">
                  <span className="text-[var(--ag-muted)]">₹</span>
                  <Input
                    type="number"
                    min={0}
                    value={menuPrices[item.id] ?? ""}
                    onChange={(e) =>
                      setMenuPrices((d) => ({ ...d, [item.id]: e.target.value }))
                    }
                    className="h-9 w-24 rounded-md"
                  />
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void saveMenuPrice(item)}
                  className="h-9 rounded-none px-3 text-xs"
                >
                  Save ₹
                </Button>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setBuffetForm(null);
                    setMenuForm(toMenuForm(item));
                  }}
                  className="h-9 rounded-none bg-[var(--ag-ink)] px-3 text-xs text-white hover:bg-[var(--ag-maroon)]"
                >
                  Edit item
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void removeItem("menu", item.id)}
                  className="h-9 px-3 text-xs text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-[var(--ag-ink)]">Buffet packages</h2>
            <p className="mt-1 text-sm text-[var(--ag-muted)]">
              Full edit for name, meal, description, price/person, and image. Changes go live on /buffet.
            </p>
          </div>
          <Button
            type="button"
            disabled={busy}
            onClick={() => {
              setMenuForm(null);
              setBuffetForm(blankBuffet());
            }}
            className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
          >
            + Add buffet
          </Button>
        </div>

        {buffetForm ? (
          <BuffetFullForm
            form={buffetForm}
            busy={busy}
            onChange={setBuffetForm}
            onCancel={() => setBuffetForm(null)}
            onSubmit={submitBuffet}
          />
        ) : null}

        <div className="divide-y divide-[var(--ag-line)] overflow-hidden rounded-2xl border border-[var(--ag-line)] bg-white">
          {buffets.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 p-4 sm:grid-cols-[72px_1fr_auto] sm:items-center"
            >
              <div className="relative h-16 w-[72px] overflow-hidden rounded-lg bg-[var(--ag-cream)]">
                <Image src={item.image} alt="" fill className="object-cover" sizes="72px" unoptimized />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[var(--ag-ink)]">
                  {item.name}{" "}
                  <span className="text-xs font-normal text-[var(--ag-muted)]">· {item.meal}</span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-[var(--ag-muted)]">{item.description}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ag-maroon)]">
                  {formatINR(item.pricePerPerson)}
                  <span className="font-normal text-[var(--ag-muted)]"> / person</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Label className="flex items-center gap-1 text-sm font-normal">
                  <span className="text-[var(--ag-muted)]">₹</span>
                  <Input
                    type="number"
                    min={0}
                    value={buffetPrices[item.id] ?? ""}
                    onChange={(e) =>
                      setBuffetPrices((d) => ({ ...d, [item.id]: e.target.value }))
                    }
                    className="h-9 w-24 rounded-md"
                  />
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void saveBuffetPrice(item)}
                  className="h-9 rounded-none px-3 text-xs"
                >
                  Save ₹
                </Button>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setMenuForm(null);
                    setBuffetForm(toBuffetForm(item));
                  }}
                  className="h-9 rounded-none bg-[var(--ag-ink)] px-3 text-xs text-white hover:bg-[var(--ag-maroon)]"
                >
                  Edit item
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void removeItem("buffets", item.id)}
                  className="h-9 px-3 text-xs text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MenuFullForm({
  form,
  busy,
  onChange,
  onCancel,
  onSubmit,
}: {
  form: MenuForm;
  busy: boolean;
  onChange: (f: MenuForm) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const categories = MENU_CATEGORIES.includes(form.category)
    ? MENU_CATEGORIES
    : [form.category, ...MENU_CATEGORIES];

  return (
    <div
      id="menu-full-editor"
      className="space-y-4 rounded-2xl border-2 border-[var(--ag-maroon)] bg-[var(--ag-cream)]/50 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl text-[var(--ag-ink)]">
          {form.id ? "Edit menu item" : "New menu item"}
        </h3>
        <p className="text-xs text-[var(--ag-muted)]">
          Full upsert → name, description, category, veg, price, image
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="menu-name">Name</Label>
          <Input
            id="menu-name"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="Dish name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="menu-category">Category</Label>
          <select
            id="menu-category"
            value={form.category}
            onChange={(e) => onChange({ ...form, category: e.target.value })}
            className="flex h-9 w-full rounded-md border border-[var(--ag-line)] bg-white px-3 text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="menu-price">Price (₹)</Label>
          <Input
            id="menu-price"
            type="number"
            min={1}
            value={form.price}
            onChange={(e) => onChange({ ...form, price: Number(e.target.value) })}
          />
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-medium">Diet</legend>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="menu-veg"
                checked={form.veg}
                onChange={() => onChange({ ...form, veg: true })}
              />
              Veg
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="menu-veg"
                checked={!form.veg}
                onChange={() => onChange({ ...form, veg: false })}
              />
              Non-veg
            </label>
          </div>
        </fieldset>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="menu-desc">Description</Label>
          <textarea
            id="menu-desc"
            rows={3}
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            className="w-full rounded-md border border-[var(--ag-line)] bg-white px-3 py-2 text-sm"
            placeholder="Short dish description for the public menu"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="menu-image">Image URL</Label>
          <Input
            id="menu-image"
            value={form.image}
            onChange={(e) => onChange({ ...form, image: e.target.value })}
            className="font-mono text-xs"
          />
        </div>
        {form.image ? (
          <div className="relative h-40 overflow-hidden rounded-xl sm:col-span-2">
            <Image src={form.image} alt="" fill className="object-cover" sizes="600px" unoptimized />
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy}
          onClick={onSubmit}
          className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          {busy ? "Saving…" : "Save full item"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-none">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function BuffetFullForm({
  form,
  busy,
  onChange,
  onCancel,
  onSubmit,
}: {
  form: BuffetForm;
  busy: boolean;
  onChange: (f: BuffetForm) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const meals = MEALS.includes(form.meal) ? MEALS : [form.meal, ...MEALS];

  return (
    <div
      id="buffet-full-editor"
      className="space-y-4 rounded-2xl border-2 border-[var(--ag-maroon)] bg-[var(--ag-cream)]/50 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl text-[var(--ag-ink)]">
          {form.id ? "Edit buffet package" : "New buffet package"}
        </h3>
        <p className="text-xs text-[var(--ag-muted)]">
          Full upsert → name, meal, description, price/person, image
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="buffet-name">Name</Label>
          <Input
            id="buffet-name"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="buffet-meal">Meal</Label>
          <select
            id="buffet-meal"
            value={form.meal}
            onChange={(e) => onChange({ ...form, meal: e.target.value })}
            className="flex h-9 w-full rounded-md border border-[var(--ag-line)] bg-white px-3 text-sm"
          >
            {meals.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="buffet-price">Price / person (₹)</Label>
          <Input
            id="buffet-price"
            type="number"
            min={1}
            value={form.pricePerPerson}
            onChange={(e) => onChange({ ...form, pricePerPerson: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="buffet-desc">Description</Label>
          <textarea
            id="buffet-desc"
            rows={3}
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            className="w-full rounded-md border border-[var(--ag-line)] bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="buffet-image">Image URL</Label>
          <Input
            id="buffet-image"
            value={form.image}
            onChange={(e) => onChange({ ...form, image: e.target.value })}
            className="font-mono text-xs"
          />
        </div>
        {form.image ? (
          <div className="relative h-40 overflow-hidden rounded-xl sm:col-span-2">
            <Image src={form.image} alt="" fill className="object-cover" sizes="600px" unoptimized />
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy}
          onClick={onSubmit}
          className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          {busy ? "Saving…" : "Save full item"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-none">
          Cancel
        </Button>
      </div>
    </div>
  );
}
