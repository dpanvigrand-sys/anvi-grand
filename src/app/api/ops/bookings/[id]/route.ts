import { NextResponse } from "next/server";
import { updateBookingRecord, updateRoomBookingStatus } from "@/lib/store";
import type { RoomBooking } from "@/lib/types";

const statuses: RoomBooking["status"][] = [
  "pending",
  "confirmed",
  "checked-in",
  "checked-out",
  "cancelled",
];

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.status) {
      const status = String(body.status || "") as RoomBooking["status"];
      if (!statuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      const result = await updateRoomBookingStatus(id, status);
      if (result.error || !result.booking) {
        return NextResponse.json({ error: result.error || "Failed" }, { status: 404 });
      }
      return NextResponse.json({ booking: result.booking });
    }

    const result = await updateBookingRecord(id, {
      guestName: body.guestName !== undefined ? String(body.guestName) : undefined,
      phone: body.phone !== undefined ? String(body.phone) : undefined,
      address: body.address !== undefined ? String(body.address) : undefined,
      advance: body.advance !== undefined ? Number(body.advance) : undefined,
      balance: body.balance !== undefined ? Number(body.balance) : undefined,
    });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({
      booking: result.booking,
      order: result.order,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
