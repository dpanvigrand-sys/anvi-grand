import { NextResponse } from "next/server";
import { createBuffetBooking } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createBuffetBooking({
      buffetId: String(body.buffetId || ""),
      guestName: String(body.guestName || ""),
      phone: String(body.phone || ""),
      date: String(body.date || ""),
      guests: Number(body.guests) || 0,
    });
    if (result.error || !result.booking) {
      return NextResponse.json({ error: result.error || "Failed" }, { status: 400 });
    }
    return NextResponse.json({ booking: result.booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
