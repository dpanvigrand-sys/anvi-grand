import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function mtime(p: string): Promise<number> {
  try {
    const s = await fs.stat(p);
    return Math.floor(s.mtimeMs);
  } catch {
    return 0;
  }
}

async function dirStamp(dir: string): Promise<number> {
  try {
    const names = await fs.readdir(dir);
    let max = 0;
    for (const name of names) {
      const t = await mtime(path.join(dir, name));
      if (t > max) max = t;
    }
    return max;
  } catch {
    return 0;
  }
}

/** Lightweight stamp so open tabs auto-refresh when CMS/data/uploads change. */
export async function GET() {
  const root = process.cwd();
  const parts = await Promise.all([
    mtime(path.join(root, "data", "catalog.json")),
    mtime(path.join(root, "data", "media.json")),
    mtime(path.join(root, "data", "ops.json")),
    dirStamp(path.join(root, "public", "uploads")),
    mtime(path.join(root, ".next", "BUILD_ID")),
  ]);
  const stamp = String(Math.max(...parts, 0));
  return NextResponse.json(
    { stamp },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
      },
    },
  );
}
