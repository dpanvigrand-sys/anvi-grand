import { SalariesAdmin } from "@/components/ops/accounts/salaries-admin";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SalariesPage() {
  const ops = await getOps();
  return <SalariesAdmin initialRows={ops.salaries} />;
}
