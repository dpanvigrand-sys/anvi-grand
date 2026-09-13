import { NextResponse } from "next/server";
import { getOpsSettings, updateOpsSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getOpsSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const settings = await updateOpsSettings({
      hotelNameLine:
        body.hotelNameLine != null ? String(body.hotelNameLine) : undefined,
      foodBrandLine:
        body.foodBrandLine != null ? String(body.foodBrandLine) : undefined,
      opsPasswordNote:
        body.opsPasswordNote != null ? String(body.opsPasswordNote) : undefined,
      lowStockQty:
        body.lowStockQty != null ? Number(body.lowStockQty) : undefined,
      banquetReminderHours:
        body.banquetReminderHours != null
          ? Number(body.banquetReminderHours)
          : undefined,
      stationLabels: body.stationLabels || undefined,
    });
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
  }
}
