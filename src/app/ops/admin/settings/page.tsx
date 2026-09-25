import { OpeningPopupAdmin } from "@/components/ops/opening-popup-admin";
import { OpsSettingsForm } from "@/components/ops/ops-settings-form";
import { getHotel, getOpsSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function OpsSettingsPage() {
  const [settings, hotel] = await Promise.all([getOpsSettings(), getHotel()]);
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--ag-red)]">
        Admin.1 · Settings
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">
        Hotel + restaurant ops settings
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Guest website popup, name lines, alert thresholds, and optional station
        label overrides.
      </p>
      <div className="mt-8 space-y-8">
        <OpeningPopupAdmin initialHotel={hotel} />
        <OpsSettingsForm initial={settings} />
      </div>
    </div>
  );
}
