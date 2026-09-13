import { AccountsHub } from "@/components/ops/accounts/accounts-hub";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AccountsHubPage() {
  const ops = await getOps();
  return (
    <AccountsHub
      counts={{
        dayBook: ops.dayBook.length,
        ledger: ops.dayBook.length + ops.ledger.length,
        muster: ops.muster.length,
        salaries: ops.salaries.length,
        purchases: ops.purchases.length,
      }}
    />
  );
}
