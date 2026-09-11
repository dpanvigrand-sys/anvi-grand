import { NextResponse } from "next/server";
import { addStockMove } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const direction = body.direction === "outward" ? "outward" : "inward";
    const result = await addStockMove({
      direction,
      item: String(body.item || ""),
      quantity: Number(body.quantity) || 0,
      unit: String(body.unit || "pcs"),
      vendorOrDept: String(body.vendorOrDept || ""),
      notes: body.notes ? String(body.notes) : undefined,
    });
    if (!result.move.item || result.move.quantity < 1) {
      return NextResponse.json({ error: "Item and quantity required." }, { status: 400 });
    }
    return NextResponse.json({ move: result.move }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
