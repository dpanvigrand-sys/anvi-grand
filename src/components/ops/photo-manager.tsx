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

export function PhotoManager({ initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState("All");
  const [label, setLabel] = useState("");
  const [group, setGroup] = useState<MediaItem["group"]>("Gallery");
  const [slot, setSlot] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [catalogKey, setCatalogKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editGroup, setEditGroup] = useState<MediaItem["group"]>("Gallery");
  const [editSrc, setEditSrc] = useState("");

  const placementOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: "", label: "Gallery only (extra photo)" },
      { value: "hotel:hero", label: "Home hero (/)" },
    ];
    for (const item of items) {
      if (!item.catalogKey || item.catalogKey === "hotel:hero") continue;
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
      setCatalogKey("");
      setSlot("");
      setMessage(
        saved.catalogKey
          ? `Saved — live on ${websitePlace(saved)}.`
          : "Photo added to the library / gallery.",
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      const saved = data.item as MediaItem;
      setItems((prev) => prev.map((i) => (i.id === id ? saved : i)));
      setEditingId(null);
      setMessage(`Updated — live on ${websitePlace(saved)}.`);
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
          Every public photo place is listed below (hero, rooms, CHIGURU food,
          banquet/venues, facilities, gallery). Edit changes the guest page
          immediately.
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
            Upload a file <em>or</em> paste an image URL. Assign a website place
            to replace that slot on the public site.
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
            onChange={(e) => setGroup(e.target.value as MediaItem["group"])}
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
          <Label htmlFor="photo-place">Website place</Label>
          <select
            id="photo-place"
            value={catalogKey}
            onChange={(e) => {
              const v = e.target.value;
              setCatalogKey(v);
              if (v === "hotel:hero") setSlot("hero");
              else if (v.startsWith("room:")) setSlot("room");
              else if (v.startsWith("menu:") || v.startsWith("buffet:"))
                setSlot("food");
              else if (!v) setSlot("");
              else setSlot("gallery");
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
                            <p className="text-xs font-semibold text-[var(--ag-maroon)]">
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
