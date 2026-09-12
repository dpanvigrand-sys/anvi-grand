import { NextResponse } from "next/server";
import { addStockMove, updateStockMove } from "@/lib/store";

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
      amount: body.amount !== undefined ? Number(body.amount) : 0,
      advance: body.advance !== undefined ? Number(body.advance) : 0,
      balance: body.balance !== undefined ? Number(body.balance) : undefined,
      date: body.date ? String(body.date) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
    });
    if (!result.move.item || result.move.quantity <= 0) {
      return NextResponse.json({ error: "Item and quantity required." }, { status: 400 });
    }
    return NextResponse.json({ move: result.move }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }
    const result = await updateStockMove(id, {
      item: body.item !== undefined ? String(body.item) : undefined,
      quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
      unit: body.unit !== undefined ? String(body.unit) : undefined,
      vendorOrDept:
        body.vendorOrDept !== undefined ? String(body.vendorOrDept) : undefined,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      advance: body.advance !== undefined ? Number(body.advance) : undefined,
      balance: body.balance !== undefined ? Number(body.balance) : undefined,
      date: body.date !== undefined ? String(body.date) : undefined,
      notes: body.notes !== undefined ? String(body.notes) : undefined,
    });
    if (result.error || !result.move) {
      return NextResponse.json({ error: result.error || "Not found" }, { status: 404 });
    }
    return NextResponse.json({ move: result.move });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
