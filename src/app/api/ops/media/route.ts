import { NextResponse } from "next/server";
import { addMedia, getMedia, type MediaItem } from "@/lib/media";

export const runtime = "nodejs";

const GROUPS: MediaItem["group"][] = [
  "Gallery",
  "Website",
  "Rooms",
  "Food",
  "Venues",
  "Facilities",
];

const SLOTS: Array<NonNullable<MediaItem["slot"]>> = [
  "hero",
  "room",
  "food",
  "gallery",
];

export async function GET() {
  const items = await getMedia();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const label = String(form.get("label") || "");
    const groupRaw = String(form.get("group") || "Gallery");
    const slotRaw = String(form.get("slot") || "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }
    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be 6MB or smaller" },
        { status: 400 },
      );
    }
    const type = file.type || "";
    if (!type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed" },
        { status: 400 },
      );
    }

    const group = GROUPS.includes(groupRaw as MediaItem["group"])
      ? (groupRaw as MediaItem["group"])
      : "Gallery";
    const slot = SLOTS.includes(slotRaw as NonNullable<MediaItem["slot"]>)
      ? (slotRaw as NonNullable<MediaItem["slot"]>)
      : undefined;

    const bytes = Buffer.from(await file.arrayBuffer());
    const item = await addMedia({
      label: label || file.name,
      group,
      slot,
      fileName: file.name || "photo.jpg",
      bytes,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("media upload failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
