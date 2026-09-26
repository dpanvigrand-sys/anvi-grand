import { promises as fs } from "fs";
import path from "path";
import { uid } from "./format";
import type { Catalog } from "./types";
import type { MediaItem, MediaStore } from "./media-types";
import { resolveVenueImage } from "./default-images";

export type { MediaItem, MediaStore } from "./media-types";
export { websitePlace } from "./media-place";

const dataDir = path.join(process.cwd(), "data");
const uploadsDir = path.join(process.cwd(), "public", "uploads");
const mediaFile = "media.json";

const empty: MediaStore = { items: [], removedIds: [] };

async function readStore(): Promise<MediaStore> {
  try {
    const raw = JSON.parse(
      await fs.readFile(path.join(dataDir, mediaFile), "utf8"),
    ) as MediaStore & { items: Array<MediaItem & { managedFile?: boolean }> };
    const items = (raw.items || []).map((i) => {
      const legacy = i as MediaItem & { managedFile?: boolean };
      return {
        ...i,
        managedFile:
          typeof i.managedFile === "boolean"
            ? i.managedFile
            : Boolean(legacy.managedFile),
      };
    });
    return {
      items,
      removedIds: raw.removedIds || [],
    };
  } catch {
    return { ...empty, items: [], removedIds: [] };
  }
}

async function writeStore(store: MediaStore): Promise<void> {
  const body = JSON.stringify(store, null, 2);
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(path.join(dataDir, mediaFile), body, "utf8");
    return;
  } catch (err) {
    const { isReadonlyFsError, upsertGithubFile } = await import("./github-data");
    if (!isReadonlyFsError(err)) throw err;
    await upsertGithubFile(
      `data/${mediaFile}`,
      body,
      "chore(cms): update media library",
    );
  }
}

/**
 * Write an image URL into the matching catalog field so public pages update live.
 * catalogKey examples: hotel:hero | room:{id} | venue:{id} | menu:{id} | buffet:{id} | facility:{id}
 */
export async function writeCatalogImage(
  catalogKey: string,
  src: string,
): Promise<boolean> {
  const { getCatalog, saveCatalog, updateHotel } = await import("./store");
  const [kind, id] = catalogKey.split(":");
  if (!kind) return false;

  if (kind === "hotel" && id === "hero") {
    await updateHotel({ heroImage: src });
    return true;
  }

  const catalog = await getCatalog();
  const listKey =
    kind === "room"
      ? "rooms"
      : kind === "venue"
        ? "venues"
        : kind === "menu"
          ? "menu"
          : kind === "buffet"
            ? "buffets"
            : kind === "facility"
              ? "facilities"
              : null;
  if (!listKey || !id) return false;
  const list = catalog[listKey] as Array<{ id: string; image: string }>;
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return false;
  // Clearing a venue image restores the stock default so home cards never break
  let nextSrc = src;
  if (!nextSrc.trim() && kind === "venue") {
    const { DEFAULT_VENUE_IMAGES } = await import("./default-images");
    nextSrc = DEFAULT_VENUE_IMAGES[id] || nextSrc;
  }
  list[idx] = { ...list[idx], image: nextSrc };
  await saveCatalog(catalog);
  return true;
}

/** Inventory every public-site image from catalog + local entrance. One row per placement (no src dedupe). */
export function inventorySiteImages(catalog: Catalog): MediaItem[] {
  const now = new Date().toISOString();
  const out: MediaItem[] = [];

  const heroSrc =
    catalog.hotel.heroImage?.trim() || "/images/anvi-entrance.jpg";
  out.push({
    id: "site-hero-entrance",
    src: heroSrc,
    label: `Night entrance · ${catalog.hotel.name}`,
    group: "Website",
    slot: "hero",
    createdAt: now,
    managedFile: false,
    catalogKey: "hotel:hero",
  });

  for (const room of catalog.rooms || []) {
    if (!room.image) continue;
    out.push({
      id: `site-room-${room.id}`,
      src: room.image,
      label: room.name,
      group: "Rooms",
      slot: "gallery",
      createdAt: now,
      managedFile: false,
      catalogKey: `room:${room.id}`,
    });
  }

  for (const venue of catalog.venues || []) {
    const src = resolveVenueImage(venue.id, venue.image);
    out.push({
      id: `site-venue-${venue.id}`,
      src,
      label: venue.name,
      group: "Venues",
      slot: "gallery",
      createdAt: now,
      managedFile: false,
      catalogKey: `venue:${venue.id}`,
    });
  }

  for (const dish of catalog.menu || []) {
    if (!dish.image) continue;
    out.push({
      id: `site-food-${dish.id}`,
      src: dish.image,
      label: dish.name,
      group: "Food",
      slot: "gallery",
      createdAt: now,
      managedFile: false,
      catalogKey: `menu:${dish.id}`,
    });
  }

  for (const buffet of catalog.buffets || []) {
    if (!buffet.image) continue;
    out.push({
      id: `site-buffet-${buffet.id}`,
      src: buffet.image,
      label: buffet.name,
      group: "Food",
      slot: "gallery",
      createdAt: now,
      managedFile: false,
      catalogKey: `buffet:${buffet.id}`,
    });
  }

  for (const facility of catalog.facilities || []) {
    if (!facility.image) continue;
    out.push({
      id: `site-facility-${facility.id}`,
      src: facility.image,
      label: facility.name,
      group: "Facilities",
      slot: "gallery",
      createdAt: now,
      managedFile: false,
      catalogKey: `facility:${facility.id}`,
    });
  }

  return out;
}

/**
 * Merge catalog / site images into the photo library.
 * Preserves staff uploads. Does not restore ids in removedIds unless force.
 */
export async function syncSiteMedia(opts?: {
  force?: boolean;
}): Promise<{ items: MediaItem[]; added: number }> {
  const { getCatalog } = await import("./store");
  const catalog = await getCatalog();
  const siteItems = inventorySiteImages(catalog);
  const store = await readStore();
  const removed = new Set(opts?.force ? [] : store.removedIds || []);
  const byId = new Map(store.items.map((i) => [i.id, i]));

  let added = 0;
  for (const site of siteItems) {
    if (removed.has(site.id)) continue;
    const existing = byId.get(site.id);
    if (existing) {
      if (!existing.managedFile) {
        existing.label = site.label;
        existing.group = site.group;
        if (site.slot === "hero") existing.slot = "hero";
        existing.catalogKey = site.catalogKey;
        existing.src = site.src;
        byId.set(existing.id, existing);
      }
      continue;
    }
    byId.set(site.id, site);
    added += 1;
  }

  const siteIds = new Set(siteItems.map((i) => i.id));
  const merged = [...byId.values()].filter((item) => {
    if (item.managedFile) return true;
    if (!item.id.startsWith("site-")) return true;
    return siteIds.has(item.id) && !removed.has(item.id);
  });

  const groupOrder = [
    "Website",
    "Rooms",
    "Venues",
    "Food",
    "Facilities",
    "Gallery",
  ] as const;
  merged.sort((a, b) => {
    const ga = groupOrder.indexOf(a.group as (typeof groupOrder)[number]);
    const gb = groupOrder.indexOf(b.group as (typeof groupOrder)[number]);
    if (ga !== gb) return (ga === -1 ? 99 : ga) - (gb === -1 ? 99 : gb);
    if (a.managedFile !== b.managedFile) return a.managedFile ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const next: MediaStore = {
    items: merged,
    removedIds: opts?.force ? [] : store.removedIds || [],
  };
  await writeStore(next);
  return { items: next.items, added };
}

export async function getMedia(opts?: {
  sync?: boolean;
}): Promise<MediaItem[]> {
  const { unstable_noStore: noStore } = await import("next/cache");
  noStore();
  if (opts?.sync) {
    try {
      const { items } = await syncSiteMedia();
      return items;
    } catch (err) {
      console.warn("[media] syncSiteMedia failed; falling back to store:", err);
      return (await readStore()).items;
    }
  }
  return (await readStore()).items;
}

export async function getMediaBySlot(
  slot: MediaItem["slot"],
): Promise<MediaItem | undefined> {
  const items = await getMedia();
  return items.find((i) => i.slot === slot);
}

async function persistUploadedFile(fileName: string, bytes: Buffer): Promise<{ id: string; src: string; diskName: string }> {
  const safe = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
  const id = uid("media");
  const diskName = `${id}-${safe}`;
  const rel = `public/uploads/${diskName}`;
  const src = `/uploads/${diskName}`;
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, diskName), bytes);
    return { id, src, diskName };
  } catch (err) {
    const { isReadonlyFsError, upsertGithubFile } = await import("./github-data");
    if (!isReadonlyFsError(err)) throw err;
    await upsertGithubFile(rel, bytes, `chore(cms): upload ${diskName}`);
    return { id, src, diskName };
  }
}

export async function addMedia(input: {
  label: string;
  group: MediaItem["group"];
  slot?: MediaItem["slot"];
  /** Optional catalog placement to write through (e.g. hotel:hero, room:id) */
  catalogKey?: string;
  fileName?: string;
  bytes?: Buffer;
  /** URL-only add (no file upload) */
  src?: string;
}): Promise<MediaItem> {
  let src = (input.src || "").trim();
  let managedFile = false;
  let id = uid("media");

  if (input.bytes && input.fileName) {
    const up = await persistUploadedFile(input.fileName, input.bytes);
    src = up.src;
    id = up.id;
    managedFile = true;
  }

  if (!src) {
    throw new Error("Image file or URL is required");
  }

  // If assigning to an existing catalog placement, upsert that site-* row instead
  const catalogKey = input.catalogKey?.trim() || undefined;
  if (catalogKey) {
    await writeCatalogImage(catalogKey, src);
  } else if (input.slot === "hero") {
    await writeCatalogImage("hotel:hero", src);
  }

  const item: MediaItem = {
    id: catalogKey
      ? catalogKey === "hotel:hero"
        ? "site-hero-entrance"
        : `site-${catalogKey.replace(":", "-")}`
      : id,
    src,
    label: input.label.trim() || "Photo",
    group: input.group,
    slot: input.slot || (catalogKey === "hotel:hero" ? "hero" : undefined),
    createdAt: new Date().toISOString(),
    managedFile,
    catalogKey,
  };

  const store = await readStore();

  if (item.slot === "hero" || item.slot === "room" || item.slot === "food") {
    store.items = store.items.map((i) =>
      i.slot === item.slot && i.id !== item.id ? { ...i, slot: undefined } : i,
    );
  }

  // Replace existing row for same catalog placement
  if (catalogKey) {
    store.items = store.items.filter(
      (i) => i.catalogKey !== catalogKey && i.id !== item.id,
    );
  }

  store.items.unshift(item);
  // Clear removed flag if re-adding a site id
  if (store.removedIds?.length) {
    store.removedIds = store.removedIds.filter((rid) => rid !== item.id);
  }
  await writeStore(store);
  return item;
}

export async function updateMedia(
  id: string,
  patch: Partial<
    Pick<MediaItem, "label" | "group" | "slot" | "src" | "catalogKey">
  > & { fileName?: string; bytes?: Buffer },
): Promise<MediaItem | null> {
  const store = await readStore();
  const existing = store.items.find((i) => i.id === id);
  if (!existing) return null;

  const next: MediaItem = { ...existing };
  if (typeof patch.label === "string") next.label = patch.label.trim() || next.label;
  if (patch.group) next.group = patch.group;

  const uploadedBytes = patch.bytes;
  const uploadedName = patch.fileName;
  if (uploadedBytes && uploadedName) {
    const up = await persistUploadedFile(uploadedName, uploadedBytes);
    next.src = up.src;
    next.managedFile = true;
  } else if (typeof patch.src === "string" && patch.src.trim()) {
    next.src = patch.src.trim();
  }
  if (patch.slot === undefined && "slot" in patch) {
    next.slot = undefined;
  } else if (patch.slot) {
    next.slot = patch.slot;
  }

  const catalogKeyChanged = "catalogKey" in patch;
  if (catalogKeyChanged) {
    const raw =
      typeof patch.catalogKey === "string" ? patch.catalogKey.trim() : "";
    next.catalogKey = raw || undefined;
    if (next.catalogKey === "hotel:hero") {
      next.slot = "hero";
      next.id = "site-hero-entrance";
      if (next.group === "Gallery") next.group = "Website";
    } else if (next.catalogKey) {
      next.id = `site-${next.catalogKey.replace(":", "-")}`;
      if (next.catalogKey.startsWith("room:")) {
        next.slot = "room";
        if (next.group === "Gallery") next.group = "Rooms";
      } else if (
        next.catalogKey.startsWith("menu:") ||
        next.catalogKey.startsWith("buffet:")
      ) {
        next.slot = "food";
        if (next.group === "Gallery") next.group = "Food";
      } else if (next.catalogKey.startsWith("venue:")) {
        next.slot = "gallery";
        if (next.group === "Gallery") next.group = "Venues";
      } else if (next.catalogKey.startsWith("facility:")) {
        next.slot = "gallery";
        if (next.group === "Gallery") next.group = "Facilities";
      } else {
        next.slot = next.slot || "gallery";
      }
    }
  }

  // Drop the edited row + any other row for the same placement, then insert `next`
  store.items = store.items.filter(
    (i) =>
      i.id !== id &&
      i.id !== next.id &&
      (!next.catalogKey || i.catalogKey !== next.catalogKey),
  );

  if (next.slot === "hero" || next.slot === "room" || next.slot === "food") {
    store.items = store.items.map((i) =>
      i.slot === next.slot ? { ...i, slot: undefined } : i,
    );
  }

  store.items.unshift(next);
  await writeStore(store);

  // Write-through when place is set/changed or src changes for a placed photo
  const srcChanged =
    Boolean(uploadedBytes && uploadedName) ||
    (typeof patch.src === "string" && Boolean(patch.src.trim()));
  if (next.catalogKey && (catalogKeyChanged || srcChanged)) {
    await writeCatalogImage(next.catalogKey, next.src);
  } else if (next.slot === "hero" && (srcChanged || patch.slot === "hero")) {
    await writeCatalogImage("hotel:hero", next.src);
  }

  return next;
}

export async function deleteMedia(id: string): Promise<boolean> {
  const store = await readStore();
  const item = store.items.find((i) => i.id === id);
  if (!item) return false;

  store.items = store.items.filter((i) => i.id !== id);
  if (item.id.startsWith("site-") || item.catalogKey) {
    const removed = new Set(store.removedIds || []);
    removed.add(item.id);
    store.removedIds = [...removed];
  }
  await writeStore(store);

  if (item.managedFile && item.src.startsWith("/uploads/")) {
    const disk = path.join(process.cwd(), "public", item.src.replace(/^\//, ""));
    try {
      await fs.unlink(disk);
    } catch {
      /* ignore */
    }
  }

  // Clearing a catalog placement: set empty image so guest pages stop showing it
  if (item.catalogKey) {
    try {
      await writeCatalogImage(item.catalogKey, "");
    } catch {
      /* ignore */
    }
  }

  return true;
}
