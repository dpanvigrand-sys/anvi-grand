"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CounterBookingItem,
  CounterBookingStation,
} from "@/lib/counter-bookings";
import { stationSupportsCounterToast } from "@/lib/counter-bookings";

type Props = {
  stationId: CounterBookingStation;
  /** Poll interval ms (default 8s) */
  pollMs?: number;
  /** Compact quiet strip on hub/admin */
  quiet?: boolean;
};

type AckState = {
  since: string;
  seenIds: string[];
};

const ACK_PREFIX = "anvi-ops-counter-booking-ack";

function ackKey(station: CounterBookingStation) {
  return `${ACK_PREFIX}:${station}`;
}

function readAck(station: CounterBookingStation): AckState | null {
  try {
    const raw = localStorage.getItem(ackKey(station));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AckState;
    if (!parsed?.since || !Array.isArray(parsed.seenIds)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeAck(station: CounterBookingStation, state: AckState) {
  try {
    localStorage.setItem(ackKey(station), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function kindTone(kind: CounterBookingItem["kind"]) {
  if (kind === "room") return "bg-[var(--ag-red)]";
  if (kind === "food") return "bg-[var(--ag-maroon)]";
  return "bg-[#7a4a2a]";
}

/**
 * Calm bottom-left counter toast (~16×8 cm ≈ 600×300 CSS px).
 * Does not block the page — staff can keep working; OK dismisses the batch.
 */
export function CounterBookingToast({
  stationId,
  pollMs = 8000,
  quiet = false,
}: Props) {
  const [items, setItems] = useState<CounterBookingItem[]>([]);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  const supported = stationSupportsCounterToast(stationId);

  const fetchPending = useCallback(async () => {
    if (!supported) return;
    const ack = readAck(stationId);
    const params = new URLSearchParams({ station: stationId });
    if (ack?.since) params.set("since", ack.since);
    if (ack?.seenIds?.length) params.set("seen", ack.seenIds.join(","));
    try {
      const res = await fetch(`/api/ops/counter-bookings?${params}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        items: CounterBookingItem[];
        count: number;
      };
      setItems(data.items || []);
      setVisible((data.items || []).length > 0);
    } catch {
      /* keep last */
    } finally {
      setReady(true);
    }
  }, [stationId, supported]);

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await fetchPending();
    })();
    const id = window.setInterval(() => {
      void fetchPending();
    }, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [fetchPending, pollMs, supported]);

  const latest = items[0] ?? null;
  const count = items.length;

  const summaryLine = useMemo(() => {
    if (!latest) return "";
    if (count === 1) return latest.detail;
    return `${latest.detail} · +${count - 1} more`;
  }, [latest, count]);

  function onOk() {
    if (items.length === 0) {
      setVisible(false);
      return;
    }
    const newest = items.reduce((a, b) =>
      a.createdAt >= b.createdAt ? a : b,
    );
    const prev = readAck(stationId);
    const seenIds = Array.from(
      new Set([...(prev?.seenIds || []), ...items.map((i) => i.id)]),
    ).slice(-200);
    writeAck(stationId, { since: newest.createdAt, seenIds });
    setItems([]);
    setVisible(false);
  }

  if (!supported || !ready || !visible || !latest) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="New booking or order"
      className={
        quiet
          ? "pointer-events-auto fixed bottom-4 left-4 z-[80] w-[min(92vw,520px)] max-w-[520px] animate-counter-toast-in border border-[var(--ag-line)] bg-white/95 shadow-[0_8px_28px_rgba(60,20,10,0.14)] backdrop-blur-sm"
          : "pointer-events-auto fixed bottom-4 left-4 z-[80] w-[min(92vw,600px)] max-w-[600px] animate-counter-toast-in border border-[var(--ag-line)] bg-white shadow-[0_10px_32px_rgba(60,20,10,0.16)]"
      }
      style={{ maxHeight: quiet ? 220 : 300 }}
    >
      <div className={`h-1.5 w-full ${kindTone(latest.kind)}`} />
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ag-muted)]">
            New for counter
            {count > 1 ? (
              <span className="ml-2 rounded-sm bg-[#fff1f0] px-1.5 py-0.5 text-[var(--ag-red)]">
                {count} new
              </span>
            ) : null}
          </p>
          <h2 className="mt-1 font-display text-xl leading-tight text-[var(--ag-ink)] sm:text-2xl">
            {latest.label}
          </h2>
          <p className="mt-1 truncate text-sm font-medium text-[var(--ag-maroon)]">
            {latest.guestName}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ag-muted)]">{latest.time}</p>
          <p className="mt-2 line-clamp-2 text-sm text-[var(--ag-ink)]/85">
            {summaryLine}
          </p>
        </div>
        <div className="flex shrink-0 flex-col justify-end">
          <button
            type="button"
            onClick={onOk}
            className="min-w-[4.5rem] border border-[var(--ag-red)] bg-[var(--ag-red)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--ag-maroon)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ag-red)]"
          >
            OK
          </button>
        </div>
      </div>
    </aside>
  );
}
