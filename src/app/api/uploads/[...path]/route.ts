import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadsRoot = path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

type Ctx = { params: Promise<{ path: string[] }> };

/** Serve staff uploads from disk so new files work without restarting `next start`. */
export async function GET(_req: Request, ctx: Ctx) {
  const parts = (await ctx.params).path || [];
  if (parts.length !== 1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const name = parts[0];
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(uploadsRoot, name);
  if (!filePath.startsWith(uploadsRoot)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const bytes = await fs.readFile(filePath);
    const ext = path.extname(name).toLowerCase();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Content-Length": String(bytes.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
