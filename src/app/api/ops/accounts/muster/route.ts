import { NextResponse } from "next/server";
import {
  addMusterEntry,
  deleteMusterEntry,
  updateMusterEntry,
} from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const status =
      body.status === "absent" || body.status === "half" ? body.status : "present";
    const result = await addMusterEntry({
      date: body.date ? String(body.date) : new Date().toISOString().slice(0, 10),
      staffName: String(body.staffName || ""),
      status,
      notes: body.notes ? String(body.notes) : undefined,
    });
    if (!result.entry.staffName) {
      return NextResponse.json({ error: "Staff name required." }, { status: 400 });
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
    const result = await updateMusterEntry(id, {
      date: body.date !== undefined ? String(body.date) : undefined,
      staffName: body.staffName !== undefined ? String(body.staffName) : undefined,
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
    const result = await deleteMusterEntry(id);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
