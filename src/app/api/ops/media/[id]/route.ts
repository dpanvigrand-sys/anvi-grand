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

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_EXT = /\.(jpe?g|png|webp|gif)$/i;
const MAX_BYTES = 6 * 1024 * 1024;

type Ctx = { params: Promise<{ id: string }> };

function validateUploadFile(file: File): string | null {
  if (file.size <= 0) return "Selected file is empty";
  if (file.size > MAX_BYTES) return "Image must be 6MB or smaller";
  const type = file.type || "";
  const mimeOk = !type || ALLOWED_MIME.has(type);
  const extOk = ALLOWED_EXT.test(file.name || "");
  if (!mimeOk && !extOk) {
    return "Only JPG, PNG, WebP, or GIF images are allowed";
  }
  if (type && !type.startsWith("image/")) {
    return "Only image uploads are allowed";
  }
  return null;
}

function parseGroup(raw: string): MediaItem["group"] {
  return GROUPS.includes(raw as MediaItem["group"])
    ? (raw as MediaItem["group"])
    : "Gallery";
}

function parseSlot(
  raw: string,
): NonNullable<MediaItem["slot"]> | undefined | "" {
  if (raw === "" || raw === "null") return "";
  if (SLOTS.includes(raw as NonNullable<MediaItem["slot"]>)) {
    return raw as NonNullable<MediaItem["slot"]>;
  }
  return undefined;
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const contentType = req.headers.get("content-type") || "";

    const patch: Partial<
      Pick<MediaItem, "label" | "group" | "slot" | "src" | "catalogKey">
    > & { fileName?: string; bytes?: Buffer } = {};

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const hasFile = file instanceof File && file.size > 0;
      if (hasFile) {
        const problem = validateUploadFile(file);
        if (problem) {
          return NextResponse.json({ error: problem }, { status: 400 });
        }
        patch.fileName = file.name || "photo.jpg";
        patch.bytes = Buffer.from(await file.arrayBuffer());
      }
      const label = form.get("label");
      if (typeof label === "string") patch.label = label;
      const groupRaw = form.get("group");
      if (typeof groupRaw === "string" && groupRaw) {
        patch.group = parseGroup(groupRaw);
      }
      const srcRaw = form.get("src");
      if (typeof srcRaw === "string" && srcRaw.trim()) {
        patch.src = srcRaw.trim();
      }
      if (form.has("catalogKey")) {
        const ck = form.get("catalogKey");
        patch.catalogKey = typeof ck === "string" ? ck.trim() : "";
      }
      if (form.has("slot")) {
        const slotRaw = String(form.get("slot") || "");
        const slot = parseSlot(slotRaw);
        if (slot === "") patch.slot = undefined;
        else if (slot) patch.slot = slot;
      }
      if (!hasFile && !patch.src && !("label" in patch) && !("group" in patch) && !("catalogKey" in patch)) {
        return NextResponse.json(
          { error: "Nothing to update" },
          { status: 400 },
        );
      }
    } else {
      const body = await req.json();
      if (typeof body.label === "string") patch.label = body.label;
      if (typeof body.src === "string") patch.src = body.src;
      if (GROUPS.includes(body.group)) patch.group = body.group;
      if (body.slot === "" || body.slot === null) patch.slot = undefined;
      else if (SLOTS.includes(body.slot)) patch.slot = body.slot;
      if ("catalogKey" in body) {
        patch.catalogKey =
          typeof body.catalogKey === "string" ? body.catalogKey.trim() : "";
      }
    }

    const item = await updateMedia(id, patch);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (err) {
    console.error("media update failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 },
    );
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
