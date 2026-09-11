import { NextResponse } from "next/server";
import { addStockMove } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await addStockMove(body);
    return NextResponse.json({ move: result.move }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid stock move." }, { status: 400 });
  }
}
