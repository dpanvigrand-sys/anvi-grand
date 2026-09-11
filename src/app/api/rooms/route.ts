import { NextResponse } from "next/server";
import { getRooms } from "@/lib/store";

export async function GET() {
  const rooms = await getRooms();
  return NextResponse.json({ rooms });
}
