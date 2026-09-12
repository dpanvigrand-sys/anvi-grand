import type { MediaItem } from "@/lib/media-types";

/** Human-readable public page mapping for Admin Photos (client-safe). */
export function websitePlace(
  item: Pick<MediaItem, "catalogKey" | "slot" | "group" | "label">,
): string {
  const key = item.catalogKey || "";
  if (key === "hotel:hero" || item.slot === "hero") {
    return "Home hero (/)";
  }
  if (key.startsWith("room:")) {
    return `Rooms · ${item.label} (/rooms)`;
  }
  if (key.startsWith("venue:")) {
    return `Banquet / party hall · ${item.label} (/banquet, /party-hall)`;
  }
  if (key.startsWith("menu:")) {
    return `CHIGURU menu · ${item.label} (/food)`;
  }
  if (key.startsWith("buffet:")) {
    return `Buffet · ${item.label} (/buffet)`;
  }
  if (key.startsWith("facility:")) {
    return `Facilities · ${item.label} (/facilities)`;
  }
  if (item.group === "Gallery" || item.slot === "gallery") {
    return "Gallery only (/gallery)";
  }
  return `${item.group} · guest site`;
}
