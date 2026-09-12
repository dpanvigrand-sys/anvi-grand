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
