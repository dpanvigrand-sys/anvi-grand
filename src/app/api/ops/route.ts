import { NextResponse } from "next/server";
import { getOps } from "@/lib/store";

export async function GET() {
  const ops = await getOps();
  return NextResponse.json(ops);
}
