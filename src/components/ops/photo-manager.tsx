"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MediaItem } from "@/lib/media-types";
import { websitePlace } from "@/lib/media-place";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GROUPS: MediaItem["group"][] = [
  "Gallery",
  "Website",
  "Rooms",
  "Food",
  "Venues",
  "Facilities",
];

type Props = { initialItems: MediaItem[] };

function slotForPlace(key: string): string {
  if (key === "hotel:hero") return "hero";
  if (key.startsWith("room:")) return "room";
  if (key.startsWith("menu:") || key.startsWith("buffet:")) return "food";
  if (!key) return "";
  return "gallery";
}

export function PhotoManager({ initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState("All");
  const [label, setLabel] = useState("");
  const [group, setGroup] = useState<MediaItem["group"]>("Website");
  const [slot, setSlot] = useState("hero");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [catalogKey, setCatalogKey] = useState("hotel:hero");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editGroup, setEditGroup] = useState<MediaItem["group"]>("Gallery");
  const [editSrc, setEditSrc] = useState("");
  const [editCatalogKey, setEditCatalogKey] = useState("");

  const placementOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: "", label: "Gallery only (extra photo on /gallery)" },
      { value: "hotel:hero", label: "Home hero (/)" },
    ];
    const seen = new Set(["", "hotel:hero"]);
    for (const item of items) {
      if (!item.catalogKey || seen.has(item.catalogKey)) continue;
      seen.add(item.catalogKey);
      opts.push({ value: item.catalogKey, label: websitePlace(item) });
    }
    return opts;
  }, [items]);

  const byGroup = useMemo(() => {
    const map = new Map<string, MediaItem[]>();
    for (const item of items) {
      if (filter !== "All" && item.group !== filter) continue;
      const list = map.get(item.group) || [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()];
  }, [items, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: items.length };
    for (const g of GROUPS) c[g] = items.filter((i) => i.group === g).length;
    return c;
  }, [items]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !url.trim()) {
      setError("Choose an image file or paste an image URL.");
      return;
    }
    if (group !== "Gallery" && !catalogKey) {
      setError(
        "Pick a website place (e.g. Home hero) so the guest page updates. Or set category to Gallery for /gallery only.",
      );
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const fd = new FormData();
      if (file) fd.set("file", file);
      if (url.trim()) fd.set("src", url.trim());
      fd.set("label", label);
      fd.set("group", group);
      if (slot) fd.set("slot", slot);
      if (catalogKey) fd.set("catalogKey", catalogKey);
      const res = await fetch("/api/ops/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Add failed");
      const saved = data.item as MediaItem;
      setItems((prev) => {
        const without = prev.filter(
          (i) =>
            i.id !== saved.id &&
            (!saved.catalogKey || i.catalogKey !== saved.catalogKey),
        );
        return [saved, ...without];
      });
      setLabel("");
      setFile(null);
      setUrl("");
      setMessage(
        saved.catalogKey
          ? `Saved — live on ${websitePlace(saved)}. Hard-refresh guest pages to confirm.`
          : "Photo added to the gallery library (/gallery).",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSync(force = false) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/ops/media/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setItems(data.items as MediaItem[]);
      setMessage(
        `Synced site photos. Library now has ${data.count} images (${data.added} new).`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    const target = items.find((i) => i.id === id);
    const place = target ? websitePlace(target) : "this photo";
    if (
      !window.confirm(
        target?.catalogKey
          ? `Delete photo for ${place}? Guests will stop seeing this image until you add a new one.`
          : "Delete this gallery photo?",
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/ops/media/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setItems((prev) => prev.filter((i) => i.id !== id));
      setMessage(`Deleted — ${place} updated.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveEdit(id: string) {
    if (!editSrc.trim()) {
      setError("Image URL cannot be empty.");
      return;
    }
    if (editGroup !== "Gallery" && !editCatalogKey) {
      setError(
        "Pick a website place so guests see this photo, or set category to Gallery.",
      );
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/ops/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editLabel,
          group: editGroup,
          src: editSrc.trim(),
          catalogKey: editCatalogKey,
          slot: slotForPlace(editCatalogKey) || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      const saved = data.item as MediaItem;
      setItems((prev) => {
        const without = prev.filter(
          (i) =>
            i.id !== id &&
            i.id !== saved.id &&
            (!saved.catalogKey || i.catalogKey !== saved.catalogKey),
        );
        return [saved, ...without];
      });
      setEditingId(null);
      setMessage(
        saved.catalogKey
          ? `Updated — live on ${websitePlace(saved)}.`
          : "Updated library photo (gallery only).",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3 border border-[var(--ag-line)] bg-white p-4">
        <p className="flex-1 text-sm text-[var(--ag-muted)]">
          Choose a <strong>website place</strong> (Home hero, room, CHIGURU dish,
          …) when uploading — category alone does not update guest pages. Files
          save under <code>/uploads/</code> and appear after hard refresh, no
          restart.
        </p>
        <Button
          type="button"
          disabled={busy}
          onClick={() => void onSync(false)}
          className="h-10 rounded-none bg-[var(--ag-maroon)] text-white hover:bg-[var(--ag-red)]"
        >
          {busy ? "Working…" : "Sync from website"}
        </Button>
      </div>

      <form
        onSubmit={(e) => void onAdd(e)}
        className="grid gap-4 border border-[var(--ag-line)] bg-white p-5 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
            Add photo
          </p>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            Upload a WhatsApp JPEG (or any image) <em>or</em> paste a URL. Assign
            a website place to replace that slot on the public site immediately.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="photo-file">Image file (optional)</Label>
          <Input
            id="photo-file"
            type="file"
            accept="image/*"
            className="rounded-none"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="photo-url">Image URL (optional)</Label>
          <Input
            id="photo-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… or /uploads/…"
            className="rounded-none font-mono text-xs"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="photo-label">Label</Label>
          <Input
            id="photo-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Lobby evening"
            className="rounded-none"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="photo-group">Category</Label>
          <select
            id="photo-group"
            value={group}
            onChange={(e) => {
              const g = e.target.value as MediaItem["group"];
              setGroup(g);
              if (g === "Gallery") {
                setCatalogKey("");
                setSlot("");
              } else if (!catalogKey) {
                setCatalogKey("hotel:hero");
                setSlot("hero");
              }
            }}
            className="h-9 border border-input bg-transparent px-2 text-sm"
          >
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="photo-place">Website place (required for guest pages)</Label>
          <select
            id="photo-place"
            value={catalogKey}
            onChange={(e) => {
              const v = e.target.value;
              setCatalogKey(v);
              setSlot(slotForPlace(v));
              if (!v) setGroup("Gallery");
              else if (group === "Gallery") setGroup("Website");
            }}
            className="h-9 border border-input bg-transparent px-2 text-sm"
          >
            {placementOptions.map((o) => (
              <option key={o.value || "gallery"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Button
            type="submit"
            disabled={busy}
            className="h-11 rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
          >
            {busy ? "Working…" : "Add / replace photo"}
          </Button>
        </div>
        {message ? (
          <p className="md:col-span-2 text-sm text-emerald-700">{message}</p>
        ) : null}
        {error ? (
          <p role="alert" className="md:col-span-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </form>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl text-[var(--ag-ink)]">
            Photo library ({items.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {["All", ...GROUPS].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setFilter(g)}
                className={`border px-3 py-1 text-xs uppercase tracking-[0.12em] ${
                  filter === g
                    ? "border-[var(--ag-red)] bg-[var(--ag-red)] text-white"
                    : "border-[var(--ag-line)] text-[var(--ag-muted)] hover:border-[var(--ag-red)]"
                }`}
              >
                {g} ({counts[g] ?? 0})
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <p className="mt-3 text-[var(--ag-muted)]">
            No photos yet. Click <strong>Sync from website</strong> or add
            above.
          </p>
        ) : (
          <div className="mt-5 space-y-8">
            {byGroup.map(([g, list]) => (
              <div key={g}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
                  {g} · {list.length}
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((item) => (
                    <figure
                      key={item.id}
                      className="overflow-hidden border border-[var(--ag-line)] bg-white"
                    >
                      {item.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.src}
                          alt={item.label}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center bg-[var(--ag-cream)] text-sm text-[var(--ag-muted)]">
                          No image
                        </div>
                      )}
                      <figcaption className="space-y-2 p-3">
                        {editingId === item.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              className="rounded-none"
                              placeholder="Label"
                            />
                            <Input
                              value={editSrc}
                              onChange={(e) => setEditSrc(e.target.value)}
                              className="rounded-none font-mono text-xs"
                              placeholder="Image URL"
                            />
                            <select
                              value={editGroup}
                              onChange={(e) =>
                                setEditGroup(
                                  e.target.value as MediaItem["group"],
                                )
                              }
                              className="h-9 w-full border border-input bg-transparent px-2 text-sm"
                            >
                              {GROUPS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <select
                              value={editCatalogKey}
                              onChange={(e) => {
                                const v = e.target.value;
                                setEditCatalogKey(v);
                                if (!v) setEditGroup("Gallery");
                                else if (editGroup === "Gallery")
                                  setEditGroup("Website");
                              }}
                              className="h-9 w-full border border-input bg-transparent px-2 text-sm"
                              aria-label="Website place"
                            >
                              {placementOptions.map((o) => (
                                <option
                                  key={o.value || "gallery-edit"}
                                  value={o.value}
                                >
                                  {o.label}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                disabled={busy}
                                onClick={() => void onSaveEdit(item.id)}
                                className="h-9 flex-1 rounded-none bg-[var(--ag-red)] text-white"
                              >
                                Save
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={busy}
                                onClick={() => setEditingId(null)}
                                className="h-9 rounded-none"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-medium text-[var(--ag-ink)]">
                              {item.label}
                            </p>
                            <p
                              className={`text-xs font-semibold ${
                                item.catalogKey
                                  ? "text-[var(--ag-maroon)]"
                                  : "text-amber-800"
                              }`}
                            >
                              Shows on: {websitePlace(item)}
                            </p>
                            <p className="break-all text-xs text-[var(--ag-muted)]">
                              {item.src || "(empty)"}
                              {item.managedFile ? " · upload" : " · site"}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                disabled={busy}
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditLabel(item.label);
                                  setEditGroup(item.group);
                                  setEditSrc(item.src);
                                  setEditCatalogKey(item.catalogKey || "");
                                }}
                                className="h-9 flex-1 rounded-none"
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={busy}
                                onClick={() => void onDelete(item.id)}
                                className="h-9 flex-1 rounded-none border-[var(--ag-red)] text-[var(--ag-red)] hover:bg-[var(--ag-red)] hover:text-white"
                              >
                                Delete
                              </Button>
                            </div>
                          </>
                        )}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
