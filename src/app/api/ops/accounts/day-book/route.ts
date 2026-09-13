import { NextResponse } from "next/server";
import {
  addDayBookEntry,
  deleteDayBookEntry,
  updateDayBookEntry,
} from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await addDayBookEntry({
      date: body.date ? String(body.date) : undefined,
      voucherNo: String(body.voucherNo || ""),
      particular: String(body.particular || ""),
      debit: Number(body.debit) || 0,
      credit: Number(body.credit) || 0,
      balance: body.balance !== undefined ? Number(body.balance) : undefined,
      category: String(body.category || "Cash"),
      notes: body.notes ? String(body.notes) : undefined,
    });
    if (!result.entry.particular) {
      return NextResponse.json({ error: "Particular required." }, { status: 400 });
    }
    if (result.entry.debit <= 0 && result.entry.credit <= 0) {
      return NextResponse.json({ error: "Debit or credit required." }, { status: 400 });
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
    const result = await updateDayBookEntry(id, {
      date: body.date !== undefined ? String(body.date) : undefined,
      voucherNo: body.voucherNo !== undefined ? String(body.voucherNo) : undefined,
      particular: body.particular !== undefined ? String(body.particular) : undefined,
      debit: body.debit !== undefined ? Number(body.debit) : undefined,
      credit: body.credit !== undefined ? Number(body.credit) : undefined,
      balance: body.balance !== undefined ? Number(body.balance) : undefined,
      category: body.category !== undefined ? String(body.category) : undefined,
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
    const result = await deleteDayBookEntry(id);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
