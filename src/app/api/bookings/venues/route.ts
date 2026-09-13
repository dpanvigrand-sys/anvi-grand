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
      address: body.address ? String(body.address) : undefined,
      functionDetails: body.functionDetails
        ? String(body.functionDetails)
        : undefined,
      withFood: Boolean(body.withFood),
      recommendPersonName: body.recommendPersonName
        ? String(body.recommendPersonName)
        : undefined,
      total: body.total != null ? Number(body.total) : undefined,
      advance: body.advance != null ? Number(body.advance) : undefined,
    });
    if (result.error || !result.booking) {
      return NextResponse.json({ error: result.error || "Failed" }, { status: 400 });
    }
    return NextResponse.json({ booking: result.booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
