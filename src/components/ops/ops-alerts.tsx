"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { OpsAlert } from "@/lib/ops-alerts";
import type { OpsStationId } from "@/lib/types";

type Props = {
  stationId: OpsStationId | "hub";
  /** Server-rendered alerts (preferred); client also refreshes */
  initialAlerts?: OpsAlert[];
  /** Show modal popup on mount when critical/warn alerts exist */
  popup?: boolean;
};

const DISMISS_KEY = "anvi-ops-alert-dismiss";

function severityClass(s: OpsAlert["severity"]) {
  if (s === "critical") return "border-[var(--ag-red)] bg-[#fff1f0]";
  if (s === "warn") return "border-[#b45309] bg-[#fff7ed]";
  return "border-[var(--ag-line)] bg-white";
}

export function OpsAlerts({ stationId, initialAlerts = [], popup = true }: Props) {
  const [alerts, setAlerts] = useState<OpsAlert[]>(initialAlerts);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`${DISMISS_KEY}:${stationId}`);
      if (raw) setDismissed(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, [stationId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ops/alerts", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { alerts: OpsAlert[] };
        if (cancelled) return;
        const filtered =
          stationId === "hub"
            ? data.alerts
            : data.alerts.filter((a) => a.stations.includes(stationId));
        setAlerts(filtered);
      } catch {
        /* keep SSR */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stationId]);

  const visible = useMemo(
    () => alerts.filter((a) => !dismissed.has(a.id)),
    [alerts, dismissed],
  );

  const popupAlerts = useMemo(
    () => visible.filter((a) => a.severity === "critical" || a.severity === "warn"),
    [visible],
  );

  useEffect(() => {
    if (!popup) return;
    if (popupAlerts.length === 0) return;
    const key = `anvi-ops-popup-seen:${stationId}:${popupAlerts.map((a) => a.id).join(",")}`;
    try {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    setShowModal(true);
  }, [popup, popupAlerts, stationId]);

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        sessionStorage.setItem(
          `${DISMISS_KEY}:${stationId}`,
          JSON.stringify([...next]),
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function dismissAll() {
    setDismissed((prev) => {
      const next = new Set(prev);
      visible.forEach((a) => next.add(a.id));
      try {
        sessionStorage.setItem(
          `${DISMISS_KEY}:${stationId}`,
          JSON.stringify([...next]),
        );
      } catch {
        /* ignore */
      }
      return next;
    });
    setShowModal(false);
  }

  if (visible.length === 0 && !showModal) return null;

  return (
    <>
      {visible.length > 0 ? (
        <div className="mb-6 border border-[var(--ag-red)] bg-[linear-gradient(90deg,#fff5f4_0%,#ffffff_60%)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ag-line)] px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-red)]">
              Alerts ({visible.length})
            </p>
            <button
              type="button"
              onClick={dismissAll}
              className="text-xs uppercase tracking-wider text-[var(--ag-muted)] hover:text-[var(--ag-red)]"
            >
              Dismiss all
            </button>
          </div>
          <ul className="divide-y divide-[var(--ag-line)]">
            {visible.map((a) => (
              <li
                key={a.id}
                className={`flex flex-wrap items-start justify-between gap-3 px-4 py-3 ${severityClass(a.severity)}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--ag-ink)]">{a.title}</p>
                  <p className="mt-1 text-sm text-[var(--ag-muted)]">{a.detail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={a.href}
                    className="border border-[var(--ag-red)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ag-red)] hover:bg-[var(--ag-red)] hover:text-white"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => dismiss(a.id)}
                    className="px-2 py-1.5 text-xs text-[var(--ag-muted)] hover:text-[var(--ag-ink)]"
                    aria-label={`Dismiss ${a.title}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {showModal && popupAlerts.length > 0 ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ops-alert-modal-title"
        >
          <div className="max-h-[85vh] w-full max-w-lg overflow-auto border-4 border-[var(--ag-red)] bg-white shadow-xl">
            <div className="bg-[linear-gradient(90deg,#6b0000_0%,#8b0000_50%,#990000_100%)] px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.18em] text-white/80">
                ANVI OPS · Attention
              </p>
              <h2 id="ops-alert-modal-title" className="mt-1 font-display text-2xl">
                Action needed
              </h2>
              <p className="text-sm text-white/85">Please review the alerts below.</p>
            </div>
            <ul className="divide-y divide-[var(--ag-line)] p-2">
              {popupAlerts.map((a) => (
                <li key={a.id} className="px-3 py-3">
                  <p className="font-medium text-[var(--ag-ink)]">{a.title}</p>
                  <p className="text-sm text-[var(--ag-muted)]">{a.detail}</p>
                  <Link
                    href={a.href}
                    className="mt-2 inline-block text-sm font-semibold text-[var(--ag-red)] underline"
                    onClick={() => setShowModal(false)}
                  >
                    Go →
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2 border-t border-[var(--ag-line)] px-4 py-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="border border-[var(--ag-line)] px-4 py-2 text-sm hover:border-[var(--ag-red)]"
              >
                Keep bar
              </button>
              <button
                type="button"
                onClick={dismissAll}
                className="bg-[var(--ag-red)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--ag-maroon)]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
