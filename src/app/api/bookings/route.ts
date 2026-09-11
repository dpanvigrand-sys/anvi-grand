import { NextResponse } from "next/server";
import { createBooking, getBookings } from "@/lib/store";
import type { CreateBookingInput } from "@/lib/types";

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json(
      { error: "Unable to load bookings." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateBookingInput;
    const result = await createBooking(body);
    if (result.error || !result.booking) {
      return NextResponse.json(
        { error: result.error ?? "Booking failed." },
        { status: 400 },
      );
    }
    return NextResponse.json({ booking: result.booking }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid booking request." },
      { status: 400 },
    );
  }
}
