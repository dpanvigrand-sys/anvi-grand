import { NextResponse } from "next/server";
import { runWithDataToken } from "@/lib/github-data";
import {
  deleteCatalogItem,
  getCatalog,
  updateHotel,
  upsertCatalogItem,
} from "@/lib/store";
import type { Buffet, Facility, HotelInfo, MenuItem, Room, Venue } from "@/lib/types";
import { uid } from "@/lib/format";

export const runtime = "nodejs";

function tokenFrom(req: Request): string | undefined {
  return (
    req.headers.get("x-anvi-data-token")?.trim() ||
    req.headers.get("x-github-token")?.trim() ||
    undefined
  );
}

const LISTS = ["rooms", "venues", "menu", "buffets", "facilities"] as const;
type ListKey = (typeof LISTS)[number];

export async function GET() {
  const catalog = await getCatalog();
  return NextResponse.json({ catalog });
}

export async function POST(req: Request) {
  return runWithDataToken(tokenFrom(req), async () => {
  try {
    const body = await req.json();
    const section = String(body.section || "");
    const action = String(body.action || "upsert");

    if (section === "hotel") {
      const hotel = await updateHotel(body.item as Partial<HotelInfo>);
      return NextResponse.json({ hotel });
    }

    if (!LISTS.includes(section as ListKey)) {
      return NextResponse.json({ error: "Unknown section" }, { status: 400 });
    }
    const key = section as ListKey;

    if (action === "delete") {
      const id = String(body.id || "");
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      const ok = await deleteCatalogItem(key, id);
      if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    const raw = body.item || {};
    if (key === "rooms") {
      const item: Room = {
        id: String(raw.id || uid("room")),
        name: String(raw.name || "Untitled room"),
        tagline: String(raw.tagline || ""),
        description: String(raw.description || ""),
        pricePerNight: Number(raw.pricePerNight) || 0,
        capacity: Number(raw.capacity) || 2,
        amenities: Array.isArray(raw.amenities)
          ? raw.amenities.map(String)
          : String(raw.amenitiesText || "")
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean),
        image: String(raw.image || ""),
        available: raw.available !== false && raw.available !== "false",
      };
      return NextResponse.json({ item: await upsertCatalogItem("rooms", item) });
    }

    if (key === "menu") {
      const item: MenuItem = {
        id: String(raw.id || uid("dish")),
        name: String(raw.name || "Untitled dish"),
        category: String(raw.category || "Main"),
        description: String(raw.description || ""),
        price: Number(raw.price) || 0,
        veg: Boolean(raw.veg === true || raw.veg === "true"),
        image: String(raw.image || ""),
      };
      return NextResponse.json({ item: await upsertCatalogItem("menu", item) });
    }

    if (key === "venues") {
      const item: Venue = {
        id: String(raw.id || uid("venue")),
        type: raw.type === "party-hall" ? "party-hall" : "banquet",
        name: String(raw.name || "Untitled venue"),
        tagline: String(raw.tagline || ""),
        description: String(raw.description || ""),
        capacity: Number(raw.capacity) || 50,
        priceFrom: Number(raw.priceFrom) || 0,
        image: String(raw.image || ""),
        amenities: Array.isArray(raw.amenities)
          ? raw.amenities.map(String)
          : String(raw.amenitiesText || "")
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean),
      };
      return NextResponse.json({ item: await upsertCatalogItem("venues", item) });
    }

    if (key === "facilities") {
      const item: Facility = {
        id: String(raw.id || uid("fac")),
        name: String(raw.name || "Untitled facility"),
        description: String(raw.description || ""),
        image: String(raw.image || ""),
      };
      return NextResponse.json({
        item: await upsertCatalogItem("facilities", item),
      });
    }

    if (key === "buffets") {
      const item: Buffet = {
        id: String(raw.id || uid("buffet")),
        name: String(raw.name || "Untitled buffet"),
        description: String(raw.description || ""),
        pricePerPerson: Number(raw.pricePerPerson) || 0,
        meal: String(raw.meal || "Dinner"),
        image: String(raw.image || ""),
      };
      return NextResponse.json({
        item: await upsertCatalogItem("buffets", item),
      });
    }

    return NextResponse.json({ error: "Unhandled" }, { status: 400 });
  } catch (err) {
    console.error("catalog cms failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 500 },
    );
  }
  });
}
