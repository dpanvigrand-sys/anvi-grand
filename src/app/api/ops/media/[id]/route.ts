import { NextResponse } from "next/server";
import { deleteMedia, updateMedia, type MediaItem } from "@/lib/media";

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

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const patch: Partial<Pick<MediaItem, "label" | "group" | "slot">> = {};
    if (typeof body.label === "string") patch.label = body.label;
    if (GROUPS.includes(body.group)) patch.group = body.group;
    if (body.slot === "" || body.slot === null) patch.slot = undefined;
    else if (SLOTS.includes(body.slot)) patch.slot = body.slot;

    const item = await updateMedia(id, patch);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (err) {
    console.error("media update failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const ok = await deleteMedia(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("media delete failed", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
