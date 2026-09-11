import { NextResponse } from "next/server";
import { updateTableStatus } from "@/lib/store";
import type { DiningTable } from "@/lib/types";

const statuses: DiningTable["status"][] = ["free", "occupied", "billing", "reserved"];

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = String(body.status || "") as DiningTable["status"];
    if (!statuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    const result = await updateTableStatus(id, status);
    if (result.error || !result.table) {
      return NextResponse.json({ error: result.error || "Failed" }, { status: 404 });
    }
    return NextResponse.json({ table: result.table });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
