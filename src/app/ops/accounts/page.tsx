import { AccountsHub } from "@/components/ops/accounts/accounts-hub";
import { OpsAlerts } from "@/components/ops/ops-alerts";
import { buildOpsAlerts, filterAlertsForStation } from "@/lib/ops-alerts";
import { getOps } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AccountsHubPage() {
  const ops = await getOps();
  const alerts = filterAlertsForStation(buildOpsAlerts(ops, ops.settings), "accounts");

  return (
    <div>
      <OpsAlerts stationId="accounts" initialAlerts={alerts} />
      <AccountsHub
        counts={{
          dayBook: ops.dayBook.length,
          ledger: ops.dayBook.length + ops.ledger.length,
          muster: ops.muster.length,
          salaries: ops.salaries.length,
          purchases: ops.purchases.length,
        }}
      />
    </div>
  );
}
