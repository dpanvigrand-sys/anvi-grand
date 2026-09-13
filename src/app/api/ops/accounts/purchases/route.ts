import { NextResponse } from "next/server";
import { isPurchaseType } from "@/lib/accounts";
import {
  addPurchaseEntry,
  deletePurchaseEntry,
  updatePurchaseEntry,
} from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = isPurchaseType(String(body.type || "")) ? body.type : "other";
    const result = await addPurchaseEntry({
      date: body.date ? String(body.date) : new Date().toISOString().slice(0, 10),
      type,
      item: String(body.item || ""),
      vendor: String(body.vendor || ""),
      qty: Number(body.qty) || 0,
      unit: String(body.unit || "pcs"),
      amount: Number(body.amount) || 0,
      notes: body.notes ? String(body.notes) : undefined,
    });
    if (!result.entry.item || result.entry.amount <= 0) {
      return NextResponse.json({ error: "Item and amount required." }, { status: 400 });
    }
    return NextResponse.json({ entry: result.entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id || "");
    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
    const result = await updatePurchaseEntry(id, {
      date: body.date !== undefined ? String(body.date) : undefined,
      type: body.type !== undefined && isPurchaseType(String(body.type)) ? body.type : undefined,
      item: body.item !== undefined ? String(body.item) : undefined,
      vendor: body.vendor !== undefined ? String(body.vendor) : undefined,
      qty: body.qty !== undefined ? Number(body.qty) : undefined,
      unit: body.unit !== undefined ? String(body.unit) : undefined,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      notes: body.notes !== undefined ? String(body.notes) : undefined,
    });
    if (result.error || !result.entry) {
      return NextResponse.json({ error: result.error || "Not found" }, { status: 404 });
    }
    return NextResponse.json({ entry: result.entry });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id || "");
    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
    const result = await deletePurchaseEntry(id);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
