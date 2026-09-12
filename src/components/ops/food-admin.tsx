"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Buffet, MenuItem } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MenuForm = {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  veg: boolean;
  image: string;
};

type BuffetForm = {
  id?: string;
  name: string;
  description: string;
  pricePerPerson: number;
  meal: string;
  image: string;
};

function blankMenu(): MenuForm {
  return {
    name: "",
    category: "main-course",
    description: "",
    price: 199,
    veg: true,
    image: "",
  };
}

function blankBuffet(): BuffetForm {
  return {
    name: "",
    description: "",
    pricePerPerson: 899,
    meal: "lunch",
    image: "",
  };
}

function toMenuForm(item: MenuItem): MenuForm {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description,
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
    pricePerPerson: item.pricePerPerson,
    meal: item.meal,
    image: item.image,
  };
}

type Props = { initialMenu: MenuItem[]; initialBuffets: Buffet[] };

export function FoodAdmin({ initialMenu, initialBuffets }: Props) {
  const router = useRouter();
  const [menu, setMenu] = useState(initialMenu);
  const [buffets, setBuffets] = useState(initialBuffets);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [menuEditing, setMenuEditing] = useState<string | "new" | null>(null);
  const [buffetEditing, setBuffetEditing] = useState<string | "new" | null>(null);
  const [menuForm, setMenuForm] = useState<MenuForm>(blankMenu());
  const [buffetForm, setBuffetForm] = useState<BuffetForm>(blankBuffet());
  const [menuPrices, setMenuPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialMenu.map((m) => [m.id, String(m.price)])),
  );
  const [buffetPrices, setBuffetPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initialBuffets.map((b) => [b.id, String(b.pricePerPerson)]),
    ),
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
        `Saved “${saved.name}” — CHIGURU menu now shows ${formatINR(saved.price)}.`,
      );
      setMenuEditing(null);
      setMenuForm(blankMenu());
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
        `Saved “${saved.name}” — buffet now ${formatINR(saved.pricePerPerson)}/person.`,
      );
      setBuffetEditing(null);
      setBuffetForm(blankBuffet());
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
      } else {
        setBuffets((prev) => prev.filter((b) => b.id !== id));
      }
      setMessage(`Deleted ${label} from catalog.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {/* MENU */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-[var(--ag-ink)]">
              CHIGURU menu
            </h2>
            <p className="text-sm text-[var(--ag-muted)]">
              Dish prices write to <code>data/catalog.json</code> →{" "}
              <code>menu</code> and show on <code>/food</code>.
            </p>
          </div>
          <Button
            type="button"
            disabled={busy}
            onClick={() => {
              setMenuEditing("new");
              setMenuForm(blankMenu());
            }}
            className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
          >
            + Add dish
          </Button>
        </div>

        {menuEditing === "new" ? (
          <MenuEditor
            busy={busy}
            form={menuForm}
            setForm={setMenuForm}
            onCancel={() => setMenuEditing(null)}
            onSave={() => upsertMenu(menuForm)}
          />
        ) : null}

        <div className="overflow-x-auto border border-[var(--ag-line)] bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[var(--ag-line)] bg-[var(--ag-soft)] text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Dish</th>
                <th className="px-4 py-3 font-medium">Price (₹)</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menu.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--ag-line)] align-top"
                >
                  <td
                    className="px-4 py-4"
                    colSpan={menuEditing === item.id ? 5 : 1}
                  >
                    {menuEditing === item.id ? (
                      <MenuEditor
                        busy={busy}
                        form={menuForm}
                        setForm={setMenuForm}
                        onCancel={() => setMenuEditing(null)}
                        onSave={() => upsertMenu(menuForm)}
                      />
                    ) : (
                      <>
                        <p className="font-medium text-[var(--ag-ink)]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--ag-muted)]">
                          Live: {formatINR(item.price)}
                        </p>
                      </>
                    )}
                  </td>
                  {menuEditing === item.id ? null : (
                    <>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[var(--ag-muted)]">₹</span>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            className="h-9 w-24 rounded-none"
                            value={menuPrices[item.id] ?? String(item.price)}
                            onChange={(e) =>
                              setMenuPrices((d) => ({
                                ...d,
                                [item.id]: e.target.value,
                              }))
                            }
                            aria-label={`Price for ${item.name}`}
                          />
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() => saveMenuPrice(item)}
                            className="h-9 rounded-none bg-[var(--ag-red)] px-3 text-white hover:bg-[var(--ag-maroon)]"
                          >
                            Save ₹
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-4">{item.category}</td>
                      <td className="px-4 py-4">
                        {item.veg ? "Veg" : "Non-veg"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() => {
                              setMenuEditing(item.id);
                              setMenuForm(toMenuForm(item));
                            }}
                            className="h-9 rounded-none"
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() => removeItem("menu", item.id)}
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
              {menu.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-[var(--ag-muted)]">
                    No dishes yet. Click + Add dish.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* BUFFETS */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-[var(--ag-ink)]">
              Buffets
            </h2>
            <p className="text-sm text-[var(--ag-muted)]">
              Per-person rates write to <code>buffets</code> and show on{" "}
              <code>/buffet</code>.
            </p>
          </div>
          <Button
            type="button"
            disabled={busy}
            onClick={() => {
              setBuffetEditing("new");
              setBuffetForm(blankBuffet());
            }}
            className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
          >
            + Add buffet
          </Button>
        </div>

        {buffetEditing === "new" ? (
          <BuffetEditor
            busy={busy}
            form={buffetForm}
            setForm={setBuffetForm}
            onCancel={() => setBuffetEditing(null)}
            onSave={() => upsertBuffet(buffetForm)}
          />
        ) : null}

        <div className="overflow-x-auto border border-[var(--ag-line)] bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--ag-line)] bg-[var(--ag-soft)] text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Buffet</th>
                <th className="px-4 py-3 font-medium">₹ / person</th>
                <th className="px-4 py-3 font-medium">Meal</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buffets.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--ag-line)] align-top"
                >
                  <td
                    className="px-4 py-4"
                    colSpan={buffetEditing === item.id ? 4 : 1}
                  >
                    {buffetEditing === item.id ? (
                      <BuffetEditor
                        busy={busy}
                        form={buffetForm}
                        setForm={setBuffetForm}
                        onCancel={() => setBuffetEditing(null)}
                        onSave={() => upsertBuffet(buffetForm)}
                      />
                    ) : (
                      <>
                        <p className="font-medium text-[var(--ag-ink)]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--ag-muted)]">
                          Live: {formatINR(item.pricePerPerson)}/person
                        </p>
                      </>
                    )}
                  </td>
                  {buffetEditing === item.id ? null : (
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
                              buffetPrices[item.id] ??
                              String(item.pricePerPerson)
                            }
                            onChange={(e) =>
                              setBuffetPrices((d) => ({
                                ...d,
                                [item.id]: e.target.value,
                              }))
                            }
                            aria-label={`Price for ${item.name}`}
                          />
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() => saveBuffetPrice(item)}
                            className="h-9 rounded-none bg-[var(--ag-red)] px-3 text-white hover:bg-[var(--ag-maroon)]"
                          >
                            Save ₹
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-4 capitalize">{item.meal}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() => {
                              setBuffetEditing(item.id);
                              setBuffetForm(toBuffetForm(item));
                            }}
                            className="h-9 rounded-none"
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() => removeItem("buffets", item.id)}
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
              {buffets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-[var(--ag-muted)]">
                    No buffets yet. Click + Add buffet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MenuEditor({
  form,
  setForm,
  busy,
  onSave,
  onCancel,
}: {
  form: MenuForm;
  setForm: React.Dispatch<React.SetStateAction<MenuForm>>;
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
        <Label>Category</Label>
        <Input
          className="rounded-none"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="main-course, breakfast, dessert…"
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
        <Label>Price (₹)</Label>
        <Input
          type="number"
          min={0}
          className="rounded-none"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: Number(e.target.value) || 0 })
          }
          required
        />
      </div>
      <div className="flex items-end gap-2 pb-1">
        <input
          id="dish-veg"
          type="checkbox"
          checked={form.veg}
          onChange={(e) => setForm({ ...form, veg: e.target.checked })}
        />
        <Label htmlFor="dish-veg">Vegetarian</Label>
      </div>
      <div className="grid gap-1 md:col-span-2">
        <Label>Image URL or path</Label>
        <Input
          className="rounded-none"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
      </div>
      <div className="flex gap-2 md:col-span-2">
        <Button
          type="submit"
          disabled={busy}
          className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          {busy ? "Saving…" : "Save dish"}
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

function BuffetEditor({
  form,
  setForm,
  busy,
  onSave,
  onCancel,
}: {
  form: BuffetForm;
  setForm: React.Dispatch<React.SetStateAction<BuffetForm>>;
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
        <Label>Meal</Label>
        <select
          className="h-9 border border-input bg-white px-2 text-sm"
          value={form.meal}
          onChange={(e) => setForm({ ...form, meal: e.target.value })}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
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
        <Label>Price / person (₹)</Label>
        <Input
          type="number"
          min={0}
          className="rounded-none"
          value={form.pricePerPerson}
          onChange={(e) =>
            setForm({
              ...form,
              pricePerPerson: Number(e.target.value) || 0,
            })
          }
          required
        />
      </div>
      <div className="grid gap-1">
        <Label>Image URL or path</Label>
        <Input
          className="rounded-none"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
      </div>
      <div className="flex gap-2 md:col-span-2">
        <Button
          type="submit"
          disabled={busy}
          className="rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
        >
          {busy ? "Saving…" : "Save buffet"}
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
