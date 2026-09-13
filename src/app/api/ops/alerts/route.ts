import { NextResponse } from "next/server";
import { buildOpsAlerts } from "@/lib/ops-alerts";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const ops = await getOps();
  const alerts = buildOpsAlerts(ops, ops.settings);
  return NextResponse.json({
    alerts,
    generatedAt: new Date().toISOString(),
    settings: {
      lowStockQty: ops.settings.lowStockQty,
      banquetReminderHours: ops.settings.banquetReminderHours,
    },
  });
}
