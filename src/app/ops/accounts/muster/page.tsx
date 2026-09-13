import { MusterAdmin } from "@/components/ops/accounts/muster-admin";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MusterPage() {
  const ops = await getOps();
  return <MusterAdmin initialRows={ops.muster} />;
}
