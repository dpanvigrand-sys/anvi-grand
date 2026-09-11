import { NextResponse } from "next/server";
import { updateKitchenTicket } from "@/lib/store";
import type { KitchenTicket } from "@/lib/types";

const statuses: KitchenTicket["status"][] = ["queued", "cooking", "ready", "bumped"];

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = String(body.status || "") as KitchenTicket["status"];
    if (!statuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    const result = await updateKitchenTicket(id, status);
    if (result.error || !result.ticket) {
      return NextResponse.json({ error: result.error || "Failed" }, { status: 404 });
    }
    return NextResponse.json({ ticket: result.ticket });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
