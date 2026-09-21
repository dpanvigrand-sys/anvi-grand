"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Any CMS / data / build update → all open live screens refresh automatically.
 * Polls /api/live-stamp; on change calls router.refresh(). Also refreshes on
 * tab focus/visibility.
 */
export function LiveDataRefresh({
  intervalMs = 5_000,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    let lastStamp = "";
    let lastRefreshAt = 0;
    let stopped = false;

    const refresh = () => {
      const now = Date.now();
      if (now - lastRefreshAt < 2_500) return;
      lastRefreshAt = now;
      try {
        router.refresh();
      } catch {
        /* ignore */
      }
    };

    const poll = async () => {
      if (stopped) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      try {
        const res = await fetch(`/api/live-stamp?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { stamp?: string };
        const stamp = data.stamp || "";
        if (!stamp) return;
        if (!lastStamp) {
          lastStamp = stamp;
          return;
        }
        if (stamp !== lastStamp) {
          lastStamp = stamp;
          refresh();
        }
      } catch {
        /* offline / tunnel blip */
      }
    };

    const onVis = () => {
      if (document.visibilityState === "visible") {
        void poll();
        refresh();
      }
    };
    const onFocus = () => {
      void poll();
      refresh();
    };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    void poll();
    const id = window.setInterval(() => void poll(), intervalMs);

    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, [router, intervalMs]);

  return null;
}
