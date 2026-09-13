import { OpsSettingsForm } from "@/components/ops/ops-settings-form";
import { getOpsSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function OpsSettingsPage() {
  const settings = await getOpsSettings();
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--ag-red)]">
        Admin.1 · Settings
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">
        Hotel + restaurant ops settings
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        Name lines, alert thresholds, and optional station label overrides. Saved
        in <code>data/ops.json</code>.
      </p>
      <div className="mt-8">
        <OpsSettingsForm initial={settings} />
      </div>
    </div>
  );
}
