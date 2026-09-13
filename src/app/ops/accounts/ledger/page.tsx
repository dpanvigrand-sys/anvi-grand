import { LedgerAdmin } from "@/components/ops/accounts/ledger-admin";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  const ops = await getOps();
  return <LedgerAdmin dayBook={ops.dayBook} ledger={ops.ledger} />;
}
