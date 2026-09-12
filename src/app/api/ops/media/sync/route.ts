import { NextResponse } from "next/server";
import { syncSiteMedia } from "@/lib/media";

export const runtime = "nodejs";

/** POST /api/ops/media/sync — pull every public-site image into the photo library. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const force = Boolean(body?.force);
    const { items, added } = await syncSiteMedia({ force });
    return NextResponse.json({
      ok: true,
      added,
      count: items.length,
      items,
    });
  } catch (err) {
    console.error("media sync failed", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
