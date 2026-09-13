import Link from "next/link";
import { OpsAlerts } from "@/components/ops/ops-alerts";
import { buildOpsAlerts, filterAlertsForStation } from "@/lib/ops-alerts";
import {
  getStation,
  resolveStationLabel,
  type OpsStationDef,
} from "@/lib/ops-stations";
import type { OpsSettings, OpsStationId, OpsStore } from "@/lib/types";

export type StationAction = {
  href: string;
  title: string;
  te?: string;
  desc: string;
};

type Props = {
  stationId: OpsStationId;
  ops: OpsStore;
  settings?: OpsSettings;
  actions: StationAction[];
  children?: React.ReactNode;
  stats?: Array<{ label: string; value: string | number }>;
};

export function StationHome({
  stationId,
  ops,
  settings,
  actions,
  children,
  stats,
}: Props) {
  const station = getStation(stationId);
  const label = resolveStationLabel(station, settings || ops.settings);
  const alerts = filterAlertsForStation(
    buildOpsAlerts(ops, settings || ops.settings),
    stationId,
  );

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--ag-red)]">
        {station.clientLabel} · {label.te}
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--ag-ink)]">{label.en}</h1>
      <p className="mt-2 max-w-2xl text-[var(--ag-muted)]">
        {label.job}
        <span className="mt-1 block text-sm text-[var(--ag-maroon)]">{station.jobTe}</span>
      </p>

      <div className="mt-6">
        <OpsAlerts stationId={stationId} initialAlerts={alerts} />
      </div>

      {stats && stats.length > 0 ? (
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="border border-[var(--ag-line)] bg-white px-4 py-4"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--ag-muted)]">
                {s.label}
              </p>
              <p className="mt-1 font-display text-3xl text-[var(--ag-red)]">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group overflow-hidden border border-[var(--ag-line)] bg-white transition hover:border-[var(--ag-red)]"
          >
            <div className={`h-1.5 w-full ${(station as OpsStationDef).tone}`} />
            <div className="p-5">
              <h2 className="font-display text-2xl text-[var(--ag-ink)] group-hover:text-[var(--ag-red)]">
                {a.title}
              </h2>
              {a.te ? (
                <p className="mt-0.5 text-sm text-[var(--ag-red)]">{a.te}</p>
              ) : null}
              <p className="mt-2 text-sm text-[var(--ag-muted)]">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {children ? <div className="mt-10">{children}</div> : null}
    </div>
  );
}
