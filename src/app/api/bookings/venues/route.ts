import { NextResponse } from "next/server";
import { createVenueBooking } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createVenueBooking({
      venueId: String(body.venueId || ""),
      guestName: String(body.guestName || ""),
      email: String(body.email || ""),
      phone: String(body.phone || ""),
      eventDate: String(body.eventDate || ""),
      guests: Number(body.guests) || 0,
      notes: body.notes ? String(body.notes) : undefined,
    });
    if (result.error || !result.booking) {
      return NextResponse.json({ error: result.error || "Failed" }, { status: 400 });
    }
    return NextResponse.json({ booking: result.booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
