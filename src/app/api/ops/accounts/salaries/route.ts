import { NextResponse } from "next/server";
import {
  addSalaryEntry,
  deleteSalaryEntry,
  updateSalaryEntry,
} from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await addSalaryEntry({
      month: body.month ? String(body.month) : new Date().toISOString().slice(0, 7),
      staffName: String(body.staffName || ""),
      basic: Number(body.basic) || 0,
      deductions: Number(body.deductions) || 0,
      net: body.net !== undefined ? Number(body.net) : undefined,
      status: body.status === "paid" ? "paid" : "pending",
      notes: body.notes ? String(body.notes) : undefined,
    });
    if (!result.entry.staffName || result.entry.basic <= 0) {
      return NextResponse.json({ error: "Staff name and basic required." }, { status: 400 });
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
    const result = await updateSalaryEntry(id, {
      month: body.month !== undefined ? String(body.month) : undefined,
      staffName: body.staffName !== undefined ? String(body.staffName) : undefined,
      basic: body.basic !== undefined ? Number(body.basic) : undefined,
      deductions: body.deductions !== undefined ? Number(body.deductions) : undefined,
      net: body.net !== undefined ? Number(body.net) : undefined,
      status: body.status,
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
    const result = await deleteSalaryEntry(id);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
