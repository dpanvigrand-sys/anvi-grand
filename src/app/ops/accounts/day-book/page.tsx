import { DayBookAdmin } from "@/components/ops/accounts/day-book-admin";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function DayBookPage() {
  const ops = await getOps();
  return <DayBookAdmin initialRows={ops.dayBook} />;
}
