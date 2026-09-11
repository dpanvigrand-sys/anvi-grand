import { NextResponse } from "next/server";
import { createFoodOrder, getOps } from "@/lib/store";

export async function GET() {
  const ops = await getOps();
  return NextResponse.json({ orders: ops.foodOrders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items)
      ? body.items.map((i: { menuId?: string; qty?: number }) => ({
          menuId: String(i.menuId || ""),
          qty: Number(i.qty) || 0,
        }))
      : [];
    const result = await createFoodOrder({
      guestName: String(body.guestName || ""),
      phone: String(body.phone || ""),
      roomNumber: body.roomNumber ? String(body.roomNumber) : undefined,
      tableId: body.tableId ? String(body.tableId) : undefined,
      source: body.source || "online",
      items,
    });
    if (result.error || !result.order) {
      return NextResponse.json({ error: result.error || "Failed" }, { status: 400 });
    }
    return NextResponse.json({ order: result.order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
