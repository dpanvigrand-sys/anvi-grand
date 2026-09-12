import { promises as fs } from "fs";
import path from "path";
import { uid } from "./format";
import type { Catalog } from "./types";

export type MediaItem = {
  id: string;
  src: string;
  label: string;
  group: "Gallery" | "Website" | "Rooms" | "Food" | "Venues" | "Facilities";
  /** Optional website slot: hero | room | food | gallery */
  slot?: "hero" | "room" | "food" | "gallery";
  createdAt: string;
  /** true when file lives under public/uploads and can be deleted from disk */
  managedFile: boolean;
  /** Set when row was seeded from catalog / site inventory */
  catalogKey?: string;
};

export type MediaStore = {
  items: MediaItem[];
  /** Catalog-synced ids the staff deleted — sync will not restore these */
  removedIds?: string[];
};

const dataDir = path.join(process.cwd(), "data");
const uploadsDir = path.join(process.cwd(), "public", "uploads");
const mediaFile = "media.json";

const empty: MediaStore = { items: [], removedIds: [] };

async function readStore(): Promise<MediaStore> {
  try {
    const raw = JSON.parse(
      await fs.readFile(path.join(dataDir, mediaFile), "utf8"),
    ) as MediaStore & { items: Array<MediaItem & { managedFile?: boolean }> };
    // Normalize legacy managedFile key if present
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
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(
    path.join(dataDir, mediaFile),
    JSON.stringify(store, null, 2),
    "utf8",
  );
}

/** Inventory every public-site image from catalog + local entrance. */
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
    if (!venue.image) continue;
    out.push({
      id: `site-venue-${venue.id}`,
      src: venue.image,
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

  // Dedupe by src, keep first (hero wins over later dups)
  const seen = new Set<string>();
  return out.filter((item) => {
    if (seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
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
  const bySrc = new Map(store.items.map((i) => [i.src, i]));

  let added = 0;
  for (const site of siteItems) {
    if (removed.has(site.id)) continue;
    const existing = byId.get(site.id) || bySrc.get(site.src);
    if (existing) {
      // Refresh label/group/slot for catalog-backed rows; never overwrite uploads
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
    bySrc.set(site.src, site);
    added += 1;
  }

  // Keep uploads + catalog rows; drop stale non-managed site-* ids no longer in inventory
  // unless they were user uploads
  const siteIds = new Set(siteItems.map((i) => i.id));
  const merged = [...byId.values()].filter((item) => {
    if (item.managedFile) return true;
    if (!item.id.startsWith("site-")) return true;
    return siteIds.has(item.id) && !removed.has(item.id);
  });

  // Stable-ish order: Website, Rooms, Venues, Food, Facilities, Gallery, then uploads first within group by createdAt desc
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
  if (opts?.sync) {
    const { items } = await syncSiteMedia();
    return items;
  }
  return (await readStore()).items;
}

export async function getMediaBySlot(
  slot: MediaItem["slot"],
): Promise<MediaItem | undefined> {
  const items = await getMedia();
  return items.find((i) => i.slot === slot);
}

export async function addMedia(input: {
  label: string;
  group: MediaItem["group"];
  slot?: MediaItem["slot"];
  fileName: string;
  bytes: Buffer;
}): Promise<MediaItem> {
  await fs.mkdir(uploadsDir, { recursive: true });
  const safe = input.fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
  const id = uid("media");
  const diskName = `${id}-${safe}`;
  const diskPath = path.join(uploadsDir, diskName);
  await fs.writeFile(diskPath, input.bytes);

  const item: MediaItem = {
    id,
    src: `/uploads/${diskName}`,
    label: input.label.trim() || safe,
    group: input.group,
    slot: input.slot,
    createdAt: new Date().toISOString(),
    managedFile: true,
  };

  const store = await readStore();
  if (item.slot === "hero" || item.slot === "room" || item.slot === "food") {
    store.items = store.items.map((i) =>
      i.slot === item.slot ? { ...i, slot: undefined } : i,
    );
  }
  store.items.unshift(item);
  await writeStore(store);

  if (item.slot === "hero") {
    try {
      const { updateHotel } = await import("./store");
      await updateHotel({ heroImage: item.src });
    } catch {
      /* ignore */
    }
  }

  return item;
}

export async function updateMedia(
  id: string,
  patch: Partial<Pick<MediaItem, "label" | "group" | "slot">>,
): Promise<MediaItem | null> {
  const store = await readStore();
  const idx = store.items.findIndex((i) => i.id === id);
  if (idx < 0) return null;

  const next = { ...store.items[idx] };
  if (typeof patch.label === "string") next.label = patch.label.trim() || next.label;
  if (patch.group) next.group = patch.group;
  if (patch.slot === undefined && "slot" in patch) {
    next.slot = undefined;
  } else if (patch.slot) {
    next.slot = patch.slot;
  }

  if (next.slot === "hero" || next.slot === "room" || next.slot === "food") {
    store.items = store.items.map((i, j) =>
      j !== idx && i.slot === next.slot ? { ...i, slot: undefined } : i,
    );
  }

  store.items[idx] = next;
  await writeStore(store);

  if (next.slot === "hero") {
    try {
      const { updateHotel } = await import("./store");
      await updateHotel({ heroImage: next.src });
    } catch {
      /* ignore */
    }
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
  return true;
}
