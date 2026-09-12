import { NextResponse } from "next/server";
import { createRoomBooking } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createRoomBooking({
      roomId: String(body.roomId || ""),
      guestName: String(body.guestName || ""),
      email: String(body.email || ""),
      phone: String(body.phone || ""),
      address: body.address ? String(body.address) : undefined,
      checkIn: String(body.checkIn || ""),
      checkOut: String(body.checkOut || ""),
      guests: Number(body.guests) || 0,
      notes: body.notes ? String(body.notes) : undefined,
      advance: body.advance !== undefined ? Number(body.advance) : 0,
    });
    if (result.error || !result.booking) {
      return NextResponse.json({ error: result.error || "Failed" }, { status: 400 });
    }
    return NextResponse.json({ booking: result.booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
