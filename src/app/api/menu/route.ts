import { NextResponse } from "next/server";
import { getMenu } from "@/lib/store";

export async function GET() {
  try {
    const menu = await getMenu();
    return NextResponse.json({ menu });
  } catch {
    return NextResponse.json({ error: "Unable to load menu." }, { status: 500 });
  }
}
