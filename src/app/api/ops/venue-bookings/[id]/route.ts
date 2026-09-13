import { NextResponse } from "next/server";
import { updateVenueBooking } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const result = await updateVenueBooking(id, {
      guestName: body.guestName != null ? String(body.guestName) : undefined,
      phone: body.phone != null ? String(body.phone) : undefined,
      email: body.email != null ? String(body.email) : undefined,
      address: body.address != null ? String(body.address) : undefined,
      eventDate: body.eventDate != null ? String(body.eventDate) : undefined,
      guests: body.guests != null ? Number(body.guests) : undefined,
      functionDetails:
        body.functionDetails != null ? String(body.functionDetails) : undefined,
      withFood: body.withFood != null ? Boolean(body.withFood) : undefined,
      recommendPersonName:
        body.recommendPersonName != null
          ? String(body.recommendPersonName)
          : undefined,
      total: body.total != null ? Number(body.total) : undefined,
      advance: body.advance != null ? Number(body.advance) : undefined,
      balance: body.balance != null ? Number(body.balance) : undefined,
      notes: body.notes != null ? String(body.notes) : undefined,
      status: body.status,
    });
    if (result.error || !result.booking) {
      return NextResponse.json({ error: result.error || "Failed" }, { status: 400 });
    }
    return NextResponse.json({ booking: result.booking });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
