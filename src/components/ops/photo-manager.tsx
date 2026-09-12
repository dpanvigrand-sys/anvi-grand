"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MediaItem } from "@/lib/media";
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
  const [filter, setFilter] = useState<string>("All");
  const [label, setLabel] = useState("");
  const [group, setGroup] = useState<MediaItem["group"]>("Gallery");
  const [slot, setSlot] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editGroup, setEditGroup] = useState<MediaItem["group"]>("Gallery");

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

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose an image file first.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("label", label);
      fd.set("group", group);
      if (slot) fd.set("slot", slot);
      const res = await fetch("/api/ops/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setItems((prev) => [data.item as MediaItem, ...prev]);
      setLabel("");
      setFile(null);
      setMessage("Photo added to the library.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
    if (!window.confirm("Delete this photo from the managed library?")) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/ops/media/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setItems((prev) => prev.filter((i) => i.id !== id));
      setMessage("Photo deleted.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveEdit(id: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/ops/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: editLabel, group: editGroup }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setItems((prev) =>
        prev.map((i) => (i.id === id ? (data.item as MediaItem) : i)),
      );
      setEditingId(null);
      setMessage("Photo updated.");
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
        <p className="text-sm text-[var(--ag-muted)]">
          Library shows every image used on the public site (hero, rooms,
          CHIGURU food, venues, facilities) plus staff uploads.
        </p>
        <Button
          type="button"
          disabled={busy}
          onClick={() => onSync(false)}
          className="h-10 rounded-none bg-[var(--ag-maroon)] text-white hover:bg-[var(--ag-red)]"
        >
          {busy ? "Working…" : "Sync from website"}
        </Button>
      </div>

      <form
        onSubmit={onUpload}
        className="grid gap-4 border border-[var(--ag-line)] bg-white p-5 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
            Add photo
          </p>
          <p className="mt-1 text-sm text-[var(--ag-muted)]">
            Upload JPG/PNG/WebP (max 6MB). Files save under{" "}
            <code>/public/uploads</code>.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="photo-file">Image file</Label>
          <Input
            id="photo-file"
            type="file"
            accept="image/*"
            className="rounded-none"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
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
        <div className="grid gap-2">
          <Label htmlFor="photo-slot">Website slot (optional)</Label>
          <select
            id="photo-slot"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="h-9 border border-input bg-transparent px-2 text-sm"
          >
            <option value="">None (gallery only)</option>
            <option value="hero">Hero / home entrance</option>
            <option value="room">Featured room teaser</option>
            <option value="food">Featured food teaser</option>
            <option value="gallery">Gallery highlight</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <Button
            type="submit"
            disabled={busy}
            className="h-11 rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]"
          >
            {busy ? "Working…" : "Upload photo"}
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
            No photos yet. Click <strong>Sync from website</strong> to pull
            rooms, food, venues, and facilities, or upload above.
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.src}
                        alt={item.label}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <figcaption className="space-y-2 p-3">
                        {editingId === item.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              className="rounded-none"
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
                                onClick={() => onSaveEdit(item.id)}
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
                            <p className="break-all text-xs text-[var(--ag-muted)]">
                              {item.src}
                              {item.slot ? ` · slot:${item.slot}` : ""}
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
                                }}
                                className="h-9 flex-1 rounded-none"
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={busy}
                                onClick={() => onDelete(item.id)}
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
