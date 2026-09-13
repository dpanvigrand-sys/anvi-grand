import { NextResponse } from "next/server";
import {
  addLinenQueueItem,
  updateHousekeepingRoom,
  updateLinenQueueItem,
} from "@/lib/store";
import type { HousekeepingRoomStatus, LinenQueueStatus } from "@/lib/types";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (body.kind === "room") {
      const result = await updateHousekeepingRoom(
        String(body.id || ""),
        String(body.status || "") as HousekeepingRoomStatus,
        body.notes ? String(body.notes) : undefined,
      );
      if (result.error || !result.room) {
        return NextResponse.json({ error: result.error || "Failed" }, { status: 400 });
      }
      return NextResponse.json({ room: result.room });
    }
    if (body.kind === "linen") {
      const result = await updateLinenQueueItem(
        String(body.id || ""),
        String(body.status || "") as LinenQueueStatus,
      );
      if (result.error || !result.item) {
        return NextResponse.json({ error: result.error || "Failed" }, { status: 400 });
      }
      return NextResponse.json({ item: result.item });
    }
    return NextResponse.json({ error: "Unknown kind." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await addLinenQueueItem({
      item: String(body.item || ""),
      qty: Number(body.qty) || 0,
      unit: body.unit ? String(body.unit) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
    });
    if (result.error || !result.item) {
      return NextResponse.json({ error: result.error || "Failed" }, { status: 400 });
    }
    return NextResponse.json({ item: result.item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
