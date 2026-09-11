import { NextResponse } from "next/server";
import { addLedgerEntry } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const kind = body.kind === "expense" ? "expense" : "income";
    const result = await addLedgerEntry({
      kind,
      category: String(body.category || "general"),
      description: String(body.description || ""),
      amount: Number(body.amount) || 0,
      refId: body.refId ? String(body.refId) : undefined,
    });
    if (!result.entry.amount || !result.entry.description) {
      return NextResponse.json({ error: "Amount and description required." }, { status: 400 });
    }
    return NextResponse.json({ entry: result.entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
