import { existsSync } from "fs";
import path from "path";

/** Sensible stock photos so home banquet cards never render empty/broken. */
export const DEFAULT_VENUE_IMAGES: Record<string, string> = {
  "royal-grand-ballroom":
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80",
  "imperial-ruby-mini":
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1600&q=80",
};

const FALLBACK_BANQUET =
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80";

/** True when an /uploads/… path has a file on disk under public/. */
export function uploadFileExists(src: string): boolean {
  if (!src.startsWith("/uploads/")) return true;
  const disk = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  return existsSync(disk);
}

/**
 * Prefer catalog image when present and (for uploads) on disk.
 * Otherwise fall back to the venue’s default stock photo.
 */
export function resolveVenueImage(
  venueId: string,
  image: string | undefined | null,
): string {
  const src = (image || "").trim();
  if (src && uploadFileExists(src)) return src;
  return DEFAULT_VENUE_IMAGES[venueId] || FALLBACK_BANQUET;
}
