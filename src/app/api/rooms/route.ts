import { NextResponse } from "next/server";
import { getRooms } from "@/lib/store";

export async function GET() {
  try {
    const rooms = await getRooms();
    return NextResponse.json({ rooms });
  } catch {
    return NextResponse.json(
      { error: "Unable to load rooms right now." },
      { status: 500 },
    );
  }
}
