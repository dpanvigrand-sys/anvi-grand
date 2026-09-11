import { NextResponse } from "next/server";
import { updateRoomBookingStatus } from "@/lib/store";
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
    const status = String(body.status || "") as RoomBooking["status"];
    if (!statuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    const result = await updateRoomBookingStatus(id, status);
    if (result.error || !result.booking) {
      return NextResponse.json({ error: result.error || "Failed" }, { status: 404 });
    }
    return NextResponse.json({ booking: result.booking });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
