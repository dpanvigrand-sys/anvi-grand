import { NextResponse } from "next/server";
import { createContactMessage } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createContactMessage({
      name: String(body.name || ""),
      email: String(body.email || ""),
      phone: body.phone ? String(body.phone) : undefined,
      subject: String(body.subject || ""),
      message: String(body.message || ""),
    });
    if (result.error || !result.message) {
      return NextResponse.json({ error: result.error || "Failed" }, { status: 400 });
    }
    return NextResponse.json({ message: result.message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
